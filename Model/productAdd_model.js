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

function getCategoryByName(categoryName) {
  const selectSql = 'SELECT id FROM category WHERE category_name = ? AND cat_status = 1';
  return new Promise((resolve, reject) => {
    db.query(selectSql, [categoryName], (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
}












function getBusinessByVendor(businessId, vendorId) {
  const selectSql = 'SELECT * FROM business WHERE id = ? AND vendor_id = ? and approved_status=1 and status=1';
  return new Promise((resolve, reject) => {
    db.query(selectSql, [businessId, vendorId], (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
}

function getBusinessByManager(businessId, managerId) {
  const selectSql = 'SELECT * FROM business WHERE id = ? AND managed_by = ? and status=1 and approved_status=1';
  return new Promise((resolve, reject) => {
    db.query(selectSql, [businessId, managerId], (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
}

function insertProduct(productData) {
  const insertSql = `
        INSERT INTO product 
        (business_id, category, product_name, description, image, old_price, new_price, scheduled_date, expire_date, delivery_charges, free_delivery_sts, expire_sts, status, created_by, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  return new Promise((resolve, reject) => {
    db.query(insertSql, [
      productData.business_id,
      productData.cat_id || null,
      productData.product_name || null,
      productData.description || null,
      JSON.stringify(productData.images) || null,
      productData.old_price || null,
      productData.new_price || null,
      productData.scheduled_date || null,
      productData.expire_date || null,
      productData.delivery_charges || null,
      productData.free_delivery_sts || 0,
      productData.expire_sts || 0,
      productData.status || 1,
      productData.created_by || null,
      productData.created_at || new Date()
    ], (error, results) => {
      if (error) {
        console.error('SQL Error:', error.sqlMessage);
        return reject(error);
      }
      resolve(results);
    });
  });
}


module.exports = {
  getUser,
  getCategoryByName,
  getBusinessByVendor,
  getBusinessByManager,
  insertProduct
};
