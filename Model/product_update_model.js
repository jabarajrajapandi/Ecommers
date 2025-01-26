const db = require('../Route/connection');

function getUser(user_id) {
    const query = 'SELECT user_id, role FROM users WHERE user_id = ? AND status = 1';
    return new Promise((resolve, reject) => {
        db.query(query, [user_id], (error, results) => {
            if (error) return reject(error);
            resolve(results[0]);
        });
    });
}

function getBusinessById(business_id) {
    const query = 'SELECT id FROM business WHERE id = ? AND status = 1';
    return new Promise((resolve, reject) => {
        db.query(query, [business_id], (error, results) => {
            if (error) return reject(error);
            resolve(results[0]);
        });
    });
}

function updateProduct(prod_id, updateData) {
    const setFields = [];
    const values = [];

    for (const field in updateData) {
        setFields.push(`${field} = ?`);
        values.push(updateData[field]);
    }

    const query = `
        UPDATE product
        SET ${setFields.join(', ')}
        WHERE prod_id = ?
    `;
    values.push(prod_id);

    return new Promise((resolve, reject) => {
        db.query(query, values, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

module.exports = {
    getUser,
    getBusinessById,
    updateProduct,
};





