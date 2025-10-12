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
        const categories = await modelCategory.findAll({});
        const data = await Promise.all(
            categories.map(async (category) => {
                const movies = await modelMovie.findAll({ where: { category: category.id } });
                return {
                    ...category.dataValues,
                    movies,
                };
            }),
        );
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
