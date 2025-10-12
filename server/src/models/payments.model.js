const { DataTypes } = require('sequelize');
const { connect } = require('../config/index');

const payments = connect.define(
    'payments',
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
        seatId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        totalPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        paymentMethod: {
            type: DataTypes.ENUM('momo', 'vnpay'),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'success', 'failed', 'canceled'),
        },
    },
    {
        freezeTableName: true,
    },
);

module.exports = payments;
