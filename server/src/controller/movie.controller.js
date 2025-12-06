const modelMovie = require('../models/movie.model');
const modelCategory = require('../models/category.model');
const modelSeat = require('../models/seat.model');
const modelPreviewMovie = require('../models/previewMovie.model');
const modelUser = require('../models/users.model');
const moment = require('moment');
const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { OK, Created } = require('../core/success.response');

const cloudinary = require('../utils/configCloudDinary');

const fs = require('fs/promises');
const { Op } = require('sequelize');
const searchMovieGemini = require('../utils/searchMovieGemini');

function getPublicId(url) {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');

    if (uploadIndex === -1) {
        throw new Error('Invalid Cloudinary URL');
    }

    const pathParts = parts.slice(uploadIndex + 1);
    const pathWithoutVersion = pathParts[0].startsWith('v') ? pathParts.slice(1) : pathParts;
    const publicIdWithExt = pathWithoutVersion.join('/');
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));

    return publicId;
}
// Tự động cập nhật category "Phim Sắp Chiếu" -> "Phim Đang Chiếu" nếu đã tới ngày chiếu
async function autoUpdateMovieCategory(movie) {
    if (!movie) return movie;

    const todayStr = moment().format('YYYY-MM-DD');
    const startStr = movie.dateStart
        ? moment(movie.dateStart).format('YYYY-MM-DD')
        : null;

    // Không có ngày bắt đầu / chưa tới ngày -> thôi khỏi đổi
    if (!startStr || todayStr < startStr) return movie;

    // Tìm 2 danh mục
    const comingSoon = await modelCategory.findOne({
        where: { nameCategory: 'Phim Sắp Chiếu' },
    });
    const nowShowing = await modelCategory.findOne({
        where: { nameCategory: 'Phim Đang Chiếu' },
    });

    if (!comingSoon || !nowShowing) {
        // Thiếu category trong DB thì bỏ qua, khỏi làm gì để tránh lỗi
        return movie;
    }

    // Nếu phim đang nằm trong "Phim Sắp Chiếu" thì chuyển sang "Phim Đang Chiếu"
    if (movie.category === comingSoon.id) {
        movie.category = nowShowing.id;
        await movie.save();
    }

    return movie;
}

class MovieController {
    async uploadImage(req, res) {
        try {
            const files = req.files;

            if (!files || Object.keys(files).length === 0) {
                return new BadRequestError('Không có file nào được tải lên');
            }

            const data = {};

            // Upload thumbnail if exists
            if (files.thumb_url && files.thumb_url[0]) {
                const thumbFile = files.thumb_url[0];

                const thumbResult = await cloudinary.uploader.upload(thumbFile.path, {
                    folder: 'movie/thumbnails',
                    resource_type: 'image',
                });

                data.thumb_url = thumbResult.url;

                // Delete temporary file
                await fs.unlink(thumbFile.path);
            }

            // Upload poster if exists
            if (files.poster_url && files.poster_url[0]) {
                const posterFile = files.poster_url[0];

                const posterResult = await cloudinary.uploader.upload(posterFile.path, {
                    folder: 'movie/posters',
                    resource_type: 'image',
                });

                data.poster_url = posterResult.url;

                // Delete temporary file
                await fs.unlink(posterFile.path);
            }

            // Check if at least one file was uploaded
            if (Object.keys(data).length === 0) {
                return new BadRequestError('Không có file hợp lệ nào được tải lên');
            }

            return new OK({
                message: 'Upload image thành công',
                metadata: data,
            }).send(res);
        } catch (error) {
            console.error('Upload error:', error);

            // Clean up temporary files if error occurs
            try {
                if (req.files) {
                    const files = req.files;
                    if (files.thumb_url && files.thumb_url[0]) {
                        await fs.unlink(files.thumb_url[0].path);
                    }
                    if (files.poster_url && files.poster_url[0]) {
                        await fs.unlink(files.poster_url[0].path);
                    }
                }
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }

            return new InternalServerError('Lỗi khi upload ảnh');
        }
    }

    async createMovie(req, res) {
        const {
            name,
            category,
            actor,
            country,
            description,
            director,
            time,
            price,
            quality,
            year,
            dateStart,
            dateEnd,
            thumb_url,
            poster_url,
            trailer_url,
        } = req.body;

        const movie = await modelMovie.create({
            name,
            category,
            actor,
            country,
            description,
            director,
            time,
            price,
            quality,
            year,
            thumb_url,
            poster_url,
            trailer_url,
            dateStart,
            dateEnd,
        });

        new Created({
            message: 'Create movie successfully',
            metadata: movie,
        }).send(res);
    }

    async getAllMovie(req, res) {
        const movies = await modelMovie.findAll({});
        const data = await Promise.all(
            movies.map(async (movie) => {
                const findCategory = await modelCategory.findOne({ where: { id: movie?.category } });
                return {
                    ...movie.dataValues,
                    category: findCategory,
                };
            }),
        );
        new OK({
            message: 'Get all movie successfully',
            metadata: data,
        }).send(res);
    }

    async getMovieById(req, res) {
        try {
            const { id } = req.query;
            console.log('getMovieById query:', req.query);

            if (!id) {
                return new BadRequestError('Movie id is required').send(res);
            }

            let movie = await modelMovie.findOne({ where: { id } });

            if (!movie) {
                // Không tìm thấy phim -> metadata = null
                return new OK({
                    message: 'Movie not found',
                    metadata: null,
                }).send(res);
            }

            // 🔁 Tự động cập nhật category theo ngày chiếu
            movie = await autoUpdateMovieCategory(movie);

            // Lấy category theo id mới nhất
            const findCategory = await modelCategory.findOne({
                where: { id: movie.category },
            });

            const seats = await modelSeat.findAll({ where: { movieId: id } });
            const previewMovie = await modelPreviewMovie.findAll({ where: { movieId: id } });

            const dataUserPreview = await Promise.all(
                previewMovie.map(async (preview) => {
                    const user = await modelUser.findOne({ where: { id: preview.userId } });
                    return {
                        ...preview.dataValues,
                        user,
                    };
                }),
            );

            const data = {
                ...movie.dataValues,
                category: findCategory ? findCategory.nameCategory : null,
                seats,
                previewMovie: dataUserPreview,
            };

            new OK({
                message: 'Get movie by id successfully',
                metadata: data,
            }).send(res);
        } catch (err) {
            console.error('getMovieById error:', err);
            // Tránh để lỗi rơi ra ngoài -> FE thấy 500 mà không biết lý do
            return res.status(500).json({
                message: 'Internal server error in getMovieById',
            });
        }
    }

    async getSeatByMovieId(req, res) {
        const { date, time, idMovie } = req.query;
        const seats = await modelSeat.findAll({ where: { movieId: idMovie, date, time } });
        new OK({
            message: 'Get seat by movie id successfully',
            metadata: seats,
        }).send(res);
    }

    async updateMovie(req, res) {
        const {
            name,
            category,
            actor,
            country,
            description,
            director,
            time,
            price,
            quality,
            year,
            dateStart,
            dateEnd,
            thumb_url,
            poster_url,
            trailer_url,
            id,
        } = req.body;

        const findMovie = await modelMovie.findOne({ where: { id } });
        if (!findMovie) {
            throw new BadRequestError('Movie not found');
        }

        const updateData = {
            name,
            category,
            actor,
            country,
            description,
            director,
            time,
            price,
            quality,
            year,
            thumb_url,
            poster_url,
            trailer_url,
            dateStart,
            dateEnd,
        };

        await findMovie.update(updateData);

        new OK({
            message: 'Update movie successfully',
            metadata: findMovie,
        }).send(res);
    }

    async deleteMovie(req, res) {
        const { id } = req.body;
        const findMovie = await modelMovie.findOne({ where: { id } });
        if (!findMovie) {
            throw new BadRequestError('Movie not found');
        }
        const publicIdThumb = getPublicId(findMovie.thumb_url);
        const publicIdPoster = getPublicId(findMovie.poster_url);
        await cloudinary.uploader.destroy(publicIdThumb, { resource_type: 'image' });
        await cloudinary.uploader.destroy(publicIdPoster, { resource_type: 'image' });
        await findMovie.destroy();
        new OK({
            message: 'Delete movie successfully',
            metadata: findMovie,
        }).send(res);
    }

    async searchMovie(req, res) {
        const { name } = req.query;

        const data = await searchMovieGemini(name);
        new OK({
            message: 'Search movie successfully',
            metadata: data,
        }).send(res);
    }

    async findMovieNew(req, res) {
        const dataMovie = await modelMovie.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10,
        });

        const data = await Promise.all(
            dataMovie.map(async (movie) => {
                const findPreview = await modelPreviewMovie.findAll({ where: { movieId: movie.id } });
                return {
                    ...movie.dataValues,
                    previewMovie: findPreview,
                };
            }),
        );

        new OK({
            message: 'Get new movies successfully',
            metadata: data,
        }).send(res);
    }
}

module.exports = new MovieController();
