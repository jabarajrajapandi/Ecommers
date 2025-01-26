const db = require('../Route/connection');

function getUser(uId) {
    const selectSql = 'SELECT id, user_id, role FROM users WHERE user_id = ? AND status = 1';
    return new Promise((resolve, reject) => {
        db.query(selectSql, [uId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

function getCategory(catId) {
    const selectSql = 'SELECT * FROM category WHERE id = ?';
    return new Promise((resolve, reject) => {
        db.query(selectSql, [catId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

function updateCategory(catId, updateFields, uId) {
    const fields = Object.keys(updateFields)
        .map((key) => `${key} = ?`)
        .join(', ');
    const values = [...Object.values(updateFields), uId, catId];

    const updateSql = `UPDATE category SET ${fields}, updated_by = ? WHERE id = ?`;
    return new Promise((resolve, reject) => {
        db.query(updateSql, values, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

function getCategoryByName(category_name) {
    const selectSql = 'SELECT * FROM category WHERE category_name = ?';
    return new Promise((resolve, reject) => {
        db.query(selectSql, [category_name], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}


module.exports = {
    getUser,
    getCategoryByName,
    getCategory,
    updateCategory
};
