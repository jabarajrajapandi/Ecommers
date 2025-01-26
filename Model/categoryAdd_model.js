const db = require('../Route/connection');

function getUser(uId) {
    const selectSql = 'SELECT id, user_id, role FROM users WHERE user_id = ? and status=1';
    return new Promise((resolve, reject) => {
        db.query(selectSql, [uId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

function getCategory(category_name) {
    const selectSql = 'SELECT * FROM category WHERE category_name = ?';
    return new Promise((resolve, reject) => {
        db.query(selectSql, [category_name], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

function insertStatus(category_name, uId, date) {
    const insertSql = `INSERT INTO category (category_name, cat_status, created_by, created_at, updated_by) VALUES (?, ?, ?, ?, ?)`;
    return new Promise((resolve, reject) => {
        db.query(insertSql, [category_name, 1, uId, date, uId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

module.exports = { getUser, getCategory, insertStatus };
