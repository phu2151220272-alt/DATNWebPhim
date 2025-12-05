const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { OK, Created } = require('../core/success.response');

const Payments = require('../models/payments.model');
const Movie = require('../models/movie.model');
const sendMailPaymentSuccess = require('../utils/sendMailPaymentSuccess');
const Seats = require('../models/seat.model');
const User = require('../models/users.model');
const PreviewMovie = require('../models/previewMovie.model');

const crypto = require('crypto');
const axios = require('axios');
const dayjs = require('dayjs');
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');

function generatePayID() {
    // Tạo ID thanh toán bao gồm cả giây để tránh trùng lặp
    const now = new Date();
    const timestamp = now.getTime();
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    return `PAY${timestamp}${seconds}${milliseconds}`;
}

class PaymentsController {
    async createPayment(req, res) {
        const { id } = req.user;
        const { typePayment, idMovie, idSeat, time, date } = req.body;

        if (!idMovie || !idSeat) {
            throw new BadRequestError('idMovie and idSeat are required');
        }

        const findMovie = await Movie.findOne({ where: { id: idMovie } });
        if (!findMovie) {
            throw new BadRequestError('Movie not found');
        }

        const totalPrice = findMovie.price * idSeat.length;

        if (typePayment === 'momo') {
            var accessKey = 'F8BBA842ECF85';
            var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
            var orderInfo = `thanh toan ${id} + ${idMovie} + ${idSeat} + ${totalPrice} + ${time} + ${date}`;
            var partnerCode = 'MOMO';
            var redirectUrl = 'http://localhost:3000/api/payments/check-payment-momo';
            var ipnUrl = 'http://localhost:3000/api/payments/check-payment-momo';
            var requestType = 'payWithMethod';
            var amount = totalPrice;
            var orderId = partnerCode + new Date().getTime();
            var requestId = orderId;
            var extraData = '';
            var paymentCode =
                'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';
            var orderGroupId = '';
            var autoCapture = true;
            var lang = 'vi';

            //before sign HMAC SHA256 with format
            //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
            var rawSignature =
                'accessKey=' +
                accessKey +
                '&amount=' +
                amount +
                '&extraData=' +
                extraData +
                '&ipnUrl=' +
                ipnUrl +
                '&orderId=' +
                orderId +
                '&orderInfo=' +
                orderInfo +
                '&partnerCode=' +
                partnerCode +
                '&redirectUrl=' +
                redirectUrl +
                '&requestId=' +
                requestId +
                '&requestType=' +
                requestType;
            //puts raw signature
            console.log('--------------------RAW SIGNATURE----------------');
            console.log(rawSignature);
            //signature
            const crypto = require('crypto');
            var signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
            console.log('--------------------SIGNATURE----------------');
            console.log(signature);

            //json object send to MoMo endpoint
            const requestBody = JSON.stringify({
                partnerCode: partnerCode,
                partnerName: 'Test',
                storeId: 'MomoTestStore',
                requestId: requestId,
                amount: amount,
                orderId: orderId,
                orderInfo: orderInfo,
                redirectUrl: redirectUrl,
                ipnUrl: ipnUrl,
                lang: lang,
                requestType: requestType,
                autoCapture: autoCapture,
                extraData: extraData,
                orderGroupId: orderGroupId,
                signature: signature,
            });
            //Create the HTTPS objects
            const https = require('https');
            const options = {
                hostname: 'test-payment.momo.vn',
                port: 443,
                path: '/v2/gateway/api/create',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestBody),
                },
            };
            //Send the request and get the response
            const req2 = https.request(options, (res2) => {
                console.log(`Status: ${res2.statusCode}`);
                console.log(`Headers: ${JSON.stringify(res2.headers)}`);
                res2.setEncoding('utf8');
                res2.on('data', (body) => {
                    return res.status(200).json({ message: 'Thanh toán thành công', metadata: JSON.parse(body) });
                });
                res2.on('end', () => {
                    console.log('No more data in response.');
                });
            });

            req2.on('error', (e) => {
                console.log(`problem with request: ${e.message}`);
            });
            // write data to request body
            console.log('Sending....');
            req2.write(requestBody);
            req2.end();
        }

        if (typePayment === 'vnpay') {
            const vnpay = new VNPay({
                tmnCode: 'DH2F13SW',
                secureSecret: '7VJPG70RGPOWFO47VSBT29WPDYND0EJG',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true, // tùy chọn
                hashAlgorithm: 'SHA512', // tùy chọn
                loggerFn: ignoreLogger, // tùy chọn
            });

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const vnpayResponse = vnpay.buildPaymentUrl({
                vnp_Amount: totalPrice, //
                vnp_IpAddr: '127.0.0.1', //
                vnp_TxnRef: `${id} + ${idMovie} + ${idSeat} + ${totalPrice} + ${time} + ${date}`, // Sử dụng paymentId thay vì singlePaymentId
                vnp_OrderInfo: `thanh toan ${id} + ${idMovie} + ${idSeat} + ${totalPrice} + ${time} + ${date}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:3000/api/payments/check-payment-vnpay`, //
                vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
                vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
                vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
            });
            new OK({ message: 'Thanh toán thông báo', metadata: vnpayResponse }).send(res);
        }
    }

    async checkPaymentMomo(req, res) {
        const { orderInfo } = req.query;

        const parts = orderInfo.split(' + ');

        const idUser = parts[0].split(' ').pop(); // lấy phần tử cuối sau "thanh toan"
        const idMovie = parts[1];
        const idSeat = parts[2];
        const totalPrice = parseInt(parts[3], 10);
        const time = parts[4];
        const date = parts[5];

        const seats = idSeat.split(',');

        seats.map(async (seat) => {
            await Seats.create({
                status: 'booked',
                time: time,
                date: dayjs(date).format('YYYY-MM-DD'),
                row: seat.split('')[0],
                number: seat.split('')[1],
                movieId: idMovie,
                seat_code: seat,
            });
        });

        const payment = await Payments.create({
            id: generatePayID(),
            movieId: idMovie,
            userId: idUser,
            seatId: idSeat,
            totalPrice: totalPrice,
            time: time,
            date: dayjs(date).format('YYYY-MM-DD'),
            paymentMethod: 'momo',
            status: 'pending',
        });
        const user = await User.findOne({ where: { id: idUser } });
        const movie = await Movie.findOne({ where: { id: idMovie } });

        // // Chuẩn bị dữ liệu gửi email
        // const seatsString = seats.join(', ');
        // const displayDate = dayjs(date).format('DD/MM/YYYY');

        // // Gửi email xác nhận
        // await sendMailPaymentSuccess(user.email, {
        //     movieName: movie.name,
        //     seats: seatsString,
        //     time: time,
        //     date: displayDate,
        //     totalPrice: totalPrice,
        //     paymentId: payment.id,
        //     paymentMethod: payment.paymentMethod,
        // });

        return res.redirect(`http://localhost:5173/payment-success/${payment.id}`);
    }

    async checkPaymentVNPay(req, res) {
        const { vnp_TxnRef } = req.query;

        const parts = vnp_TxnRef.split(' + ');

        const idUser = parts[0].split(' ').pop(); // lấy phần tử cuối sau "thanh toan"
        const idMovie = parts[1];
        const idSeat = parts[2];
        const totalPrice = parseInt(parts[3], 10);
        const time = parts[4];
        const date = parts[5];

        const seats = idSeat.split(',');

        seats.map(async (seat) => {
            await Seats.create({
                status: 'booked',
                time: time,
                date: dayjs(date).format('YYYY-MM-DD'),
                row: seat.split('')[0],
                number: seat.split('')[1],
                movieId: idMovie,
                seat_code: seat,
            });
        });

        const payment = await Payments.create({
            id: generatePayID(),
            movieId: idMovie,
            userId: idUser,
            seatId: idSeat,
            totalPrice: totalPrice,
            time: time,
            date: date,
            paymentMethod: 'vnpay',
            status: 'pending',
        });

        return res.redirect(`http://localhost:5173/payment-success/${payment.id}`);
    }

    async getPaymentById(req, res) {
        const { id } = req.query;
        const payment = await Payments.findOne({ where: { id: id } });
        const findMovie = await Movie.findOne({ where: { id: payment.movieId } });

        const data = {
            ...payment.dataValues,
            movie: findMovie.dataValues,
        };
        new OK({ message: 'Thanh toán thông báo', metadata: data }).send(res);
    }

    async getPaymentByUserId(req, res) {
        const { id } = req.user;
        const payments = await Payments.findAll({ where: { userId: id }, order: [['createdAt', 'DESC']] });
        const data = await Promise.all(
            payments.map(async (payment) => {
                const findMovie = await Movie.findOne({ where: { id: payment.movieId } });
                const findPreviewMovie = await PreviewMovie.findOne({
                    where: { movieId: payment.movieId, userId: payment.userId },
                });
                return {
                    ...payment.dataValues,
                    movie: findMovie.dataValues,
                    previewMovie: findPreviewMovie?.dataValues,
                };
            }),
        );
        new OK({ message: 'Lấy danh sách thanh toán thành công', metadata: data }).send(res);
    }

    async getPaymentByAdmin(req, res) {
        const payments = await Payments.findAll();
        const data = await Promise.all(
            payments.map(async (payment) => {
                const findMovie = await Movie.findOne({ where: { id: payment.movieId } });
                const findUser = await User.findOne({ where: { id: payment.userId } });
                return {
                    ...payment?.dataValues,
                    movie: findMovie?.dataValues,
                    user: findUser?.dataValues,
                };
            }),
        );
        new OK({ message: 'Lấy danh sách thanh toán thành công', metadata: data }).send(res);
    }

    async updatePaymentStatus(req, res) {
        const { id, status } = req.body;
        const payment = await Payments.findOne({ where: { id: id } });
        if (!payment) {
            throw new BadRequestError('Thanh toán không tồn tại');
        }
        payment.status = status;
        await payment.save();

        new OK({ message: 'Cập nhật trạng thái thanh toán thành công', metadata: payment }).send(res);
    }

    async cancelBooking(req, res) {
        const { idPayment } = req.body;
        const payment = await Payments.findOne({ where: { id: idPayment } });
        if (!payment) {
            throw new BadRequestError('Thanh toán không tồn tại');
        }
        payment.status = 'canceled';
        await payment.save();
        new OK({ message: 'Hủy đặt vé thành công', metadata: payment }).send(res);
    }
}

module.exports = new PaymentsController();
