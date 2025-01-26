const { getUser, getBusinessById, updateProduct } = require('../Model/product_update_model');

async function updateProductController(req, res) {
    const { prod_id, user_id, business_id, product_name, description, old_price, new_price, scheduled_date, expire_date, delivery_charges, free_delivery_sts, expire_sts, status } = req.body;

    if (!prod_id || !user_id || !business_id) {
        return res.status(400).json({
            Response: {
                Status: '0',
                Message: 'Mandatory fields (prod_id, user_id, business_id) are missing.',
            },
        });
    }

    try {
        const user = await getUser(user_id);
        if (!user) {
            return res.status(404).json({
                Response: {
                    Status: '0',
                    Message: 'User not found.',
                },
            });
        }

        if (user.role === 'U') {
            return res.status(403).json({
                Response: {
                    Status: '0',
                    Message: 'You are not authorized to update products.',
                },
            });
        }

        const business = await getBusinessById(business_id);
        if (!business) {
            return res.status(404).json({
                Response: {
                    Status: '0',
                    Message: 'Business not found.',
                },
            });
        }

        const updateData = {};
        if (product_name) updateData.product_name = product_name;
        if (description) updateData.description = description;
        if (old_price) updateData.old_price = old_price;
        if (new_price) updateData.new_price = new_price;
        if (scheduled_date) updateData.scheduled_date = scheduled_date;
        if (expire_date) updateData.expire_date = expire_date;
        if (delivery_charges) updateData.delivery_charges = delivery_charges;
        if (free_delivery_sts !== undefined) updateData.free_delivery_sts = free_delivery_sts;
        if (expire_sts !== undefined) updateData.expire_sts = expire_sts;
        if (status !== undefined) updateData.status = status;
        updateData.updated_at = new Date();

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                Response: {
                    Status: '0',
                    Message: 'No fields to update.',
                },
            });
        }

        const updateResult = await updateProduct(prod_id, updateData);
        if (updateResult.affectedRows === 0) {
            return res.status(404).json({
                Response: {
                    Status: '0',
                    Message: 'Product not found or no changes made.',
                },
            });
        }

        return res.status(200).json({
            Response: {
                Status: '1',
                Message: 'Product updated successfully.',
            },
        });
    } catch (error) {
        console.error('Error updating product:', error.message);
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
    updateProductController,
};
