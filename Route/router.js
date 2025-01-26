const express = require('express');
const router = express.Router();

const addcategory = require('../Controller/categoryAdd_control');
router.post('/addCategory', addcategory.addcategory);


const updatecategory = require('../Controller/categoryUpdate_control');
router.post('/updateCategory', updatecategory.updateCategory);

const { getCategories } = require('../Controller/categoryGet_control');
router.get('/categories', getCategories);

const { getBusinessRecords } = require('../Controller/businessGet_control');
router.get('/business', getBusinessRecords);

const addProduct = require('../Controller/productAdd_control');
router.post('/addProduct', addProduct.addProduct)


const updateProduct = require('../Controller/product_update_control');
router.post('/updateProduct', updateProduct.updateProductController)


const { registerUser } = require('../Controller/userRegisterController');
router.post('/Eregister', registerUser);

const { registerLogin } = require('../Controller/userLogin');
router.post('/Elogin', registerLogin);

const { busUpdate } = require('../Controller/busUpdateController');
router.post('/EbusUpdate', busUpdate);

const { userUpdate } = require('../Controller/userUpdate');
router.post('/EuserUpdate', userUpdate);

const { userGet } = require('../Controller/userGet');
router.get('/EuserGet', userGet);



module.exports = router;

