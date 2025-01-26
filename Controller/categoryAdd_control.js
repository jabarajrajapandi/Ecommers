const categoryModel = require('../Model/categoryAdd_model');

async function addcategory(req, res) {
    try {
        const { category_name, uId } = req.body;

        if (!category_name || !uId) {
            return res.status(200).json({
                Response: {
                    Status: '0',
                    Message: 'Category name and user ID are required.'
                }
            });
        }

        const userResult = await categoryModel.getUser(uId);
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

        const categoryResult = await categoryModel.getCategory(category_name);
        if (categoryResult.length > 0) {
            return res.status(200).json({
                Response: {
                    Status: '0',
                    Message: 'Category name already exists.'
                }
            });
        }

        const date = new Date();
        await categoryModel.insertStatus(category_name, uId, date);

        return res.status(200).json({
            Response: {
                Status: '1',
                Message: 'Category inserted successfully.'
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

module.exports = { addcategory };
