const db = require('../Route/connection');


function getUser(uId) {
    const selectSql = 'SELECT id, user_id, role FROM users WHERE user_id = ? AND status = 1';
    return new Promise((resolve, reject) => {
        db.query(selectSql, [uId], (error, results) => {
            if (error) return reject(error);
            if (results.length === 0) {
                return reject(new Error('User not found or inactive.'));
            }
            resolve(results[0]);
        });
    });
}


function getCategoriesByRole(uId, page, limit) {
    return new Promise((resolve, reject) => {
        getUser(uId)
            .then((user) => {
                let selectSql, countSql;
                const offset = (page - 1) * limit;

                if (user.role === 'A' || user.role === 'S') {
                    selectSql = `SELECT * FROM category LIMIT ? OFFSET ?`;
                    countSql = `SELECT COUNT(*) AS total FROM category`;
                } else if (user.role === 'U' || user.role === 'V') {
                    selectSql = `SELECT * FROM category WHERE status = 1 LIMIT ? OFFSET ?`;
                    countSql = `SELECT COUNT(*) AS total FROM category WHERE status = 1`;
                } else {
                    return reject(new Error('Invalid role.'));
                }

                db.query(countSql, (countError, countResult) => {
                    if (countError) return reject(countError);
                    const totalRecords = countResult[0].total;

                    db.query(selectSql, [limit, offset], (error, results) => {
                        if (error) return reject(error);
                        resolve({ categories: results, totalRecords });
                    });
                });
            })
            .catch(reject); 
    });
}

module.exports = {
    getUser,
    getCategoriesByRole
};
