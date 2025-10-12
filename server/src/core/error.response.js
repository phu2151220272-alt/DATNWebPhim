'use strict';

const statusCodes = require('./statusCodes');
const reasonPhrases = require('./reasonPhrases');

/**
 * Class lỗi cơ sở cho tất cả các lỗi tùy chỉnh trong API
 * Kế thừa từ class Error có sẵn của JavaScript
 * @param {string} message - Thông báo lỗi
 * @param {number} statusCode - Mã trạng thái HTTP
 */
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

/**
 * Lỗi xung đột - Mã lỗi 409
 * Sử dụng khi yêu cầu xung đột với trạng thái hiện tại của server
 * Ví dụ: Tạo tài khoản với email đã tồn tại, tạo sản phẩm với mã đã có
 */
class ConflictRequestError extends ErrorResponse {
    constructor(message = reasonPhrases.CONFLICT, statusCode = statusCodes.CONFLICT) {
        super(message, statusCode);
    }
}

/**
 * Lỗi yêu cầu không hợp lệ - Mã lỗi 400
 * Sử dụng khi yêu cầu bị lỗi cú pháp hoặc thiếu thông tin
 * Ví dụ: Thiếu trường bắt buộc, định dạng dữ liệu không hợp lệ
 */
class BadRequestError extends ErrorResponse {
    constructor(message = reasonPhrases.BAD_REQUEST, statusCode = statusCodes.BAD_REQUEST) {
        super(message, statusCode);
    }
}

/**
 * Lỗi xác thực - Mã lỗi 401
 * Sử dụng khi người dùng chưa đăng nhập hoặc token không hợp lệ
 * Ví dụ: Token hết hạn, sai mật khẩu, thiếu token xác thực
 */
class AuthFailureError extends ErrorResponse {
    constructor(message = reasonPhrases.UNAUTHORIZED, statusCode = statusCodes.UNAUTHORIZED) {
        super(message, statusCode);
    }
}

/**
 * Lỗi không tìm thấy - Mã lỗi 404
 * Sử dụng khi không tìm thấy tài nguyên được yêu cầu
 * Ví dụ: Truy cập vào user không tồn tại, URL không hợp lệ
 */
class NotFoundError extends ErrorResponse {
    constructor(message = reasonPhrases.NOT_FOUND, statusCode = statusCodes.NOT_FOUND) {
        super(message, statusCode);
    }
}

/**
 * Lỗi cấm truy cập - Mã lỗi 403
 * Sử dụng khi người dùng không có quyền truy cập tài nguyên
 * Ví dụ: Người dùng thường truy cập trang admin, không đủ quyền thực hiện hành động
 */
class ForbiddenError extends ErrorResponse {
    constructor(message = reasonPhrases.FORBIDDEN, statusCode = statusCodes.FORBIDDEN) {
        super(message, statusCode);
    }
}

/**
 * Lỗi server - Mã lỗi 500
 * Sử dụng khi có lỗi không mong muốn xảy ra trên server
 * Ví dụ: Lỗi kết nối database, lỗi xử lý dữ liệu
 */
class InternalServerError extends ErrorResponse {
    constructor(message = reasonPhrases.INTERNAL_SERVER_ERROR, statusCode = statusCodes.INTERNAL_SERVER_ERROR) {
        super(message, statusCode);
    }
}

/**
 * Lỗi gateway - Mã lỗi 502
 * Sử dụng khi server nhận được phản hồi không hợp lệ từ server khác
 * Ví dụ: Lỗi khi gọi API bên thứ 3, lỗi kết nối microservice
 */
class BadGatewayError extends ErrorResponse {
    constructor(message = reasonPhrases.BAD_GATEWAY, statusCode = statusCodes.BAD_GATEWAY) {
        super(message, statusCode);
    }
}

/**
 * Lỗi service không khả dụng - Mã lỗi 503
 * Sử dụng khi server tạm thời không thể xử lý yêu cầu
 * Ví dụ: Server đang bảo trì, server quá tải
 */
class ServiceUnavailableError extends ErrorResponse {
    constructor(message = reasonPhrases.SERVICE_UNAVAILABLE, statusCode = statusCodes.SERVICE_UNAVAILABLE) {
        super(message, statusCode);
    }
}

/**
 * Lỗi dữ liệu không hợp lệ - Mã lỗi 422
 * Sử dụng khi dữ liệu gửi lên đúng format nhưng không hợp lệ về mặt logic
 * Ví dụ: Ngày sinh trong tương lai, số điện thoại sai định dạng
 */
class UnprocessableEntityError extends ErrorResponse {
    constructor(message = reasonPhrases.UNPROCESSABLE_ENTITY, statusCode = statusCodes.UNPROCESSABLE_ENTITY) {
        super(message, statusCode);
    }
}

/**
 * Lỗi quá nhiều yêu cầu - Mã lỗi 429
 * Sử dụng khi người dùng gửi quá nhiều yêu cầu trong một khoảng thời gian
 * Ví dụ: Giới hạn số lần đăng nhập, giới hạn số request API
 */
class TooManyRequestsError extends ErrorResponse {
    constructor(message = reasonPhrases.TOO_MANY_REQUESTS, statusCode = statusCodes.TOO_MANY_REQUESTS) {
        super(message, statusCode);
    }
}

module.exports = {
    ErrorResponse,
    ConflictRequestError,
    BadRequestError,
    AuthFailureError,
    NotFoundError,
    ForbiddenError,
    InternalServerError,
    BadGatewayError,
    ServiceUnavailableError,
    UnprocessableEntityError,
    TooManyRequestsError,
};
