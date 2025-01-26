const { executeQueryPost, userIdFunction, getValidationRegexes } = require('../Route/commonFiles');
const path = require('path');
const fs = require('fs');

const userUpdate = async (req, res) => {
  try {
    const {
      type, user_id, name, mobile, password, email, address, city, state, pincode, status, staff_id, admin_id
    } = req.body;

    const profile = req.files?.profile || {};
    const missingFields = [];
    let allowedFields = [];
    let userData = [];
    let imageName;

    const { nameRegex, passwordRegex, mobileRegex, emailRegex } = getValidationRegexes();



    if (!type) {
      return res.status(200).json({
        Response: {
          Success: '0',
          Message: 'Please provide type to update profile.'
        }
      });
    }

    if (!['S', 'A', 'V', 'U'].includes(type)) {
      return res.status(200).json({
        Response: {
          Success: '0',
          Message: 'You are not allowed to perform this process with the given type.'
        }
      });
    }


    const requiredFields = (type) => {
      if (type === 'U' || type === 'V') {
        return { user_id: true };
      } else if (type === 'S') {
        return { user_id: true, staff_id: true };
      } else if (type === 'A') {
        return { user_id: true, admin_id: true };
      } else {
        return {};
      }
    };


    for (const [key, value] of Object.entries(requiredFields(type))) {
      if (!value) missingFields.push(key);
    }


    if (missingFields.length > 0) {
      return res.status(200).json({
        Response: {
          Success: '0',
          Message: `Missing required fields: ${missingFields.join(', ')}`
        }
      });
    }

    if (email && !emailRegex.test(email)) {
      return res.status(400).json({
        Response: {
          Success: '0',
          Message: 'Please provide a valid email.'
        }
      });
    }


    if (mobile && !mobileRegex.test(mobile)) {
      return res.status(200).json({
        Response: {
          Success: '0',
          Message: 'Please provide a valid mobile number.'
        }
      });
    }


    if (password && !passwordRegex.test(password)) {
      return res.status(200).json({
        Response: {
          Success: '0',
          Message: 'Password must contain at least one uppercase letter, one lowercase letter, and one special character.'
        }
      });
    }


    if (mobile) {
      const checkMobileQuery = `SELECT * FROM users WHERE mobile = ? AND user_id != ?`;
      const checkMobileParams = [mobile, user_id];
      const mobileResult = await executeQueryPost(checkMobileQuery, checkMobileParams);

      if (mobileResult.length > 0) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'This mobile number has already been used by another user, so please try again with a new mobile number.'
          }
        });
      }
    }





    if (type == 'U' || type == 'V') {
      allowedFields = ["user_id", "name", "profile", "mobile", "password", "email", "address", "city", "state", "pincode", "status"];

      const checkUserQuery = `SELECT * FROM users WHERE user_id = ?`;
      const checkUserfParams = [user_id,];
      const userResult = await executeQueryPost(checkUserQuery, checkUserfParams);

      if (userResult.length === 0) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'User data not found for this id.'
          }
        });
      }
      const userFRole = userResult[0].role;
      const userFStatus = userResult[0].status;
      if (type !== userFRole) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'User role type is mismatched.'
          }
        });
      }

      if (userFStatus == '0') {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'Your account is inactive. Please contact customer care to avtivate your account.'
          }
        });
      }

      userData = userResult;
    }




    if (type == 'S') {
      allowedFields = ["user_id", "name", "profile", "mobile", "password", "email", "address", "city", "state", "pincode", "status"];


      if (!staff_id) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'Please provide your staff id to update the profile.'
          }
        });
      }

      if (!user_id) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'Please provide user id to update the profile.'
          }
        });
      }

      const checkStaffQuery = `SELECT * FROM users WHERE user_id = ?`;
      const checkStaffParams = [staff_id];
      const staffResult = await executeQueryPost(checkStaffQuery, checkStaffParams);

      if (staffResult.length === 0) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'Please provide user id to update the profile.'
          }
        });
      }

      const staffRole = staffResult[0].role;
      const staffStatus = staffResult[0].status;
      console.log("staff data :", staffResult[0]);
      if (staffRole !== 'S') {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'Your not a valid staff..'
          }
        });
      }
      if (staffStatus == '0') {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'You cant update this profile. Because your staff account is deactivated. Please contact admin to activate your account.'
          }
        });
      }

      const checkUserQuery = `SELECT * FROM users WHERE user_id = ?`;
      const checkUserParams = [user_id];
      const userResult_staff = await executeQueryPost(checkUserQuery, checkUserParams);

      if (userResult_staff.length === 0) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'User data not found for this id'
          }
        });
      }


      console.log("user role :", userResult_staff[0].role);
      const userRole = userResult_staff[0].role;
      if (userRole == 'A') {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'You are not allowd to update a admin profile.'
          }
        });
      }

      if (userRole == "S" && (staff_id !== userResult_staff[0].user_id)) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'You are not allowd to update another staff profile.'
          }
        });
      }

      userData = userResult_staff;
    }




    if (type == 'A') {
      allowedFields = ["user_id", "name", "profile", "mobile", "password", "email", "address", "city", "state", "pincode", "status"];

      if (!admin_id) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'Please provide your admin id to update the profile.'
          }
        });
      }

      if (!user_id) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'Please provide user id to update the profile.'
          }
        });
      }

      const checkAdminQuery = `SELECT * FROM users WHERE user_id = ? AND role = ?`;
      const checkAdminParams = [admin_id, 'A'];
      const adminResult = await executeQueryPost(checkAdminQuery, checkAdminParams);

      if (adminResult.length === 0) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'Admin not found for this id.'
          }
        });
      }

      const checkUserQuery = `SELECT * FROM users WHERE user_id = ?`;
      const checkUserParams = [user_id];
      const userResult_admin = await executeQueryPost(checkUserQuery, checkUserParams);

      if (userResult_admin.length === 0) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'User data not found for this id.'
          }
        });
      }

      userData = userResult_admin;
    }



    console.log("user data new ::::>>>", userData[0].user_id);
    const oldLogo = userData[0].profile;
    const oldPassword = userData[0].password;


    let encodedPassword = oldPassword;
    if (password) {
      encodedPassword = Buffer.from(password).toString('base64');
      console.log("encodedPassword :", encodedPassword);
    }


    const updateFields = {
      user_id,
      name,
      profile: imageName ? imageName : null,
      mobile,
      password: encodedPassword,
      email,
      address,
      city,
      state,
      pincode,
      status,
    };




    if (profile && profile.name) {
      const profileImage_name = `${Date.now()}_${profile.name}`;
      imageName = profileImage_name;
      const profileImage_Path = path.join(__dirname, '../', 'uploads', profileImage_name);

      profile.mv(profileImage_Path, (err) => {
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

      updateFields.profile = imageName;
    }


    const filteredUpdateFields = Object.fromEntries(
      Object.entries(updateFields).filter(([key, value]) => allowedFields.includes(key) && value !== undefined)
    );

    console.log("filteredUpdateFields :", filteredUpdateFields);

    if (Object.keys(filteredUpdateFields).length === 0) {
      return res.status(200).json({
        Response: { Success: '0', Message: 'No valid fields provided for update.' }
      });
    }

    const setClause = Object.keys(filteredUpdateFields).map((key) => `${key} = ?`).join(', ');
    const updateParams = Object.values(filteredUpdateFields);


    const updateBusQuery = `
    UPDATE users 
    SET ${setClause} 
    WHERE user_id = ?
  `;
    updateParams.push(userData[0].user_id);


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

module.exports = { userUpdate };