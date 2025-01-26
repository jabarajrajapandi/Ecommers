const {
    getUser,
    getCategoryByName,
    getBusinessByVendor,
    getBusinessByManager,
    getProductsWithDetails,
    countProducts,
} = require('../Model/product_get_model');

async function fetchProducts(req, res) {
    const { uId } = req.query;
    const { keywords, category_name, id, business_id, page = 1, limit = 10 } = req.query; 

    if (!uId) {
        return res.status(400).json({
            Response: {
                Status: '0',
                Message: 'uId is a mandatory field.',
            },
        });
    }

    try {
        const user = await getUser(uId);
        if (!user) {
            return res.status(404).json({
                Response: {
                    Status: '0',
                    Message: 'User not found.',
                },
            });
        }
        const role = user.role;

        let query = `
            SELECT 
                p.*, 
                b.business_name, 
                b.vendor_id, 
                b.managed_by, 
                c.category_name 
            FROM 
                product p
            LEFT JOIN 
                business b ON p.business_id = b.id
            LEFT JOIN 
                category c ON p.category = c.id
            WHERE 1 = 1
        `;
        const queryParams = [];

        if (role === 'A') {
        } else if (role === 'U') {
            query += ' AND p.expire_sts = 0 AND p.status = 1';
        } else if (role === 'V') {
            const businesses = await getBusinessByVendor(uId);
            const businessIds = businesses.map((b) => b.id);
            if (businessIds.length === 0) {
                return res.status(200).json({
                    Response: { Status: '1', Data: [], Message: 'No products found.' },
                });
            }
            query += ` AND p.business_id IN (${businessIds.join(',')})`;
        } else if (role === 'S') {
            const businesses = await getBusinessByManager(uId);
            const businessIds = businesses.map((b) => b.id);
            if (businessIds.length === 0) {
                return res.status(200).json({
                    Response: { Status: '1', Data: [], Message: 'No products found.' },
                });
            }
            query += ` AND p.business_id IN (${businessIds.join(',')})`;
        } else {
            return res.status(403).json({
                Response: {
                    Status: '0',
                    Message: 'Invalid role.',
                },
            });
        }

        if (keywords) {
            query += ' AND (p.product_name LIKE ? OR p.description LIKE ?)';
            queryParams.push(`%${keywords}%`, `%${keywords}%`);
        }
        if (category_name) {
            const category = await getCategoryByName(category_name);
            if (category.length === 0) {
                return res.status(404).json({
                    Response: {
                        Status: '0',
                        Message: 'Category not found.',
                    },
                });
            }
            query += ' AND p.category = ?';
            queryParams.push(category[0].id);
        }
        if (id) {
            query += ' AND p.prod_id = ?';
            queryParams.push(id);
        }
        if (business_id) {
            query += ' AND p.business_id = ?';
            queryParams.push(business_id);
        }

        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), parseInt(offset));

        const products = await getProductsWithDetails(query, queryParams);

        const countQuery = query.replace('SELECT p.*, b.business_name, b.vendor_id, b.managed_by, c.category_name', 'SELECT COUNT(*) as total').split(' LIMIT')[0];
        const totalResult = await countProducts(countQuery, queryParams.slice(0, -2));
        const total = totalResult[0]?.total || 0;

        return res.status(200).json({
            Response: {
                Status: '1',
                Message: 'Products fetched successfully.',
                Data: products,
                Pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalRecords: total,
                },
              
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            Response: {
                Status: '0',
                Message: 'Internal server error.',
                Error: error.message,
            },
        });
    }
}

module.exports = {
    fetchProducts,
};
