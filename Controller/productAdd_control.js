const { getUser, getCategoryByName, getBusinessByVendor, getBusinessByManager, insertProduct } = require('../Model/productAdd_model');
const path = require('path');

async function addProduct(req, res) {
    const {
        business_id,
        category,
        product_name,
        description,
        old_price,
        new_price,
        scheduled_date,
        delivery_charges,
        free_delivery_sts,
        expire_sts = 0,
        status = 1,
        uId
    } = req.body;

    const images = req.files ? req.files.images : null;

    if (!business_id || !category || !product_name || !description || !old_price || !new_price || !scheduled_date || !uId) {
        return res.status(200).json({
            Response: {
                Status: '0',
                Message: 'Mandatory fields are missing.'
            }
        });
    }

    if (!images || !Array.isArray(images) || images.length > 4) {
        return res.status(200).json({
            Response: {
                Status: '0',
                Message: 'Images should be an array with a maximum of 4 items.'
            }
        });
    }

    const uploadedImages = [];

    for (const imageFile of images) {
        const imageName = imageFile.name;
        const imageExt = path.extname(imageName).toLowerCase();

        if (!['.jpg', '.jpeg', '.png'].includes(imageExt)) {
            return res.status(200).json({
                Response: {
                    Status: '0',
                    Message: 'Invalid image extension. Supported extensions: jpg, jpeg, png.'
                }
            });
        }

        const timestamp = Date.now();
        const tempImageName = `${timestamp}_${imageName}`;
        const imagePath = path.join(__dirname, '..', 'uploads', tempImageName);

        try {
            await imageFile.mv(imagePath); 
            uploadedImages.push(tempImageName); 
        } catch (error) {
            return res.status(200).json({
                Response: {
                    Status: '0',
                    Message: 'Error saving one of the image files.'
                }
            });
        }
    }

    try {
        const user = await getUser(uId);

        if (!['A', 'S', 'U', 'V'].includes(user.role)) {
            return res.status(200).json({
                Response: {
                    Status: '0',
                    Message: 'You do not have access to use this table.'
                }
            });
        }

        if (user.role === 'U') {
            return res.status(403).json({
                Response: {
                    Status: '0',
                    Message: 'You are not allowed to insert a product.'
                }
            });
        } else if (user.role === 'V') {
            const business = await getBusinessByVendor(business_id, uId);
            if (business.length === 0) {
                return res.status(200).json({
                    Response: {
                        Status: '0',
                        Message: 'Vendor not found for the specified business.'
                    }
                });
            }
        } else if (user.role === 'S') {
            const business = await getBusinessByManager(business_id, uId);
            if (business.length === 0) {
                return res.status(200).json({
                    Response: {
                        Status: '0',
                        Message: 'Manager not found for the specified business.'
                    }
                });
            }
        }

        const categoryResult = await getCategoryByName(category);
        if (categoryResult.length === 0) {
            return res.status(404).json({ status: '0', message: 'Category not found.' });
        }
        const cat_id = categoryResult[0].id;

        const currentDate = new Date();
        const expire_date = new Date(scheduled_date);
        expire_date.setDate(expire_date.getDate() + 7);

        const productData = {
            business_id,
            cat_id,
            product_name,
            description,
            images: JSON.stringify(uploadedImages),
            old_price: old_price ? parseFloat(old_price).toFixed(2) : 0,
            new_price: new_price ? parseFloat(new_price).toFixed(2) : 0,
            scheduled_date: new Date(scheduled_date),
            expire_date,
            delivery_charges: delivery_charges ? parseFloat(delivery_charges).toFixed(2) : 0,
            free_delivery_sts: free_delivery_sts || 0,
            expire_sts,
            status,
            created_by: uId,
            created_at: currentDate,
            updated_at: currentDate
        };

        await insertProduct(productData);

        return res.status(201).json({
            status: '1',
            message: 'Product added successfully.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: '0',
            message: 'Internal server error.',
            error: error.message
        });
    }
}


module.exports = {
    addProduct
};