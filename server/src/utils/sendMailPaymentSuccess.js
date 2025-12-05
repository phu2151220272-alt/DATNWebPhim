const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendMailPaymentSuccess = async (email, data) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.USER_EMAIL,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2c3e50; font-size: 24px; margin-bottom: 10px;">StreamLab</h1>
                    <div style="width: 50px; height: 3px; background-color: #3498db; margin: 0 auto;"></div>
                </div>

                <div style="margin-bottom: 30px;">
                    <h2 style="color: #34495e; font-size: 20px; margin-bottom: 15px;">Xác nhận đặt vé xem phim thành công</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                        Chào bạn,
                    </p>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Bạn đã đặt vé xem phim thành công. Dưới đây là thông tin chi tiết vé của bạn:
                    </p>
                </div>

                <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p style="color: #2c3e50; font-size: 14px; margin-bottom: 10px; font-weight: bold;">THÔNG TIN VÉ:</p>

                    <div style="background-color: #3498db; color: white; font-size: 16px; font-weight: bold; padding: 15px; border-radius: 5px;">
                        🎬 Phim: ${data.movieName}
                    </div>

                    <p style="margin: 12px 0 5px; color:#2c3e50;"><strong>💺 Ghế:</strong> ${data.seats}</p>
                    <p style="margin: 5px 0; color:#2c3e50;"><strong>🕒 Giờ chiếu:</strong> ${data.time}</p>
                    <p style="margin: 5px 0; color:#2c3e50;"><strong>📅 Ngày chiếu:</strong> ${data.date}</p>
                    <p style="margin: 5px 0; color:#2c3e50;"><strong>💵 Tổng tiền:</strong> ${data.totalPrice.toLocaleString()} VNĐ</p>
                    <p style="margin: 5px 0; color:#2c3e50;"><strong>🔑 Mã thanh toán:</strong> ${data.paymentId}</p>
                    <p style="margin: 5px 0; color:#2c3e50;"><strong>💳 Phương thức:</strong> ${data.paymentMethod.toUpperCase()}</p>
                </div>

                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                    <p style="color: #856404; font-size: 14px; margin: 0;">
                        <strong>Lưu ý:</strong><br>
                        • Vui lòng đến sớm 10 phút trước giờ chiếu.<br>
                        • Giữ lại mã thanh toán để đối chiếu khi cần thiết.<br>
                        • Nếu bạn không thực hiện giao dịch này, hãy liên hệ hỗ trợ ngay.
                    </p>
                </div>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 10px;">
                        Cảm ơn bạn đã sử dụng dịch vụ StreamLab
                    </p>
                    <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
                        Email này được gửi tự động, vui lòng không trả lời.<br>
                        © 2024 StreamLab. Tất cả quyền được bảo lưu.
                    </p>
                </div>

            </div>
        </div>`;

        await transport.sendMail({
            from: `"StreamLab" <${process.env.USER_EMAIL}>`,
            to: email,
            subject: `Xác nhận đặt vé thành công – ${data.movieName}`,
            html: html,
        });

        console.log("Email vé xem phim đã được gửi thành công!");
    } catch (error) {
        console.log("Lỗi khi gửi email:", error);
        throw error;
    }
};

module.exports = sendMailPaymentSuccess;
