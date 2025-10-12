const { DataTypes } = require('sequelize');
const { connect } = require('../config/index');

const Movies = connect.define(
    'movies',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        actor: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        director: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        thumb_url: {
            type: DataTypes.STRING,
        },
        poster_url: {
            type: DataTypes.STRING,
        },
        time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.STRING,
        },
        quality: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        year: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dateStart: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        dateEnd: {
            type: DataTypes.DATE,
        },
    },
    {
        freezeTableName: true, // 👈 Giữ nguyên tên bảng là 'users'
        timestamps: true,
    },
);

module.exports = Movies;
