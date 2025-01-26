const { executeQueryPost, userIdFunction, getValidationRegexes } = require('../Route/commonFiles');
const path = require('path');
const fs = require('fs');

const busUpdate = async (req, res) => {
  try{
    const {
      type, busId, business_name, business_email, business_address,
      business_city, business_state, business_pincode,
      accountNum, ifsc, bankName, bankBranch, upi_ID, staff_id, admin_id, vendor_id, status, approved_status, approved_by, managed_by
    } = req.body;


    const logo = req.files?.logo || {};
    const passBook = req.files?.passBook || {};
    const missingFields = [];
    let allowedFields = [];
    const requiredFields = { type, busId };

    const { nameRegex, passwordRegex, mobileRegex, emailRegex } = getValidationRegexes();

    if (business_email && !emailRegex.test(business_email)) {
      return res.status(400).json({
        Response: {
          Success: '0',
          Message: 'Please provide a valid email.'
        }
      });
    }

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

    if (!['S', 'A', 'V'].includes(type)) {
      return res.status(400).json({
        Response: {
          Success: '0',
          Message: 'You are not allowed to perform this process with the given type.'
        }
      });
    }


    if ((!staff_id && !admin_id && !vendor_id) || (staff_id && admin_id)) {
      return res.status(400).json({
        Response: {
          Success: '0',
          Message: 'You must provide exactly one of staff_id, admin_id, or vendor_id.'
        }
      });
    }

    const checkBusQuery = `SELECT * FROM business WHERE id = ?`;
    const checkBusParams = [busId];
    const busResult = await executeQueryPost(checkBusQuery, checkBusParams);

    if (busResult.length === 0) {
      return res.status(400).json({
        Response: {
          Success: '0',
          Message: 'No business found for this id.'
        }
      });
    }


    console.log("busResult :::>>>", busResult[0]?.managed_by);
    const busVendorId = busResult[0].vendor_id;
    const busStaffId = busResult[0]?.managed_by;
    const oldLogo = busResult[0].business_logo;
    const oldPassbook = busResult[0].passbook_image;

    if (type == "V") {
      if (!vendor_id) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'Please provided your vendor id.'
          }
        });
      }

      const checkVendorQuery = `SELECT * FROM users WHERE user_id = ? AND role = ? AND status = ?`;
      const checkVendorParams = [vendor_id, "V", 1];
      const vendorResult = await executeQueryPost(checkVendorQuery, checkVendorParams);

      if (vendorResult.length === 0) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: 'No vendor found for this id.'
          }
        });
      }

      if (vendor_id !== busVendorId) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'You are not allowed to update this business. your vendor id is mismatched.'
          }
        });
      }

      allowedFields = ["business_name", "business_email", "business_address",
        "business_city", "business_state", "business_pincode", "account_number", "ifsc",
        "bank_name", "bank_branch", "upi_id", "business_logo", "passbook_image"];
    }




    if (type == "S") {
      if (!staff_id) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'Please provided your staff id.'
          }
        });
      }

      const checkStaffQuery = `SELECT * FROM users WHERE user_id = ? AND role = ? AND status = ?`;
      const checkStaffParams = [staff_id, "S", 1];
      const staffResult = await executeQueryPost(checkStaffQuery, checkStaffParams);

      if (staffResult.length === 0) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: 'No staff found for this id.'
          }
        });
      }

      if (!busStaffId) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: 'You are not allowed to update this business. because this business is not yet assigned for anyone.'
          }
        });
      }

      if (busStaffId !== staff_id) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: 'You are not allowed to update this business. you are not assigned for this business.'
          }
        });
      }
      console.log("new busStaffId :", busStaffId);


      allowedFields = ["business_name", "business_email", "business_address",
        "business_city", "business_state", "business_pincode", "account_number", "ifsc",
        "bank_name", "bank_branch", "upi_id", "status", "approved_status", "approved_by", "managed_by",
        "business_logo", "passbook_image"];
    }


    if (type == "A") {
      if (!admin_id) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'Please provided your admin id.'
          }
        });
      }

      const checkAdminQuery = `SELECT * FROM users WHERE user_id = ? AND role = ? AND status = ?`;
      const checkAdminParams = [admin_id, "A", 1];
      const adminResult = await executeQueryPost(checkAdminQuery, checkAdminParams);

      if (adminResult.length === 0) {
        return res.status(400).json({
          Response: {
            Success: '0',
            Message: 'No admin found for this id.'
          }
        });
      }


      allowedFields = ["business_name", "business_email", "business_address",
        "business_city", "business_state", "business_pincode", "account_number", "ifsc",
        "bank_name", "bank_branch", "upi_id", "status", "approved_status", "approved_by", "managed_by",
        "business_logo", "passbook_image"];
    }



    const updateFields = {
      business_name,
      business_email,
      business_address,
      business_city,
      business_state,
      business_pincode,
      account_number: accountNum,
      ifsc,
      bank_name: bankName,
      bank_branch: bankBranch,
      upi_id: upi_ID,
      status,
      approved_status,
      approved_by,
      managed_by,
      business_logo: logo.filename,
      passbook_image: passBook.filename
    };




    if (logo && logo.name) {
      const logo_name = `${Date.now()}_${logo.name}`;
      const logo_Path = path.join(__dirname, '../', 'uploads', logo_name);

      logo.mv(logo_Path, (err) => {
        if (err) {
          return res.status(500).json({
            Response: { Success: '0', Message: 'Error uploading logo: ' + err.message }
          });
        }

        if (oldLogo) {
          const oldLogoPath = path.join(__dirname, '../', 'uploads', oldLogo);
          fs.unlink(oldLogoPath, (unlinkErr) => {
            if (unlinkErr && unlinkErr.code !== 'ENOENT') {
              console.error('Error deleting old logo:', unlinkErr);
            }
          });
        }
      });

      updateFields.business_logo = logo_name;
    }


    if (passBook && passBook.name) {
      const passBook_name = `${Date.now()}_${passBook.name}`;
      const passBook_Path = path.join(__dirname, '../', 'uploads', passBook_name);

      passBook.mv(passBook_Path, (err) => {
        if (err) {
          return res.status(500).json({
            Response: { Success: '0', Message: 'Error uploading passbook: ' + err.message }
          });
        }

        if (oldPassbook) {
          const oldPassbookPath = path.join(__dirname, '../', 'uploads', oldPassbook);
          fs.unlink(oldPassbookPath, (unlinkErr) => {
            if (unlinkErr && unlinkErr.code !== 'ENOENT') {
              console.error('Error deleting old passbook:', unlinkErr);
            }
          });
        }
      });

      updateFields.passbook_image = passBook_name;
    }




    const filteredUpdateFields = Object.fromEntries(
      Object.entries(updateFields).filter(([key, value]) => allowedFields.includes(key) && value !== undefined)
    );

    if (Object.keys(filteredUpdateFields).length === 0) {
      return res.status(200).json({
        Response: { Success: '0', Message: 'No valid fields provided for update.' }
      });
    }

    const setClause = Object.keys(filteredUpdateFields).map((key) => `${key} = ?`).join(', ');
    const updateParams = Object.values(filteredUpdateFields);


    const updateBusQuery = `
    UPDATE business 
    SET ${setClause} 
    WHERE id = ?
  `;
    updateParams.push(busId);


    const updateBusResult = await executeQueryPost(updateBusQuery, updateParams);

    if (updateBusResult.affectedRows === 0) {
      return res.status(200).json({
        Response: { Success: '0', Message: 'Error while updating business information.' }
      });
    }

    return res.status(200).json({
      Response: { Success: '1', Message: 'Business information updated successfully.' }
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

module.exports = { busUpdate };