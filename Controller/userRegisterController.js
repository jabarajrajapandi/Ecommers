const {executeQueryPost, userIdFunction, getValidationRegexes } = require('../Route/commonFiles');
const path = require('path');

const registerUser = async (req, res) => {
  try {
    const { vendor_Id, user_Id, staff_Id } = userIdFunction();
    const { nameRegex, passwordRegex, mobileRegex, emailRegex } = getValidationRegexes();
    const type = req.body.type;


    if (type === 'S') {
      const adminId = req.body.adminId;
      const name = req.body.name;
      const mobile = req.body.mobile;
      const password = req.body.password;
      const { nameRegex, passwordRegex, mobileRegex } = getValidationRegexes();

      if (!name || !mobile || !password) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: `Missing required fields: ${!name ? 'Name, ' : ''}${!mobile ? 'Mobile, ' : ''}${!password ? 'Password' : ''}`.replace(/,\s*$/, '')
          }
        });
      }


      if (!nameRegex.test(name) || !mobileRegex.test(mobile) || !passwordRegex.test(password)) {
        return res.status(400).json({
          Response: {
            success: '0',
            message: !nameRegex.test(name)
              ? 'Please provide a valid name (only alphabets and spaces).'
              : !mobileRegex.test(mobile)
                ? 'Please provide a valid mobile number starting with 6, 7, 8, or 9.'
                : 'Password must contain at least one uppercase letter, one lowercase letter, and one special character.'
          }
        });
      }


      const encodedPassword = Buffer.from(password).toString('base64');

      const checkAdminQuery = `SELECT * FROM users WHERE user_id = ?`;
      const checkAdminParams = [adminId];
      const adminResult = await executeQueryPost(checkAdminQuery, checkAdminParams);

      if (adminResult.length === 0) {
        return res.status(404).json({
          Response: {
            Success: '0',
            Message: 'Admin ID does not exist.'
          }
        });
      }

      const checkMobileQuery = `SELECT * FROM users WHERE mobile = ?`;
      const checkMobileParams = [mobile];
      const mobileResult = await executeQueryPost(checkMobileQuery, checkMobileParams);

      if (mobileResult.length > 0) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: 'This mobile number is already registered.'
          }
        });
      }

      const insertStaffQuery = `
    INSERT INTO users (user_id, name, mobile, password, role, access_level)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
      const insertStaffParams = [staff_Id, name, mobile, encodedPassword, 'S', 2];
      const insertStaffResult = await executeQueryPost(insertStaffQuery, insertStaffParams);

      if (insertStaffResult.affectedRows === 0) {
        return res.status(500).json({
          Response: {
            Success: '0',
            Message: 'Error while adding staff.'
          }
        });
      }

      return res.status(200).json({
        Response: {
          Success: '1',
          Message: `Successfully added a staff.`,
          Result: staff_Id
        }
      });
    }


    if (type === 'V') {
      const {
        name, password, business_name, business_mobile, business_email, business_address,
        business_city, business_state, business_pincode,
        accountNum, ifsc, bankName, bankBranch, upi_ID, staff_id
      } = req.body;

      const { business_logo, passBook } = req.files || {};
      const missingFields = [];

      const requiredFields = {
        name, password, business_name, business_mobile, business_email, business_address,
        business_city, business_state, business_pincode,
        accountNum, ifsc, bankName, bankBranch, upi_ID,
        business_logo, passBook
      };

      for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) missingFields.push(key);
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: `Missing required fields: ${missingFields.join(', ')}`
          }
        });
      }

      if (!nameRegex.test(name)) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: 'Please provide a valid name (only alphabets and spaces).'
          }
        });
      }

      if (!mobileRegex.test(business_mobile)) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: 'Please provide a valid mobile number starting with 6, 7, 8, or 9.'
          }
        });
      }

      if (!emailRegex.test(business_email)) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: 'Please provide a valid mobile number starting with 6, 7, 8, or 9.'
          }
        });
      }

      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: 'Password must contain at least one uppercase letter, one lowercase letter, and one special character.'
          }
        });
      }

      const encodedPassword = Buffer.from(password).toString('base64');

      const checkBusQuery = `
        (SELECT 'business' AS source, business_mobile FROM business WHERE business_mobile = ?) 
        UNION 
        (SELECT 'users' AS source, mobile FROM users WHERE mobile = ?)
      `;
      const checkBusParams = [business_mobile, business_mobile];
      const existingBusiness = await executeQueryPost(checkBusQuery, checkBusParams);

      if (existingBusiness.length > 0) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: 'Business mobile number already exists in the system.'
          }
        });
      }


      const timestamp = new Date().getTime();
      const business_logo_name = business_logo ? timestamp + '_' + business_logo.name : null;
      const business_logo_Path = business_logo_name ? path.join(__dirname, '../', 'uploads', business_logo_name) : null;
      const passBook_name = passBook ? timestamp + '_' + passBook.name : null;
      const passBook_Path = passBook_name ? path.join(__dirname, '../', 'uploads', passBook_name) : null;

      business_logo.mv(business_logo_Path, (err) => {
        if (err) {
          return res.status(200).json({
            Response: {
              Success: '0',
              Message: 'Execution Error: ' + err.message
            }
          });
        }
      });

      passBook.mv(passBook_Path, (err) => {
        if (err) {
          return res.status(200).json({
            Response: {
              Success: '0',
              Message: 'Execution Error: ' + err.message
            }
          });
        }
      });


      const created_by = staff_id ? staff_id : vendor_Id;
      const approved_by = staff_id ? staff_id : null;
      const managed_by = staff_id ? staff_id : null;
      const status = staff_id ? 1 : 0;
      const approved_status = staff_id ? 1 : 0;

      const insertUserQuery = `
        INSERT INTO users (user_id, name, mobile, password, role, access_level, address, city, state, pincode, email, profile)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const insertUserParams = [
        vendor_Id, name, business_mobile, encodedPassword, 'V', 2,
        business_address, business_city, business_state, business_pincode, business_email, business_logo_name
      ];

      const insertUserResult = await executeQueryPost(insertUserQuery, insertUserParams);

      const insertBusinessQuery = `
        INSERT INTO business (vendor_id, business_name, business_mobile, business_email, business_address, business_city, 
          business_state, business_pincode, account_number, ifsc, bank_branch, upi_id, created_by, 
          approved_by, managed_by, status, approved_status, business_logo, passbook_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const insertBusinessParams = [
        vendor_Id, business_name, business_mobile, business_email, business_address,
        business_city, business_state, business_pincode, accountNum, ifsc,
        bankBranch, upi_ID, created_by, approved_by, managed_by, status, approved_status, business_logo_name, passBook_name
      ];

      const insertBusinessResult = await executeQueryPost(insertBusinessQuery, insertBusinessParams);

      if (insertUserResult.affectedRows === 0 || insertBusinessResult.affectedRows === 0) {
        return res.status(500).json({
          Response: {
            Success: '0',
            Message: 'Error while adding staff.'
          }
        });
      }

      return res.json({
        Response: {
          Success: '1',
          Message: 'Vendor registered successfully.',
          Result: vendor_Id
        }
      });
    }







    // =============>>>> Handle type 'U' <<<<============

    if (type === 'U') {
      const { mobile, password } = req.body;

      const missingFields = [];
      const requiredFields = { mobile, password };

      for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) missingFields.push(key);
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: `Missing required fields: ${missingFields.join(', ')}`
          }
        });
      }

      if (!mobileRegex.test(mobile)) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: 'Please provide a valid mobile number starting with 6, 7, 8, or 9.'
          }
        });
      }

      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: 'Password must contain at least one uppercase letter, one lowercase letter, and one special character.'
          }
        });
      }


      const checkMobileQuery = `SELECT * FROM users WHERE mobile = ?`;
      const checkMobileParams = [mobile];
      const mobileResult = await executeQueryPost(checkMobileQuery, checkMobileParams);

      if (mobileResult.length > 0) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: 'This mobile number is already registered.'
          }
        });
      }

      const encodedPassword = Buffer.from(password).toString('base64');


      const insertUserQuery = `
        INSERT INTO users (user_id, mobile, password, role, access_level)
        VALUES (?, ?, ?, ?, ?)
      `;

      const insertUserParams = [
        user_Id, mobile, encodedPassword, 'U', 3
      ];

      const insertUserResult = await executeQueryPost(insertUserQuery, insertUserParams);

      if (insertUserResult.affectedRows === 0) {
        return res.status(500).json({
          Response: {
            Success: '0',
            Message: 'Error while regsitering user.'
          }
        });
      }

      return res.json({
        Response: {
          Success: '1',
          Message: 'User registered successfully.',
          Result: user_Id
        }
      });
    }


    return res.status(400).json({
      Response: {
        Success: '0',
        Message: 'Please provide a valid type (V, U or S).'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      Response: {
        Success: '0',
        Message: 'Internal server error.'
      }
    });
  }
};

module.exports = { registerUser };






