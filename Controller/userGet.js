const { executeQueryPost, userIdFunction, getValidationRegexes } = require('../Route/commonFiles');
const path = require('path');
const fs = require('fs');



const userGet = async (req, res) => {
  const { type, user_id  } = req.query;

  if (!type) {
    return res.status(200).json({
      Response: {
        Success: '0',
        Message: 'Please provide type to fetch data.',
      },
    });
  }

  if (!['S', 'A', 'V', 'U'].includes(type)) {
    return res.status(200).json({
      Response: {
        Success: '0',
        Message: 'Invalid type provided.',
      },
    });
  }

  const EcomImageUrl = "http://localhost:3500/uploads/";

  const formatUserData = (userData) =>
    userData.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      name: item.name,
      profile: item.profile ? `${EcomImageUrl}${item.profile}` : null,
      mobile: item.mobile,
      email: item.email,
      address: item.address,
      city: item.city,
      state: item.state,
      pincode: item.pincode,
      role: item.role,
      access_level: item.access_level,
      status: item.status,
    }));



  try {
    let query = `SELECT id, user_id, name,profile,mobile,email,address,city,state,pincode,role,access_level,status FROM users WHERE `;
    let queryParams = [];

    if (type === 'U' || type === 'V') {
      if (!user_id) {
        return res.status(200).json({
          Response: {
            Success: '0',
            Message: 'Please provide the user id.',
          },
        });
      }

      query += `user_id = ? AND role = ?`;
      queryParams.push(user_id, type);
    }
    else if (type === 'S') {
      if (user_id) {
        query += `user_id = ? AND role IN ('U', 'V', 'S')`;
        queryParams.push(user_id);
      } else {
        query = `SELECT * FROM users WHERE role IN ('U', 'V', 'S')`;
      }
    }
    else if (type === 'A') {
      if (user_id) {
        query += `user_id = ?`;
        queryParams.push(user_id);
      } else {
        query = `SELECT * FROM users`;
      }
    }

    const userResult = await executeQueryPost(query, queryParams);

    if (userResult.length === 0) {
      return res.status(200).json({
        Response: {
          Success: '0',
          Message: 'User data not found.',
        },
      });
    }

    const formattedData = formatUserData(userResult);

    return res.status(200).json({
      Response: {
        Success: '1',
        Message: 'Successfully fetched user data.',
        Result: formattedData,
      },
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({
      Response: {
        Success: '0',
        Message: 'An error occurred while processing your request.',
      },
    });
  }
}





module.exports = { userGet };