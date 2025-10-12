const { DataTypes } = require('sequelize');
const { connect } = require('../config/index');

const Category = connect.define(
    'category',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        nameCategory: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },

    {
        freezeTableName: true,
    },
);

module.exports = Category;
