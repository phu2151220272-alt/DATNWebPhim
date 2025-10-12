const { DataTypes } = require('sequelize');
const { connect } = require('../config/index');

const previewMovie = connect.define(
    'previewMovie',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        movieId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'movies',
                key: 'id',
            },
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        comment: {
            type: DataTypes.TEXT,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
    },
);

module.exports = previewMovie;
