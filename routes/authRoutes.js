const express=require('express');
const router=express.Router();
const authController=require('../controllers/authController');
const validationMiddleware=require('../middlewares/validationMiddleware');
const {validateRegisterUser,validateLoginUser}=require('../validator/authValidator');
router.post('/register',validateRegisterUser,validationMiddleware,authController.register);
router.post('/login',validateLoginUser,validationMiddleware,authController.login);
router.post('/logout',authController.logout);
module.exports=router;