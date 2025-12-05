import { useState } from 'react';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import { requestLogout } from '../../config/request';
import { message } from 'antd';

// Import components
import UserSidebar from './Components/UserSidebar';
import ProfileForm from './Components/ProfileForm';
import BookingHistory from './BookingHistory';
import { ToastContainer } from 'react-toastify';
import AvatarUploadModal from './Components/AvatarUploadModal';

function ProfileUser() {
    const [selectedMenu, setSelectedMenu] = useState('profile');
    const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);

    // Mock user data based on user model
    const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        avatar: null,
        fullName: 'Nguyễn Văn A',
        phone: '0987654321',
        email: 'nguyenvana@example.com',
        isAdmin: '0',
        typeLogin: 'email',
        createdAt: '2023-12-01',
    };

    // Mock payment history data based on payment model
    const mockPayments = [
        {
            id: '550e8400-e29b-41d4-a716-446655440001',
            movieId: 'movie-001',
            movieName: 'Avengers: Endgame',
            userId: mockUser.id,
            seatId: 'A1, A2',
            totalPrice: 200000,
            time: '20:00',
            date: '2024-06-10',
            paymentMethod: 'momo',
            status: 'success',
            posterUrl: 'https://lumiere-a.akamaihd.net/v1/images/p_avengersendgame_19751_e14a0104.jpeg',
        },
        {
            id: '550e8400-e29b-41d4-a716-446655440002',
            movieId: 'movie-002',
            movieName: 'Inception',
            userId: mockUser.id,
            seatId: 'B5, B6',
            totalPrice: 180000,
            time: '18:30',
            date: '2024-06-15',
            paymentMethod: 'vnpay',
            status: 'success',
            posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
        },
        {
            id: '550e8400-e29b-41d4-a716-446655440003',
            movieId: 'movie-003',
            movieName: 'The Dark Knight',
            userId: mockUser.id,
            seatId: 'C8',
            totalPrice: 90000,
            time: '15:00',
            date: '2024-06-20',
            paymentMethod: 'momo',
            status: 'pending',
            posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
        },
    ];

    const handleMenuSelect = (e) => {
        setSelectedMenu(e.key);
    };

    const handleLogout = async () => {
        try {
            await requestLogout();
            message.success('Đăng xuất thành công!');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } catch (error) {
            console.log(error);
            message.error('Đã xảy ra lỗi khi đăng xuất!');
        }
    };

    const handleAvatarUpload = () => {
        setIsAvatarModalVisible(false);
    };

    return (
        <div className="bg-[#161616] min-h-screen text-white bg-[url('/path/to/pattern.png')] bg-fixed bg-opacity-10 pt-20">
            <ToastContainer />
            <header>
                <Header />
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="w-full md:w-1/4">
                        <UserSidebar
                            user={mockUser}
                            selectedMenu={selectedMenu}
                            handleMenuSelect={handleMenuSelect}
                            handleLogout={handleLogout}
                        />
                    </div>

                    {/* Main content */}
                    <div className="w-full md:w-3/4">
                        {selectedMenu === 'profile' && (
                            <ProfileForm
                                user={mockUser}
                                isAvatarModalVisible={isAvatarModalVisible}
                                setIsAvatarModalVisible={setIsAvatarModalVisible}
                            />
                        )}
                        {selectedMenu === 'history' && <BookingHistory bookings={mockPayments} />}
                    </div>
                </div>
            </main>

            <Footer />

            {/* Avatar upload modal */}
            <AvatarUploadModal
                isVisible={isAvatarModalVisible}
                onClose={() => setIsAvatarModalVisible(false)}
                onUpload={handleAvatarUpload}
            />
        </div>
    );
}

export default ProfileUser;
