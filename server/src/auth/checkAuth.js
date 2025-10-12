const { AuthFailureError, BadRequestError, ForbiddenError } = require('../core/error.response');
const { verifyToken } = require('../services/tokenServices');
const modelUser = require('../models/users.model');

const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

const authUser = async (req, res, next) => {
    try {
        const user = req.cookies.token;
        if (!user) throw new AuthFailureError('Vui lòng đăng nhập');
        const token = user;
        const decoded = await verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

const authAdmin = async (req, res, next) => {
    try {
        const user = req.cookies.token;
        if (!user) throw new ForbiddenError('Bạn không có quyền truy cập');
        const token = user;
        const decoded = await verifyToken(token);
        const { id } = decoded;
        const findUser = await modelUser.findOne({ where: { id } });
        if (findUser.isAdmin === '0') {
            throw new ForbiddenError('Bạn không có quyền truy cập');
        }
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    asyncHandler,
    authUser,
    authAdmin,
};
