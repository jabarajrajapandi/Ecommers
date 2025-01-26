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





function getBusinessRecordsByRole(uId, page, limit) {
    return new Promise((resolve, reject) => {
        getUser(uId)
            .then((user) => {
                let selectSql, countSql;
                const offset = (page - 1) * limit;

                if (user.role === 'A') {
                    selectSql = `SELECT * FROM business LIMIT ? OFFSET ?`;
                    countSql = `SELECT COUNT(*) AS total FROM business`;
                } else if (user.role === 'S') {
                    selectSql = `SELECT * FROM business WHERE managed_by = ? LIMIT ? OFFSET ?`;
                    countSql = `SELECT COUNT(*) AS total FROM business WHERE managed_by = ?`;
                } else if (user.role === 'V') {
                    selectSql = `SELECT * FROM business WHERE vendor_id = ? LIMIT ? OFFSET ?`;
                    countSql = `SELECT COUNT(*) AS total FROM business WHERE vendor_id = ?`;
                }else if (user.role === 'U') {
                    return reject(new Error('You are not allowed to see this record.'));
                }
                 else {
                    return reject(new Error('Invalid role.'));
                }

                db.query(countSql, user.role === 'A' ? [] : [uId], (countError, countResult) => {
                    if (countError) return reject(countError);
                    const totalRecords = countResult[0].total;

                    db.query(selectSql, user.role === 'A' ? [limit, offset] : [uId, limit, offset], (error, results) => {
                        if (error) return reject(error);
                        resolve({ businessRecords: results, totalRecords });
                    });
                });
            })
            .catch(reject); 
    });
}

module.exports = {
    getUser,
    getBusinessRecordsByRole
};
