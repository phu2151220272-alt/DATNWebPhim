require('dotenv').config();
const { Groq } = require('groq-sdk');
const modelMovie = require('../models/movie.model');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function searchMovieGroq(name) {
    try {
        // Lấy tất cả phim từ database
        const movies = await modelMovie.findAll({});

        // Tạo prompt cho Groq
        const prompt = `
        Bạn là một chuyên gia tìm kiếm phim.
        Bạn có thể tìm kiếm phim theo:
        - Tên phim
        - Tên diễn viên
        - Tên đạo diễn
        - Tên nhà sản xuất
        - Thể loại
        - Quốc gia
        - Năm phát hành

        Dữ liệu phim hiện có:
        ${JSON.stringify(movies)}

        Từ khóa người dùng nhập: "${name}"

        🎯 Hãy trả về CHỈ MỘT MẢNG JSON gồm các ID phim phù hợp.
        Ví dụ: [1, 2, 3]
        KHÔNG thêm bất kỳ text nào khác ngoài mảng JSON.
        `;

        // Gọi Groq API
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        let data = response.choices[0]?.message?.content?.trim() || '';

        // Xử lý chuỗi trả về -> mảng JSON
        data = data.replace(/```json|```/g, '').trim();

        let movieIds;
        try {
            movieIds = JSON.parse(data);
        } catch (parseError) {
            const match = data.match(/\[[\d,\s]+\]/);
            if (match) {
                movieIds = JSON.parse(match[0]);
            } else {
                console.error('❌ Không thể parse movie IDs:', data);
                return [];
            }
        }

        if (!Array.isArray(movieIds)) {
            console.error('❌ Movie IDs không phải là mảng:', movieIds);
            return [];
        }

        // Nếu rỗng thì return []
        if (movieIds.length === 0) {
            return [];
        }

        // Truy vấn DB để lấy danh sách phim
        const foundMovies = await modelMovie.findAll({
            where: {
                id: movieIds,
            },
        });

        return foundMovies;
    } catch (error) {
        console.error('🔥 Lỗi trong searchMovieGroq:', error);
        throw error;
    }
}

module.exports = searchMovieGroq;
