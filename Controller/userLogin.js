const { executeQueryPost, userIdFunction, getValidationRegexes } = require('../Route/commonFiles');
const path = require('path');

const registerLogin = async (req, res) => {
  try {
  const { nameRegex, passwordRegex, mobileRegex, emailRegex } = getValidationRegexes();

  const type = req.body.type;
  const mobile = req.body.mobile;
  const password = req.body.password;

  const userData = [];
  const missingFields = [];
  const requiredFields = { type, mobile, password };

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


  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      Response: {
        Success: '0',
        Message: 'Password must contain at least one uppercase letter, one lowercase letter, and one special character.'
      }
    });
  }


  const checkQuery = `SELECT * FROM users WHERE mobile = ?`;
  const checkParams = [mobile];
  const userResult = await executeQueryPost(checkQuery, checkParams);

  if (userResult.length === 0) {
    return res.status(200).json({
      Response: {
        Success: '0',
        Message: 'No user data found for this mobile number. please register first.'
      }
    });
  }

  userRole = userResult[0].role;
  let userRoleType;
  console.log("userRole :", userRole);
  if (type !== userRole) {
    return res.status(200).json({
      Response: {
        Success: '0',
        Message: 'You have provided a invalid type.'
      }
    });
  } else {
    userRoleType = type
  }

  const decryptedPassword = Buffer.from(userResult[0].password, 'base64').toString('utf-8');

  if (password !== decryptedPassword) {
    return res.status(200).json({
      Response: {
        Success: '0',
        Message: 'You have entered a invalid password. Please try again.'
      }
    });
  }

  if (userResult[0].status == '0') {
    return res.status(200).json({
      Response: {
        Success: '0',
        Message: 'Your account has been inactive. please contact customer care (8877665544).'
      }
    });
  }

  if (userResult[0].role !== 'V') {
    userData.push(userResult[0]);
  } else {
    const checkBusQuery = `SELECT * FROM business WHERE vendor_id = ?`;
    const checkBusParams = [userResult[0].user_id];
    const busResult = await executeQueryPost(checkBusQuery, checkBusParams);

    if (busResult.length === 0) {
      console.log("No businesss data found for this vendor id.");
      userData.push(userResult[0]);
    }
    userData.push({ userData: userResult[0], businessData: busResult[0] });
  }



  return res.status(200).json({
    Response: {
      Success: '1',
      Message: 'You have successfully logged in.',
      Access_level: userRoleType,
      Result: userData
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
}



module.exports = { registerLogin };

