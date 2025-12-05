import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { HomeOutlined, HistoryOutlined } from '@ant-design/icons';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import momoLogo from '../assets/images/momo-logo.png';
import vnpayLogo from '../assets/images/vnpay-logo.png';
import { requestGetPaymentById } from '../config/request';

function PaymentSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                setLoading(true);
                if (id) {
                    const res = await requestGetPaymentById(id);
                    if (res && res.metadata) {
                        setPaymentData({
                            ...res.metadata,
                            movieName: res.metadata.movie?.name || '',
                        });
                    }
                } else {
                    // Fallback to URL params if no ID
                    const queryParams = new URLSearchParams(location.search);
                    const data = {};

                    if (queryParams.get('movieId')) {
                        data.movieId = queryParams.get('movieId');
                    }
                    if (queryParams.get('movieName')) {
                        data.movieName = queryParams.get('movieName');
                    }
                    if (queryParams.get('totalPrice')) {
                        data.totalPrice = queryParams.get('totalPrice');
                    }
                    if (queryParams.get('seatId')) {
                        data.seatId = queryParams.get('seatId');
                    }
                    if (queryParams.get('time')) {
                        data.time = queryParams.get('time');
                    }
                    if (queryParams.get('date')) {
                        data.date = queryParams.get('date');
                    }
                    if (queryParams.get('paymentMethod')) {
                        data.paymentMethod = queryParams.get('paymentMethod');
                    }
                    if (Object.keys(data).length > 0) {
                        setPaymentData(data);
                    } else {
                        // Show mock data for preview
                        setPaymentData({
                            id: 'PAY175105144970349703',
                            movieId: '05ab790f-4bbd-4f8f-97f3-b0c948b98be5',
                            movieName: 'Phù Thuỷ Tối Thượng 10',
                            date: '2025-06-27T10:00:00.000Z',
                            time: '10:00',
                            seatId: 'A7,A8',
                            totalPrice: 100000,
                            paymentMethod: 'vnpay',
                            status: 'success',
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching payment data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayment();
    }, [id, location]);

    // Format price to VND
    const formatPrice = (price) => {
        if (!price) return '0 VNĐ';
        return parseInt(price).toLocaleString('vi-VN') + ' VNĐ';
    };

    // Format date to Vietnamese format
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Convert seatId string to array
    const getSeatArray = (seatString) => {
        if (!seatString) return [];
        return seatString.split(',').map((seat) => seat.trim());
    };

    if (loading) {
        return (
            <div className="bg-[#161616] min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff4d4f]"></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-[#161616] min-h-screen flex flex-col">
            <Header />

            <div className="flex-grow flex items-center justify-center px-4 py-8 mt-20">
                <div className="w-full max-w-lg">
                    {/* Success icon and message */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-[#4CAF50] flex items-center justify-center mb-5">
                            <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white text-center">Thanh toán thành công!</h1>
                        <p className="text-gray-400 mt-2 text-center">Cảm ơn bạn đã đặt vé xem phim tại StreamPhim</p>
                    </div>

                    {/* Payment info card */}
                    <div className="bg-[#1a1a1a] rounded-lg overflow-hidden shadow-lg">
                        {/* Movie ticket info */}
                        <div className="px-6 py-5 border-b border-[#333]">
                            <h2 className="text-xl text-[#ff4d4f] font-medium mb-4">Thông tin đặt vé</h2>

                            {paymentData?.movieName && (
                                <div className="mb-3 flex flex-col">
                                    <span className="text-gray-400 text-sm">Phim</span>
                                    <span className="text-white text-base font-medium">{paymentData.movieName}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {paymentData?.date && (
                                    <div className="mb-3">
                                        <span className="text-gray-400 text-sm">Ngày chiếu</span>
                                        <div className="text-white">{formatDate(paymentData.date)}</div>
                                    </div>
                                )}

                                {paymentData?.time && (
                                    <div className="mb-3">
                                        <span className="text-gray-400 text-sm">Giờ chiếu</span>
                                        <div className="text-white">{paymentData.time}</div>
                                    </div>
                                )}
                            </div>

                            {paymentData?.seatId && (
                                <div className="mb-3">
                                    <span className="text-gray-400 text-sm">Ghế</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {getSeatArray(paymentData.seatId).map((seat) => (
                                            <span
                                                key={seat}
                                                className="bg-[#2b2b2b] px-2 py-1 rounded text-white text-sm"
                                            >
                                                {seat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {paymentData?.id && (
                                <div className="mb-3 mt-4">
                                    <span className="text-gray-400 text-sm">Mã đơn hàng</span>
                                    <div className="text-white font-mono bg-[#2b2b2b] px-3 py-2 mt-1 rounded text-sm overflow-auto">
                                        {paymentData.id}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment method info */}
                        <div className="px-6 py-5">
                            <h2 className="text-xl text-[#ff4d4f] font-medium mb-4">Thông tin thanh toán</h2>

                            <div className="grid grid-cols-2 gap-4">
                                {paymentData?.paymentMethod && (
                                    <div className="mb-3">
                                        <span className="text-gray-400 text-sm">Phương thức thanh toán</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            {paymentData.paymentMethod === 'momo' ? (
                                                <div className="flex items-center gap-2">
                                                    <img src={momoLogo} alt="MoMo" className="h-6" />
                                                    <span className="text-white">MoMo</span>
                                                </div>
                                            ) : paymentData.paymentMethod === 'vnpay' ? (
                                                <div className="flex items-center gap-2">
                                                    <img src={vnpayLogo} alt="VNPay" className="h-6" />
                                                    <span className="text-white">VNPay</span>
                                                </div>
                                            ) : (
                                                <span className="text-white">{paymentData.paymentMethod}</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {paymentData?.status && (
                                    <div className="mb-3">
                                        <span className="text-gray-400 text-sm">Trạng thái</span>
                                        <div
                                            className={`font-medium mt-1 ${
                                                paymentData.status === 'success'
                                                    ? 'text-green-500'
                                                    : paymentData.status === 'pending'
                                                    ? 'text-yellow-500'
                                                    : 'text-red-500'
                                            }`}
                                        >
                                            {paymentData.status === 'success'
                                                ? 'Thành công'
                                                : paymentData.status === 'pending'
                                                ? 'Đang xử lý'
                                                : 'Thất bại'}
                                        </div>
                                    </div>
                                )}

                                {paymentData?.totalPrice && (
                                    <div className="mb-3 col-span-2">
                                        <span className="text-gray-400 text-sm">Tổng tiền</span>
                                        <div className="text-[#4CAF50] font-bold text-xl mt-1">
                                            {formatPrice(paymentData.totalPrice)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex border-t border-[#333]">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center justify-center gap-2 flex-1 py-4 text-white bg-[#e53e3e] hover:bg-[#c53030] transition-colors duration-300"
                            >
                                <HomeOutlined />
                                <span>Trang chủ</span>
                            </button>
                            <button
                                onClick={() => navigate('/h')}
                                className="flex items-center justify-center gap-2 flex-1 py-4 text-white bg-[#22262A] hover:bg-[#33373B] transition-colors duration-300 border-l border-[#333]"
                            >
                                <HistoryOutlined />
                                <span>Lịch sử đặt vé</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default PaymentSuccess;
