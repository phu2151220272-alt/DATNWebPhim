import { useEffect, useState } from 'react';
import Footer from '../Components/Footer';
import Header from '../Components/Header';
import { Radio, Button, Divider, Modal, message } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import momoLogo from '../assets/images/momo-logo.png';
import vnpayLogo from '../assets/images/vnpay-logo.png';
import moment from 'moment';
import axios from 'axios';

import { useParams } from 'react-router-dom';
import { requestCreatePayment, requestGetMovieById, requestGetSeatByMovieId } from '../config/request';

function BookMovie() {
    const [selectedDate, setSelectedDate] = useState(moment()); // Default to today's date
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [movieDetails, setMovieDetails] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [currentTime, setCurrentTime] = useState(moment());
    const [seats, setSeats] = useState([]);
    const [seatsByRow, setSeatsByRow] = useState({});
    const [isLoadingSeats, setIsLoadingSeats] = useState(false);

    const { id } = useParams();

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(moment());
        }, 60000); // update every minute

        return () => clearInterval(timer);
    }, []);

    // Map for Vietnamese day names
    const viDayNames = {
        Mon: 'Thứ 2',
        Tue: 'Thứ 3',
        Wed: 'Thứ 4',
        Thu: 'Thứ 5',
        Fri: 'Thứ 6',
        Sat: 'Thứ 7',
        Sun: 'CN',
    };

    // Get Vietnamese day name
    const getViDayName = (date) => {
        const englishDay = date.format('ddd');
        return viDayNames[englishDay] || englishDay;
    };

    // Fetch movie details
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await requestGetMovieById(id);
                setMovieDetails(res.metadata);
                // Generate available dates for the next 30 days by default
                const dates = [];
                const today = moment();
                let startDate = today.clone();
                // If movie has dateStart and it's in the future, use it as the start date
                if (res.metadata.dateStart) {
                    const movieStartDate = moment(res.metadata.dateStart);
                    if (movieStartDate.isValid() && movieStartDate.isAfter(today)) {
                        startDate = movieStartDate;
                    }
                }

                // Calculate end date (use dateEnd if available, otherwise today + 30 days)
                const endDate =
                    res.metadata.dateEnd && moment(res.metadata.dateEnd).isValid()
                        ? moment(res.metadata.dateEnd)
                        : today.clone().add(30, 'days');
                // Generate dates from start to end
                let currentDate = startDate.clone();
                while (currentDate.isSameOrBefore(endDate)) {
                    dates.push(currentDate.clone());
                    currentDate.add(1, 'days');
                }
                setAvailableDates(dates);
                // Always set default date to today unless today is before movie start date
                if (startDate.isAfter(today)) {
                    setSelectedDate(startDate);
                } else {
                    setSelectedDate(today);
                }
            } catch (error) {
                console.error('Error fetching movie data:', error);
            }
        };
        fetchData();
    }, [id]);

    // Fetch seats when movie, date and time are selected
    useEffect(() => {
        if (movieDetails && selectedDate && selectedTime) {
            fetchSeats();
        }
    }, [movieDetails, selectedDate, selectedTime]);

    // Mock data for available time slots
    const availableTimeSlots = ['10:00', '12:30', '15:00', '17:30', '20:00', '22:30'];

    // Fetch seats from the server
    const fetchSeats = async () => {
        setIsLoadingSeats(true);
        try {
            // Format date for API request
            const formattedDate = selectedDate.format('YYYY-MM-DD');

            try {
                const data = {
                    date: formattedDate,
                    time: selectedTime,
                    idMovie: id,
                };
                // Gọi API để lấy danh sách ghế đã đặt theo ngày và giờ
                const response = await requestGetSeatByMovieId(data);

                // API trả về dữ liệu trong response.metadata
                if (response && response.metadata) {
                    // Lấy danh sách ghế đã đặt từ API
                    const bookedSeats = response.metadata;

                    // Tạo danh sách mã ghế đã đặt
                    const bookedSeatCodes = bookedSeats.map((seat) => seat.seat_code);

                    // Tạo bản đồ chỗ ngồi đầy đủ
                    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
                    const allSeats = [];
                    const seatsByRowObj = {};

                    rows.forEach((row) => {
                        seatsByRowObj[row] = [];
                        for (let i = 1; i <= 12; i++) {
                            const seatCode = `${row}${i}`;

                            // Kiểm tra ghế đã được đặt hay chưa
                            const isBooked = bookedSeatCodes.includes(seatCode);

                            const seat = {
                                row: row,
                                number: i,
                                seat_code: seatCode,
                                status: isBooked ? 'booked' : 'available',
                                movieId: id,
                                date: formattedDate,
                                time: selectedTime,
                            };

                            allSeats.push(seat);
                            seatsByRowObj[row].push(seat);
                        }
                    });

                    // Sắp xếp các hàng ghế theo thứ tự bảng chữ cái
                    const sortedSeatsByRow = Object.fromEntries(
                        Object.entries(seatsByRowObj).sort(([rowA], [rowB]) => rowA.localeCompare(rowB)),
                    );

                    // Cập nhật state
                    setSeats(allSeats);
                    setSeatsByRow(sortedSeatsByRow);
                    setSelectedSeats([]); // Reset selected seats when changing time/date
                    setIsLoadingSeats(false);
                    return;
                }
            } catch (apiError) {
                console.error('Error fetching seats from API:', apiError);
            }

            // Nếu API thất bại hoặc không có dữ liệu, tạo bản đồ chỗ ngồi mô phỏng
            const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
            const mockSeats = [];
            const mockSeatsByRow = {};

            rows.forEach((row) => {
                mockSeatsByRow[row] = [];
                for (let i = 1; i <= 12; i++) {
                    // Chỉ sử dụng trạng thái "available" và "booked" theo API
                    const randomStatus = Math.random() < 0.85 ? 'available' : 'booked';

                    const seat = {
                        row: row,
                        number: i,
                        seat_code: `${row}${i}`,
                        status: randomStatus,
                        movieId: id,
                        date: formattedDate,
                        time: selectedTime,
                    };

                    mockSeats.push(seat);
                    mockSeatsByRow[row].push(seat);
                }
            });

            setSeats(mockSeats);
            setSeatsByRow(mockSeatsByRow);
            setSelectedSeats([]); // Reset selected seats when changing time/date
        } catch (error) {
            console.error('Error fetching seats:', error);
            message.error('Không thể tải dữ liệu ghế ngồi');
        } finally {
            setIsLoadingSeats(false);
        }
    };

    // Check if a time slot is already past for today
    const isTimeSlotPast = (timeSlot) => {
        // Only apply time restrictions for today
        if (!selectedDate.isSame(moment(), 'day')) return false;

        const [hours, minutes] = timeSlot.split(':').map(Number);
        const slotTime = moment().set({
            hours,
            minutes,
            seconds: 0,
            milliseconds: 0,
        });

        // Add 10 minutes buffer (cannot book less than 10 minutes before showtime)
        return slotTime.isBefore(moment().add(10, 'minutes'));
    };

    const handleSeatClick = (seatCode) => {
        const seat = seats.find((s) => s.seat_code === seatCode);

        if (!seat || seat.status !== 'available') {
            return;
        }

        if (selectedSeats.includes(seatCode)) {
            setSelectedSeats(selectedSeats.filter((code) => code !== seatCode));
        } else {
            setSelectedSeats([...selectedSeats, seatCode]);
        }
    };

    const getSeatStatus = (seatCode) => {
        const seat = seats.find((s) => s.seat_code === seatCode);
        if (!seat) return 'booked';

        if (seat.status === 'booked') {
            return 'booked';
        }

        return selectedSeats.includes(seatCode) ? 'selected' : 'available';
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setSelectedTime(null); // Reset time when date changes
        setSelectedSeats([]); // Reset selected seats
    };

    const handleTimeSelection = (time) => {
        if (isTimeSlotPast(time)) {
            message.error('Suất chiếu này đã bắt đầu. Vui lòng chọn suất chiếu khác.');
            return;
        }
        setSelectedTime(time);
    };

    const handlePayment = () => {
        if (!selectedDate || !selectedTime || selectedSeats.length === 0 || !paymentMethod) {
            message.error('Vui lòng chọn đầy đủ thông tin đặt vé!');
            return;
        }

        setIsModalVisible(true);
    };

    const handlePaymentConfirm = async () => {
        const dateOnly = new Date(selectedDate).toISOString().split('T')[0]; // "2025-06-27"
        const combined = new Date(`${dateOnly}T${selectedTime}:00Z`); // Kết hợp với giờ

        const data = {
            typePayment: paymentMethod,
            idMovie: movieDetails.id,
            idSeat: selectedSeats,
            time: selectedTime,
            date: selectedDate.format('YYYY-MM-DD'),
        };

        try {
            const res = await requestCreatePayment(data);
            if (paymentMethod === 'momo') {
                window.open(res.metadata.payUrl);
            }
            if (paymentMethod === 'vnpay') {
                window.open(res.metadata);
            }
            setIsModalVisible(false);
        } catch (error) {
            console.log(error);
        }
    };

    const totalAmount = selectedSeats.length * (movieDetails?.price ? parseInt(movieDetails.price) : 0);
    const formattedPrice = (price) => price.toLocaleString('vi-VN') + ' VNĐ';

    // Format a date display string based on movie dates
    const getShowtimeDateRange = () => {
        if (!movieDetails) return 'Đang cập nhật';

        const startDateStr =
            movieDetails.dateStart && moment(movieDetails.dateStart).isValid()
                ? moment(movieDetails.dateStart).format('DD/MM/YYYY')
                : 'Hôm nay';

        const endDateStr =
            movieDetails.dateEnd && moment(movieDetails.dateEnd).isValid()
                ? moment(movieDetails.dateEnd).format('DD/MM/YYYY')
                : 'Không giới hạn';

        return `${startDateStr} - ${endDateStr}`;
    };

    // Render seat by seat status
    const renderSeat = (seat) => {
        const status = getSeatStatus(seat.seat_code);
        let colorClass = '';

        switch (status) {
            case 'available':
                colorClass = 'bg-[#444] text-white hover:bg-[#555] cursor-pointer';
                break;
            case 'selected':
                colorClass = 'bg-red-600 text-white cursor-pointer';
                break;
            case 'booked':
                colorClass = 'bg-gray-700 text-gray-500 cursor-not-allowed';
                break;
            default:
                colorClass = 'bg-gray-700 text-gray-500 cursor-not-allowed';
        }

        return (
            <div
                key={seat.seat_code}
                className={`h-10 flex items-center justify-center rounded text-sm ${colorClass}`}
                onClick={() => handleSeatClick(seat.seat_code)}
            >
                {seat.seat_code}
            </div>
        );
    };

    return (
        <div className="bg-[#161616] min-h-screen text-white">
            <header>
                <Header />
            </header>

            <main className="container mx-auto py-20 px-4">
                <div className="flex flex-col md:flex-row gap-8 pt-16">
                    {/* Movie details - Left side */}
                    <div className="w-full md:w-1/3">
                        <div className="bg-[#222] p-6 rounded-lg shadow-lg">
                            <div className="mb-4">
                                <img
                                    src={`${movieDetails?.poster_url}`}
                                    alt={movieDetails?.name}
                                    className="w-full h-auto rounded-md mb-4"
                                />
                            </div>

                            <h1 className="text-2xl font-bold mb-2">{movieDetails?.name}</h1>

                            <div className="text-gray-300 space-y-3">
                                <div className="flex items-center gap-2">
                                    <ClockCircleOutlined />
                                    <span>{movieDetails?.time} phút</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarOutlined />
                                    <span>Lịch chiếu: {getShowtimeDateRange()}</span>
                                </div>
                            </div>

                            {selectedDate && selectedTime && selectedSeats.length > 0 && (
                                <>
                                    <Divider className="border-gray-700 my-4" />

                                    <div className="space-y-2">
                                        <p className="text-gray-300">
                                            Ngày chiếu:{' '}
                                            <span className="text-white">
                                                {getViDayName(selectedDate)}, {selectedDate.format('DD/MM/YYYY')}
                                            </span>
                                        </p>
                                        <p className="text-gray-300">
                                            Giờ chiếu: <span className="text-white">{selectedTime}</span>
                                        </p>
                                        <p className="text-gray-300">
                                            Ghế đã chọn: <span className="text-white">{selectedSeats.join(', ')}</span>
                                        </p>
                                        <p className="text-gray-300">
                                            Số lượng vé: <span className="text-white">{selectedSeats.length}</span>
                                        </p>
                                        <p className="text-gray-300">
                                            Giá vé:{' '}
                                            <span className="text-white">
                                                {movieDetails?.price
                                                    ? parseInt(movieDetails.price).toLocaleString('vi-VN')
                                                    : 0}{' '}
                                                VNĐ / ghế
                                            </span>
                                        </p>
                                    </div>

                                    <Divider className="border-gray-700 my-4" />

                                    <div className="flex justify-between items-center">
                                        <p className="text-lg font-semibold">Tổng tiền:</p>
                                        <p className="text-xl font-bold text-red-500">{formattedPrice(totalAmount)}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Booking form - Right side */}
                    <div className="w-full md:w-2/3">
                        <div className="bg-[#222] p-6 rounded-lg shadow-lg mb-6">
                            <h2 className="text-xl font-semibold mb-4">Chọn ngày xem phim</h2>

                            {availableDates.length > 0 && (
                                <div className="date-selector">
                                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
                                        {availableDates.slice(0, 7).map((date, index) => {
                                            const isToday = date.isSame(moment(), 'day');
                                            return (
                                                <div
                                                    key={index}
                                                    className={`
                                                        cursor-pointer rounded text-center px-1 py-3
                                                        border transition-all duration-200
                                                        ${
                                                            selectedDate && date.isSame(selectedDate, 'day')
                                                                ? 'bg-red-600 border-red-700 text-white'
                                                                : isToday
                                                                ? 'bg-[#333] border-yellow-500 text-yellow-400 hover:bg-[#444]'
                                                                : 'bg-[#333] border-transparent text-gray-300 hover:bg-[#444] hover:border-gray-600'
                                                        }
                                                    `}
                                                    onClick={() => handleDateChange(date)}
                                                >
                                                    <div className="text-sm font-medium mb-1">{getViDayName(date)}</div>
                                                    <div
                                                        className={`text-lg font-bold ${
                                                            isToday ? 'text-yellow-400' : ''
                                                        }`}
                                                    >
                                                        {date.format('DD')}
                                                    </div>
                                                    <div className="text-xs opacity-70">{date.format('MM/YYYY')}</div>
                                                    {isToday && (
                                                        <div className="mt-1">
                                                            <span className="bg-yellow-600 text-yellow-100 text-xs px-2 py-0.5 rounded-full">
                                                                Hôm nay
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedDate && (
                            <div className="bg-[#222] p-6 rounded-lg shadow-lg mb-6">
                                <h2 className="text-xl font-semibold mb-4">
                                    Chọn suất chiếu
                                    {selectedDate.isSame(moment(), 'day') && (
                                        <span className="ml-2 text-sm text-yellow-500">
                                            (Giờ hiện tại: {moment().format('HH:mm')})
                                        </span>
                                    )}
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {availableTimeSlots.map((time) => {
                                        const isPast = isTimeSlotPast(time);
                                        return (
                                            <div
                                                key={time}
                                                className={`
                                                    py-2 px-4 border rounded-md text-center transition-colors
                                                    ${
                                                        selectedTime === time
                                                            ? 'bg-red-600 border-red-700 text-white'
                                                            : isPast
                                                            ? 'bg-gray-700 border-gray-800 text-gray-500 cursor-not-allowed'
                                                            : 'border-gray-700 hover:border-gray-500 text-gray-300 cursor-pointer'
                                                    }
                                                `}
                                                onClick={() => !isPast && handleTimeSelection(time)}
                                            >
                                                {time}
                                                {isPast && <div className="text-xs mt-1 text-gray-500">Đã qua</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {selectedDate && selectedTime && (
                            <div className="bg-[#222] p-6 rounded-lg shadow-lg mb-6">
                                <h2 className="text-xl font-semibold mb-4">Chọn ghế ngồi</h2>

                                <div className="bg-[#333] p-4 mb-8 rounded-md text-center">
                                    <div className="w-2/3 h-2 bg-gray-600 mx-auto rounded-lg mb-8"></div>
                                    <p className="text-gray-400 text-sm">MÀN HÌNH</p>
                                </div>

                                {isLoadingSeats ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
                                    </div>
                                ) : Object.keys(seatsByRow).length > 0 ? (
                                    <div className="mb-8">
                                        {/* Seat layout by rows */}
                                        {Object.entries(seatsByRow).map(([row, rowSeats]) => (
                                            <div key={row} className="mb-2">
                                                <div className="flex items-center mb-1">
                                                    <div className="w-6 h-6 flex items-center justify-center bg-gray-700 text-white rounded mr-2">
                                                        {row}
                                                    </div>
                                                    <div className="h-px flex-1 bg-gray-700"></div>
                                                </div>
                                                <div className="grid grid-cols-12 gap-2">
                                                    {rowSeats.map((seat) => renderSeat(seat))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        Không có thông tin ghế ngồi cho suất chiếu này
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-6 justify-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-[#444] rounded"></div>
                                        <span className="text-sm">Ghế trống</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-red-600 rounded"></div>
                                        <span className="text-sm">Ghế đã chọn</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gray-700 rounded"></div>
                                        <span className="text-sm">Ghế đã bán</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedDate && selectedTime && selectedSeats.length > 0 && (
                            <div className="bg-[#222] p-6 rounded-lg shadow-lg mb-6">
                                <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>

                                <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
                                    <div className="space-y-3">
                                        <div
                                            className={`
                                                flex items-center p-3 rounded-lg cursor-pointer border
                                                ${paymentMethod === 'momo' ? 'border-red-500' : 'border-gray-700'}
                                            `}
                                            onClick={() => setPaymentMethod('momo')}
                                        >
                                            <Radio value="momo" className="radio-primary" />
                                            <div className="ml-4 flex items-center">
                                                <div className="h-10 w-10 flex items-center justify-center mr-3 rounded bg-[#d82d8b]">
                                                    <img src={momoLogo} alt="MoMo" className="h-7 w-7 object-contain" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">MoMo</p>
                                                    <p className="text-sm text-gray-400">Thanh toán qua ví MoMo</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`
                                                flex items-center p-3 rounded-lg cursor-pointer border
                                                ${paymentMethod === 'vnpay' ? 'border-red-500' : 'border-gray-700'}
                                            `}
                                            onClick={() => setPaymentMethod('vnpay')}
                                        >
                                            <Radio value="vnpay" className="radio-primary" />
                                            <div className="ml-4 flex items-center">
                                                <div className="h-10 w-10 flex items-center justify-center mr-3 rounded bg-white">
                                                    <img
                                                        src={vnpayLogo}
                                                        alt="VNPay"
                                                        className="h-7 w-7 object-contain"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-medium">VNPay</p>
                                                    <p className="text-sm text-gray-400">Thanh toán qua VNPay QR</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Radio.Group>

                                <div className="mt-6">
                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        onClick={handlePayment}
                                        className="h-12 bg-red-600 hover:bg-red-700 border-none"
                                        disabled={!paymentMethod}
                                    >
                                        Thanh toán {formattedPrice(totalAmount)}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Payment confirmation modal */}
            <Modal
                title="Xác nhận thanh toán"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setIsModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" className="bg-red-600" onClick={handlePaymentConfirm}>
                        Xác nhận
                    </Button>,
                ]}
            >
                <div className="space-y-4 pt-4">
                    <p>
                        <strong>Phim:</strong> {movieDetails?.name}
                    </p>

                    <p>
                        <strong>Ngày chiếu:</strong>{' '}
                        {selectedDate && `${getViDayName(selectedDate)}, ${selectedDate.format('DD/MM/YYYY')}`}
                    </p>
                    <p>
                        <strong>Giờ chiếu:</strong> {selectedTime}
                    </p>
                    <p>
                        <strong>Ghế đã chọn:</strong> {selectedSeats.join(', ')}
                    </p>
                    <p>
                        <strong>Phương thức thanh toán:</strong> {paymentMethod === 'momo' ? 'MoMo' : 'VNPay'}
                    </p>
                    <Divider />
                    <div className="flex justify-between">
                        <p className="font-bold">Tổng tiền:</p>
                        <p className="font-bold text-red-500">{formattedPrice(totalAmount)}</p>
                    </div>
                </div>
            </Modal>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default BookMovie;
