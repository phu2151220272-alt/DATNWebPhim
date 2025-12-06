const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const Movies = require('../models/movie.model');
const MessageChatbot = require('../models/messageChatbot.model');

/**
 * AI tư vấn phim theo MySQL2 + Sequelize (Chuẩn theo model của bạn)
 */
async function askMovieAssistant(question, userId) {
    try {
        // 🧠 Lấy lịch sử chat gần nhất
        const recentMessages = await MessageChatbot.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: 5,
        });

        const conversation = recentMessages.reverse();

        const conversationText = conversation
            .map((msg) => `${msg.sender === 'user' ? 'Người dùng' : 'Bot'}: ${msg.content}`)
            .join('\n');
         const bookingUrl = (movieId) => `http://localhost:5173/booking/${movieId}`
        // 🎬 Lấy toàn bộ phim
        const movies = await Movies.findAll();

        if (!movies.length) return 'Hiện tại hệ thống chưa có bộ phim nào.';

        const movieData = movies
            .map(
                (m) => `
Tên phim: ${m.name}
Đạo diễn: ${m.director}
Diễn viên: ${m.actor}
Quốc gia: ${m.country}
Thể loại (category ID): ${m.category}
Chất lượng: ${m.quality}
Năm chiếu: ${m.year}
Thời lượng: ${m.time}
Giá xem: ${m.price || 'Miễn phí'}
Mô tả: ${m.description.substring(0, 120)}...
Đặt vé:${bookingUrl(m.id)};
===============================`,
            )
            .join('\n');

        // 🧩 Prompt đào tạo
        const trainingPrompt = `
Bạn là "MovieBot" – trợ lý tư vấn phim chuyên nghiệp và thân thiện.

Dưới đây là danh sách phim trong hệ thống:
${movieData}

Lịch sử trò chuyện gần đây:
${conversationText}

Người dùng hỏi: "${question}"

Hướng dẫn:
1. Gợi ý phim dựa theo yêu cầu người dùng (thể loại, diễn viên, quốc gia, chất lượng, năm, giá...).
2. Không bịa thêm phim không có trong danh sách.
3. Trả lời tự nhiên, ngắn gọn, thân thiện.
4. Khi cần đưa link đặt vé, hãy dùng **nguyên văn** đường dẫn sau phần "Đặt vé:" trong dữ liệu phim.
   Không được thêm dấu chấm, dấu phẩy hoặc ký tự nào ngay sau URL.
`;

        // Gọi Groq AI
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'Bạn là MovieBot – tư vấn phim chuyên nghiệp.' },
                { role: 'user', content: trainingPrompt },
            ],
            temperature: 0.7,
            max_tokens: 800,
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('❌ Lỗi askMovieAssistant:', error);
        return 'Xin lỗi, hệ thống tư vấn phim đang gặp lỗi.';
    }
}

module.exports = { askMovieAssistant };
