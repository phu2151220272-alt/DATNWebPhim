const { DataTypes } = require('sequelize');
const { connect } = require('../config/index');

const seat = connect.define(
    'seats',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        row: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        number: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        seat_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('available', 'booked'),
            defaultValue: 'available',
            allowNull: false,
        },
        movieId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
    },
);

module.exports = seat;
