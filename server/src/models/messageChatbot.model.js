const { DataTypes } = require('sequelize');
const { connect } = require('../config/index');

const MessageChatbot = connect.define(
    'message_chatbot',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.STRING, // hoặc UUID nếu bạn dùng UUID cho bảng user
            allowNull: false,
        },
        sender: {
            type: DataTypes.ENUM('user', 'bot'),
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        freezeTableName: true,
        timestamps: true, // tự tạo createdAt, updatedAt
    },
);

module.exports = MessageChatbot;
