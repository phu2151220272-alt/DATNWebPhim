const express = require('express');
const router = express.Router();

const { authUser, authAdmin, asyncHandler } = require('../auth/checkAuth');

const controllerCategory = require('../controller/category.controller');

router.post('/create', asyncHandler(controllerCategory.createCategory));
router.get('/all', asyncHandler(controllerCategory.getAllCategory));
router.get('/movie', asyncHandler(controllerCategory.getMovieByCategory));
router.post('/update', asyncHandler(controllerCategory.updateCategory));
router.delete('/delete', asyncHandler(controllerCategory.deleteCategory));

module.exports = router;
