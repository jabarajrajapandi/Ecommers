const db = require('../Route/connection');

function executeQueryPost(query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}


const generateRandomNumber = (length) => {
  return Math.floor(Math.random() * Math.pow(10, length));
};

const userIdFunction = () => {
  const staff_Id = `ECS${generateRandomNumber(5)}`;
  const user_Id = `ECU${generateRandomNumber(5)}`;
  const vendor_Id = `ECV${generateRandomNumber(5)}`;

  return { staff_Id, user_Id, vendor_Id };
};

const getValidationRegexes = () => {
  const nameRegex = /^[A-Za-z\s]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


  return { nameRegex, passwordRegex, mobileRegex, emailRegex };
};

module.exports = { userIdFunction, getValidationRegexes };




module.exports = { executeQueryPost, userIdFunction, getValidationRegexes };
