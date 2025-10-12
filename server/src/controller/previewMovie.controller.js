const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { OK, Created } = require('../core/success.response');

const modelPreviewMovie = require('../models/previewMovie.model');

class PreviewMovieController {
    async createPreviewMovie(req, res) {
        const { id } = req.user;
        const { movieId, rating, comment } = req.body;
        const previewMovie = await modelPreviewMovie.create({
            userId: id,
            movieId,
            rating,
            comment,
        });
        new OK({ message: 'Tạo đánh giá phim thành công', metadata: previewMovie }).send(res);
    }
}

module.exports = new PreviewMovieController();
