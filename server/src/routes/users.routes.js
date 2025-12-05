const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/avatar');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const { authUser, authAdmin, asyncHandler } = require('../auth/checkAuth');

const controllerUser = require('../controller/users.controller');

router.post('/register', asyncHandler(controllerUser.registerUser));
router.post('/login', asyncHandler(controllerUser.loginUser));
router.get('/auth', authUser, asyncHandler(controllerUser.authUser));
router.get('/refresh-token', asyncHandler(controllerUser.refreshToken));
router.get('/logout', authUser, asyncHandler(controllerUser.logout));
router.post('/update-info-user', authUser, upload.single('avatar'), asyncHandler(controllerUser.updateInfoUser));
router.post('/login-google', asyncHandler(controllerUser.loginGoogle));
router.post('/forgot-password', asyncHandler(controllerUser.forgotPassword));
router.post('/reset-password', asyncHandler(controllerUser.resetPassword));
router.post('/update-user', authUser, asyncHandler(controllerUser.updateUser));
router.post('/update-password', authUser, asyncHandler(controllerUser.updatePassword));
router.get('/admin', asyncHandler(controllerUser.getUserByAdmin));
router.post('/update-role-user', asyncHandler(controllerUser.updateRoleUser));
router.post('/chatbot', authUser, asyncHandler(controllerUser.chatbot));
router.get('/chatbot', authUser, asyncHandler(controllerUser.getChatbot));

router.get('/api/admin', authAdmin, (req, res) => {
    return res.status(200).json({ message: true });
});

// Add dashboard route for admin
router.get('/dashboard', asyncHandler(controllerUser.getDashboard));

module.exports = router;
