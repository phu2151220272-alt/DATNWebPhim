const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { OK, Created } = require('../core/success.response');

const modelCategory = require('../models/category.model');
const modelMovie = require('../models/movie.model');

const { Op } = require('sequelize');

class controllerCategory {
    async createCategory(req, res) {
        const { nameCategory } = req.body;
        if (!nameCategory) {
            throw new BadRequestError('Tên là bắt buộc');
        }
        const category = await modelCategory.create({ nameCategory });
        new Created({
            message: 'Create category successfully',
            metadata: category,
        }).send(res);
    }

    async getAllCategory(req, res) {
    // Lấy tất cả category
    const categories = await modelCategory.findAll({});

    // Gắn list phim cho từng category
    const data = await Promise.all(
        categories.map(async (category) => {
            const movies = await modelMovie.findAll({
                where: { category: category.id },
            });
            return {
                ...category.dataValues,
                movies,
            };
        }),
    );

    // HÀM TÍNH THỨ TỰ ƯU TIÊN
    const getRank = (name = '') => {
        const lower = name.toLowerCase().trim();

        // 0: Phim nổi bật tháng
        if (
            lower.includes('nổi bật') ||
            lower.includes('noi bat')
        ) {
            return 0;
        }

        // 1: Phim Đang Chiếu
        if (
            lower.includes('đang chiếu') ||
            lower.includes('dang chieu')
        ) {
            return 1;
        }

        // 2: Phim Sắp Chiếu
        if (
            lower.includes('sắp chiếu') ||
            lower.includes('sap chieu')
        ) {
            return 2;
        }

        // 3: Các loại khác
        return 3;
    };

    // Sắp xếp: Nổi bật tháng -> Đang chiếu -> Sắp chiếu -> khác
    data.sort((a, b) => {
        const aRank = getRank(a.nameCategory);
        const bRank = getRank(b.nameCategory);

        if (aRank !== bRank) {
            return aRank - bRank;
        }

        // Nếu cùng rank thì giữ theo thời gian tạo (cũ trước, mới sau)
        const aCreated = new Date(a.createdAt).getTime();
        const bCreated = new Date(b.createdAt).getTime();
        return aCreated - bCreated;
    });

    new OK({
        message: 'Get all category successfully',
        metadata: data,
    }).send(res);
}



    async deleteCategory(req, res) {
        const { id } = req.query;
        const category = await modelCategory.findOne({ where: { id } });
        if (!category) {
            throw new BadRequestError('Category not found');
        }
        const result = await category.destroy();
        const movies = await modelMovie.findAll({ where: { category: id } });
        await Promise.all(
            movies.map(async (movie) => {
                await movie.destroy();
            }),
        );
        new OK({
            message: 'Delete category successfully',
            metadata: result,
        }).send(res);
    }

    async updateCategory(req, res) {
        const { nameCategory, id } = req.body;

        const category = await modelCategory.findOne({ where: { id } });
        if (!category) {
            throw new BadRequestError('Category not found');
        }
        const result = await modelCategory.update({ nameCategory }, { where: { id } });
        new OK({ message: 'Thành công', metadata: result }).send(res);
    }

    async getMovieByCategory(req, res) {
        const { id } = req.query;
        const movies = await modelMovie.findAll({
            where: {
                category: id,
            },
        });
        const findCategory = await modelCategory.findOne({ where: { id } });
        const data = {
            ...findCategory.dataValues,
            movies,
        };
        new OK({ message: 'Thành công', metadata: data }).send(res);
    }
}

module.exports = new controllerCategory();
