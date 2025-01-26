const db = require('../Route/connection');

function getUser(uId) {
    const query = 'SELECT id, user_id, role FROM users WHERE user_id = ? AND status = 1';
    return new Promise((resolve, reject) => {
        db.query(query, [uId], (error, results) => {
            if (error) return reject(error);
            resolve(results[0]);
        });
    });
}

function getCategoryByName(categoryName) {
    const query = 'SELECT id FROM category WHERE category_name = ? AND cat_status = 1';
    return new Promise((resolve, reject) => {
        db.query(query, [categoryName], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

function getBusinessByVendor(vendorId) {
    const query = 'SELECT id FROM business WHERE vendor_id = ? AND status = 1 AND approved_status = 1';
    return new Promise((resolve, reject) => {
        db.query(query, [vendorId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

function getBusinessByManager(managerId) {
    const query = 'SELECT id FROM business WHERE managed_by = ? AND status = 1 AND approved_status = 1';
    return new Promise((resolve, reject) => {
        db.query(query, [managerId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

function getProductsWithDetails(query, params) {
    return new Promise((resolve, reject) => {
        db.query(query, params, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

function countProducts(query, params) {
    return new Promise((resolve, reject) => {
        db.query(query, params, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
}

module.exports = {
    getUser,
    getCategoryByName,
    getBusinessByVendor,
    getBusinessByManager,
    getProductsWithDetails,
    countProducts,
};
