const categoryUpdateModel = require('../Model/categoryUpdate_model');

async function updateCategory(req, res) {
    try {
        const { uId, catId, category_name, sts } = req.body;

        if (!uId || !catId) {
            return res.status(200).json({
                Response: {
                    Status: '0',
                    Message: 'Category ID and user ID are mandatory.'
                }
            });
        }

        const userResult = await categoryUpdateModel.getUser(uId);
        if (userResult.length === 0) {
            return res.status(200).json({
                Response: {
                    Status: '0',
                    Message: 'User not found.'
                }
            });
        }

        const role = userResult[0].role;
        if (!['A', 'S'].includes(role)) {
            return res.status(200).json({
                Response: {
                    Status: '0',
                    Message: 'Access denied for this user.'
                }
            });
        }

        const categoryResult = await categoryUpdateModel.getCategory(catId);
        if (categoryResult.length === 0) {
            return res.status(200).json({
                Response: {
                    Status: '0',
                    Message: 'Category record not found.'
                }
            });
        }

        const updateFields = {};
        if (category_name != undefined){
        const existingCategory = await categoryUpdateModel.getCategoryByName(category_name);
        if (existingCategory.length > 0) {
            return res.status(409).json({
                Response: {
                    Status: '0',
                    Message: `Category name already exists.`
                }
            });
        }

        updateFields.category_name = category_name;
    }


         
        if (sts != undefined) {
            if (!['0', '1'].includes(sts)) {
                return res.status(200).json({
                    Response: {
                        Status: '0',
                        Message: 'Invalid status. Status must be 0 or 1.'
                    }
                });
            }
            updateFields.cat_status = sts;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(200).json({
                Response: {
                    Status: '0',
                    Message: 'No valid fields provided for update.'
                }
            });
        }

        const updateResult = await categoryUpdateModel.updateCategory(catId, updateFields, uId);
        if (updateResult.affectedRows === 0) {
            return res.status(200).json({
                Response: {
                    Status: '0',
                    Message: 'Failed to update category.'
                }
            });
        }

        return res.status(200).json({
            Response: {
                Status: '1',
                Message: 'Category updated successfully.'
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            Response: {
                Status: '0',
                Message: 'Internal server error.'
            }
        });
    }
}

module.exports = {
    updateCategory
};
