const express = require('express');
const router = express.Router();

const { authUser, authAdmin, asyncHandler } = require('../auth/checkAuth');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/movies');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const controllerMovie = require('../controller/movie.controller');

router.post(
    '/upload-image',
    upload.fields([
        { name: 'thumb_url', maxCount: 1 },
        { name: 'poster_url', maxCount: 1 },
    ]),
    asyncHandler(controllerMovie.uploadImage),
);

router.post('/create', asyncHandler(controllerMovie.createMovie));

router.get('/all', asyncHandler(controllerMovie.getAllMovie));
router.get('/detail', asyncHandler(controllerMovie.getMovieById));
router.get('/seat', asyncHandler(controllerMovie.getSeatByMovieId));

router.post(
    '/update',
    upload.fields([
        { name: 'thumb_url', maxCount: 1 },
        { name: 'poster_url', maxCount: 1 },
    ]),
    asyncHandler(controllerMovie.updateMovie),
);

router.post('/delete', asyncHandler(controllerMovie.deleteMovie));

router.get('/search', asyncHandler(controllerMovie.searchMovie));
router.get('/movie', asyncHandler(controllerMovie.findMovieNew));

module.exports = router;
