const express = require('express');
const router = express.Router();

const { authUser, authAdmin, asyncHandler } = require('../auth/checkAuth');

const controllerPreviewMovie = require('../controller/previewMovie.controller');

router.post('/create', authUser, asyncHandler(controllerPreviewMovie.createPreviewMovie));

module.exports = router;
