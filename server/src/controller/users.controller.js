const modelUser = require('../models/users.model');

const modelApiKey = require('../models/apiKey.model');
const modelOtp = require('../models/otp.model');
const modelMessageChatbot = require('../models/messageChatbot.model');

const { BadRequestError, AuthFailureError } = require('../core/error.response');
const { OK } = require('../core/success.response');

const { createApiKey, createToken, createRefreshToken, verifyToken } = require('../services/tokenServices');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const otpGenerator = require('otp-generator');
const { jwtDecode } = require('jwt-decode');
const { connect } = require('../config/index');
const sendMailForgotPassword = require('../utils/sendMailForgotPassword');
const { askMovieAssistant } = require('../utils/chatbot');

class UsersController {
    async registerUser(req, res) {
        const { fullName, phone, email, password } = req.body;
        if (!fullName || !phone || !email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const findUser = await modelUser.findOne({ where: { email } });

        if (findUser) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(password, salt);
        const dataUser = await modelUser.create({
            fullName,
            phone,
            email,
            password: passwordHash,
            typeLogin: 'email',
        });

        await dataUser.save();
        await createApiKey(dataUser.id);
        const token = await createToken({
            id: dataUser.id,
            isAdmin: dataUser.isAdmin,
            address: dataUser.address,
            phone: dataUser.phone,
        });
        const refreshToken = await createRefreshToken({ id: dataUser.id });
        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        // Đặt cookie HTTP-Only cho refreshToken (tùy chọn)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
    }

    async loginUser(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const findUser = await modelUser.findOne({ where: { email } });
        if (!findUser) {
            throw new AuthFailureError('Tài khoản hoặc mật khẩu không chính xác');
        }
        const isPasswordValid = bcrypt.compareSync(password, findUser.password);
        if (!isPasswordValid) {
            throw new AuthFailureError('Tài khoản hoặc mật khẩu không chính xác');
        }
        await createApiKey(findUser.id);
        const token = await createToken({ id: findUser.id, isAdmin: findUser.isAdmin });
        const refreshToken = await createRefreshToken({ id: findUser.id });
        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            maxAge: 15 * 60 * 1000, // 15 phút
        });
        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });
        new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
    }

    async authUser(req, res) {
        const { id } = req.user;

        const findUser = await modelUser.findOne({ where: { id } });

        if (!findUser) {
            throw new AuthFailureError('Tài khoản không tồn tại');
        }

        const auth = CryptoJS.AES.encrypt(JSON.stringify(findUser), process.env.SECRET_CRYPTO).toString();

        new OK({ message: 'success', metadata: auth }).send(res);
    }

    async refreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken;

        const decoded = await verifyToken(refreshToken);

        const user = await modelUser.findOne({ where: { id: decoded.id } });
        const token = await createToken({ id: user.id });
        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        new OK({ message: 'Refresh token thành công', metadata: { token } }).send(res);
    }

    async logout(req, res) {
        const { id } = req.user;
        await modelApiKey.destroy({ where: { userId: id } });
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        res.clearCookie('logged');

        new OK({ message: 'Đăng xuất thành công' }).send(res);
    }

    async updateInfoUser(req, res, next) {
        const { id } = req.user;
        const { fullName, address, phone, sex } = req.body;

        const user = await modelUser.findOne({ where: { id } });

        let image = '';
        if (req.file) {
            image = req.file.filename;
        } else {
            image = user.avatar;
        }

        if (!user) {
            throw new BadRequestError('Không tìm thấy tài khoản');
        }
        await user.update({ fullName, address, phone, sex, avatar: image });

        new OK({ message: 'Cập nhật thông tin tài khoản thành cong' }).send(res);
    }

    async loginGoogle(req, res) {
        const { credential } = req.body;
        const dataToken = jwtDecode(credential);
        const user = await modelUser.findOne({ where: { email: dataToken.email } });
        if (user) {
            await createApiKey(user.id);
            const token = await createToken({ id: user.id });
            const refreshToken = await createRefreshToken({ id: user.id });
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
        } else {
            const newUser = await modelUser.create({
                fullName: dataToken.name,
                email: dataToken.email,
                typeLogin: 'google',
            });
            await newUser.save();
            await createApiKey(newUser.id);
            const token = await createToken({ id: newUser.id });
            const refreshToken = await createRefreshToken({ id: newUser.id });
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
        }
    }

    async forgotPassword(req, res) {
        const { email } = req.body;
        if (!email) {
            throw new BadRequestError('Vui lòng nhập email');
        }

        const user = await modelUser.findOne({ where: { email } });
        if (!user) {
            throw new BadRequestError('Email không tồn tại');
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const otp = await otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        const saltRounds = 10;

        bcrypt.hash(otp, saltRounds, async function (err, hash) {
            if (err) {
                console.error('Error hashing OTP:', err);
            } else {
                await modelOtp.create({
                    email: user.email,
                    otp: hash,
                });
                await sendMailForgotPassword(email, otp);

                return res
                    .setHeader('Set-Cookie', [
                        `tokenResetPassword=${token};  Secure; Max-Age=300; Path=/; SameSite=Strict`,
                    ])
                    .status(200)
                    .json({ message: 'Gửi thành công !!!' });
            }
        });
    }

    async resetPassword(req, res) {
        try {
            const token = req.cookies.tokenResetPassword;
            const { otp, newPassword } = req.body;

            if (!token) {
                throw new BadRequestError('Vui lòng gửi yêu cầu quên mật khẩu');
            }

            const decode = jwt.verify(token, process.env.JWT_SECRET);
            if (!decode) {
                throw new AuthFailureError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            const findOTP = await modelOtp.findOne({
                where: { email: decode.email },
                order: [['createdAt', 'DESC']],
            });
            if (!findOTP) {
                throw new AuthFailureError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            // So sánh OTP
            const isMatch = await bcrypt.compare(otp, findOTP.otp);
            if (!isMatch) {
                throw new AuthFailureError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            // Hash mật khẩu mới
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Tìm người dùng
            const findUser = await modelUser.findOne({ where: { email: decode.email } });
            if (!findUser) {
                throw new AuthFailureError('Người dùng không tồn tại');
            }

            // Cập nhật mật khẩu mới
            findUser.password = hashedPassword;
            await findUser.save();

            // Xóa OTP sau khi đặt lại mật khẩu thành công
            await modelOtp.destroy({ where: { email: decode.email } });
            res.clearCookie('tokenResetPassword');
            return res.status(200).json({ message: 'Đặt lại mật khẩu thành công' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng liên hệ ADMIN !!' });
        }
    }

    async updateUser(req, res) {
        const { id } = req.user;
        const { fullName, phone } = req.body;

        const user = await modelUser.findOne({ where: { id } });
        if (!user) {
            throw new AuthFailureError('Tài khoản không tồn tại');
        }
        await user.update({ fullName, phone });
        new OK({ message: 'Cập nhật thông tin tài khoản thành công' }).send(res);
    }

    async updatePassword(req, res) {
        const { id } = req.user;
        const { currentPassword, newPassword } = req.body;

        const user = await modelUser.findOne({ where: { id } });
        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }
        const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new BadRequestError('Mật khẩu cũ không chính xác');
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await user.update({ password: hashedPassword });
        new OK({ message: 'Cập nhật mật khẩu thành công' }).send(res);
    }

    async getUserByAdmin(req, res) {
        const users = await modelUser.findAll();
        new OK({ message: 'Lấy danh sách người dùng thành công', metadata: users }).send(res);
    }

    async updateRoleUser(req, res) {
        const { userId, role } = req.body;
        const user = await modelUser.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        await user.update({ isAdmin: role });
        new OK({ message: 'Cập nhật vai trò người dùng thành công' }).send(res);
    }

    async getDashboard(req, res) {
        try {
            let { startDate, endDate } = req.query;

            // Default to last 7 days if no date range provided
            if (!startDate || !endDate) {
                const today = new Date();
                endDate = today.toISOString().split('T')[0];

                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                startDate = sevenDaysAgo.toISOString().split('T')[0];
            }

            // Get total users
            const [userResults] = await connect.query('SELECT COUNT(*) as total FROM users');
            const totalUsers = userResults[0].total;

            // Get total movies
            const [movieResults] = await connect.query('SELECT COUNT(*) as total FROM movies');
            const totalMovies = movieResults[0].total;

            // Get total revenue and watching count
            const [revenueResults] = await connect.query(`
                SELECT 
                    IFNULL(SUM(totalPrice), 0) as totalRevenue, 
                    COUNT(*) as totalCount 
                FROM payments 
                WHERE status = 'success' 
                AND date BETWEEN '${startDate}' AND '${endDate}'
            `);

            const totalRevenue = revenueResults[0].totalRevenue || 0;
            const totalWatching = revenueResults[0].totalCount || 0;

            // Get recent orders
            const [recentOrders] = await connect.query(`
                SELECT 
                    p.id as idPayment, 
                    u.fullName, 
                    p.totalPrice, 
                    p.status, 
                    p.paymentMethod as typePayment, 
                    m.name as movieName
                FROM payments p
                LEFT JOIN users u ON p.userId = u.id
                LEFT JOIN movies m ON p.movieId = m.id
                WHERE p.date BETWEEN '${startDate}' AND '${endDate}'
                ORDER BY p.createdAt DESC
                LIMIT 5
            `);

            // Get top booked movies
            const [topProducts] = await connect.query(`
                SELECT 
                    m.id, 
                    m.name, 
                    m.category as componentType, 
                    m.price, 
                    COUNT(p.id) as quantity
                FROM movies m
                JOIN payments p ON m.id = p.movieId
                WHERE p.status = 'success' 
                AND p.date BETWEEN '${startDate}' AND '${endDate}'
                GROUP BY m.id, m.name, m.category, m.price
                ORDER BY quantity DESC
                LIMIT 5
            `);

            // Create date range array for the chart
            const dates = [];
            const start = new Date(startDate);
            const end = new Date(endDate);
            const current = new Date(start);

            while (current <= end) {
                dates.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }

            // Get payments by date
            const [paymentsByDate] = await connect.query(`
                SELECT 
                    DATE_FORMAT(date, '%Y-%m-%d') as date, 
                    COUNT(*) as count
                FROM payments
                WHERE status = 'success'
                AND date BETWEEN '${startDate}' AND '${endDate}'
                GROUP BY DATE_FORMAT(date, '%Y-%m-%d')
            `);

            // Create a lookup map for payments count by date
            const paymentCountByDate = {};
            paymentsByDate.forEach((item) => {
                paymentCountByDate[item.date] = item.count;
            });

            // Create final order stats with all days (including 0 counts)
            const orderStats = dates.map((date) => ({
                date: date,
                count: paymentCountByDate[date] || 0,
            }));

            // Get category statistics
            const [categoryStats] = await connect.query(`
                SELECT 
                    m.category as type, 
                    COUNT(p.id) as value
                FROM movies m
                JOIN payments p ON m.id = p.movieId
                WHERE p.status = 'success'
                AND p.date BETWEEN '${startDate}' AND '${endDate}'
                GROUP BY m.category
            `);

            // Get order status statistics
            const [orderStatusStats] = await connect.query(`
                SELECT 
                    status, 
                    COUNT(*) as value
                FROM payments
                WHERE date BETWEEN '${startDate}' AND '${endDate}'
                GROUP BY status
            `);

            // Handle specific chart data requests
            if (req.query.chartData === 'orderStats') {
                return new OK({
                    message: 'Order statistics retrieved successfully',
                    metadata: orderStats,
                }).send(res);
            }

            if (req.query.chartData === 'pieCharts') {
                return new OK({
                    message: 'Pie chart data retrieved successfully',
                    metadata: {
                        categoryStats,
                        orderStats: orderStatusStats,
                    },
                }).send(res);
            }

            // Prepare full dashboard response
            const responseData = {
                statistics: {
                    totalUsers,
                    totalMovies,
                    totalRevenue,
                    totalWatching,
                },
                recentOrders,
                topProducts,
                orderStats,
                categoryStats,
                orderStatusStats,
                dateRange: {
                    startDate,
                    endDate,
                },
            };

            new OK({ message: 'Dashboard data retrieved successfully', metadata: responseData }).send(res);
        } catch (error) {
            console.error('Dashboard Error:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async chatbot(req, res) {
        const { question } = req.body;
        const { id } = req.user;
        const response = await askMovieAssistant(question, id);

        await modelMessageChatbot.create({
            userId: id,
            sender: 'user',
            content: question,
        });

        await modelMessageChatbot.create({
            userId: id,
            sender: 'bot',
            content: response,
        });

        return new OK({ message: 'Chatbot response retrieved successfully', metadata: response }).send(res);
    }

    async getChatbot(req, res) {
        const { id } = req.user;
        const messages = await modelMessageChatbot.findAll({ where: { userId: id } });
        return new OK({ message: 'Chatbot messages retrieved successfully', metadata: messages }).send(res);
    }
}

module.exports = new UsersController();
