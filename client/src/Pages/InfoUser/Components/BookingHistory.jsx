import { Button, Tag, Modal, Rate, Input } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { requestCancelBooking, requestCreatePreviewMovie, requestGetPaymentByUserId } from '../../../config/request';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';

// Custom status tag component
const StatusTag = ({ status }) => {
    let color, text;

    switch (status) {
        case 'success':
            color = 'green';
            text = 'Thành công';
            break;
        case 'pending':
            color = 'orange';
            text = 'Đang xử lý';
            break;
        case 'canceled':
            color = 'red';
            text = 'Đã hủy';
            break;
        default:
            color = 'red';
            text = 'Thất bại';
    }

    return (
        <Tag color={color} className="rounded-full px-3 py-1 text-xs font-medium">
            {text}
        </Tag>
    );
};

// Payment method tag component
const PaymentMethodTag = ({ method }) => {
    const isVnpay = method === 'vnpay';
    return (
        <Tag color={isVnpay ? 'blue' : 'magenta'} className="rounded-full px-3 py-1 text-xs font-medium">
            {isVnpay ? 'VNPay' : 'MoMo'}
        </Tag>
    );
};

// Movie Rating Modal Component
const MovieRatingModal = ({ visible, onClose, movie }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = async () => {
        try {
            const res = await requestCreatePreviewMovie({ movieId: movie.id, rating, comment });
            toast.success(res.message);
            onClose();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    return (
        <Modal
            title={<div className="text-xl font-bold">Đánh giá phim: {movie?.name}</div>}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmit} disabled={rating === 0}>
                    Gửi đánh giá
                </Button>,
            ]}
        >
            <div className="py-4 space-y-6">
                <div className="flex flex-col items-center">
                    <p className="mb-2 font-medium">Chọn số sao:</p>
                    <Rate allowHalf value={rating} onChange={setRating} style={{ fontSize: 32 }} />
                    <div className="mt-2 text-gray-500">{rating ? `${rating} sao` : 'Chưa đánh giá'}</div>
                </div>

                <div className="space-y-2">
                    <p className="font-medium">Nhận xét của bạn:</p>
                    <Input.TextArea
                        rows={4}
                        value={comment}
                        onChange={(e) => {
                            const text = e.target.value;
                            if (text.length <= 200) {
                                setComment(text);
                            }
                        }}
                        maxLength={200}
                        showCount
                        placeholder="Nhận xét của bạn về phim (tối đa 200 chữ)"
                    />
                </div>
            </div>
        </Modal>
    );
};

function BookingHistory() {
    const [bookings, setBookings] = useState([]);
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [selectedPreviewMovie, setSelectedPreviewMovie] = useState(null);

    const fetchPayments = async () => {
        const res = await requestGetPaymentByUserId();
        setBookings(res.metadata);
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleCancelBooking = async (id) => {
        try {
            const res = await requestCancelBooking({ idPayment: id });
            toast.success(res.message);
            fetchPayments();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const openRatingModal = (movie) => {
        setSelectedMovie(movie);
        setRatingModalVisible(true);
    };

    return (
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#161616] rounded-xl p-6 shadow-lg">
            <ToastContainer />
            <h2 className="text-2xl font-bold mb-6 text-white">Lịch sử đặt vé</h2>

            <div className="space-y-6">
                {bookings.map((booking) => (
                    <div
                        key={booking.id}
                        className="bg-[#222] rounded-xl overflow-hidden shadow transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20"
                    >
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-1/4 h-48 md:h-auto">
                                <img
                                    src={`${booking.movie.poster_url}`}
                                    alt={booking.movie.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6 w-full md:w-3/4 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-white">{booking.movie.name}</h3>
                                    <StatusTag status={booking.status} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <CalendarOutlined className="text-red-500" />
                                        <span className="text-gray-300">
                                            {new Date(booking.date).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <ClockCircleOutlined className="text-red-500" />
                                        <span className="text-gray-300">{booking.time}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <UserOutlined className="text-red-500" />
                                        <span className="text-gray-300">Ghế: {booking.seatId}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MoneyCollectOutlined className="text-red-500" />
                                        <span className="text-gray-300">
                                            {booking.totalPrice.toLocaleString('vi-VN')} VNĐ
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-auto">
                                    <PaymentMethodTag method={booking.paymentMethod} />
                                    {booking.status === 'pending' && (
                                        <Button type="primary" danger onClick={() => handleCancelBooking(booking.id)}>
                                            Hủy đặt vé
                                        </Button>
                                    )}
                                    {booking.status === 'success' && !booking.previewMovie && (
                                        <Button type="primary" onClick={() => openRatingModal(booking.movie)}>
                                            Đánh giá phim
                                        </Button>
                                    )}
                                    {booking.previewMovie && booking.status === 'success' && (
                                        <Link to={`/movie/${booking.movie.id}`}>
                                            <Button type="primary">Xem đánh giá</Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <MovieRatingModal
                visible={ratingModalVisible}
                onClose={() => setRatingModalVisible(false)}
                movie={selectedMovie}
            />
        </div>
    );
}

export default BookingHistory;
