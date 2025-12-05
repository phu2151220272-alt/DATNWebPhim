import { useEffect, useState, useRef } from 'react';
import logo from '../assets/images/logo.png';
import { Link } from 'react-router-dom';
import { Dropdown, Space, Avatar, Empty } from 'antd';
import {
    UserOutlined,
    DownOutlined,
    MenuOutlined,
    LogoutOutlined,
    SettingOutlined,
    SearchOutlined,
    HistoryOutlined,
} from '@ant-design/icons';
import { useStore } from '../hooks/useStore';
import { requestLogout, requestSearchMovie } from '../config/request';
import useDebounce from '../hooks/useDebounce';

function Header() {
    const { dataUser } = useStore();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchMovie, setSearchMovie] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);

    const debounce = useDebounce(searchMovie, 500);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (debounce) {
            setLoading(true);
            const fetchData = async () => {
                try {
                    const res = await requestSearchMovie(debounce);
                    setSearchResults(res.metadata || []);
                    setShowResults(true);
                } catch (error) {
                    console.log(error);
                    setSearchResults([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    }, [debounce]);

    const handleLogout = async () => {
        try {
            await requestLogout();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            window.location.href = '/';
        } catch (error) {
            console.log(error);
        }
    };

    const userMenuItems = [
        {
            key: '1',
            label: (
                <Link to="/profile" className="flex items-center gap-2">
                    <UserOutlined />
                    <span>Thông tin tài khoản</span>
                </Link>
            ),
        },
        {
            key: '2',
            label: (
                <Link to="/history" className="flex items-center gap-2">
                    <HistoryOutlined />
                    <span>Lịch sử thanh toán</span>
                </Link>
            ),
        },
        {
            key: '3',
            label: (
                <Link to="/settings" className="flex items-center gap-2">
                    <SettingOutlined />
                    <span>Cài đặt</span>
                </Link>
            ),
        },
        {
            key: '4',
            label: (
                <div onClick={handleLogout} className="flex items-center gap-2 text-red-500">
                    <LogoutOutlined />
                    <span>Đăng xuất</span>
                </div>
            ),
        },
    ];

    return (
        <div className="h-[80px] fixed top-0 left-0 right-0 z-50 opacity-90 w-full bg-[#2226] backdrop-blur-sm">
            <div className="flex justify-between items-center h-full w-[90%] mx-auto relative">
                {/* Logo - stays visible on all screens */}
                <div className="h-full flex items-center">
                    <Link to="/">
                        <img src={logo} alt="logo" className="h-[60px]" />
                    </Link>
                </div>

                {/* Mobile menu button - only visible on small screens */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <MenuOutlined className="text-xl" />
                </button>

                {/* Search bar - hidden on mobile, visible on larger screens */}
                <div className="hidden md:block flex-grow px-4 max-w-[400px] relative" ref={searchRef}>
                    <div className="relative">
                        <input
                            className="bg-[#22262A] rounded-full px-4 py-2 w-[400px] h-[40px] text-white placeholder:text-white text-sm pl-10"
                            type="text"
                            placeholder="Tìm kiếm phim...."
                            value={searchMovie}
                            onChange={(e) => setSearchMovie(e.target.value)}
                            onClick={() => searchResults.length > 0 && setShowResults(true)}
                        />
                        <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white" />
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="absolute w-[400px] bg-[#22262A] mt-1 rounded-lg shadow-lg max-h-[400px] overflow-auto z-50">
                            {loading ? (
                                <div className="p-4 text-center text-white">Đang tìm kiếm...</div>
                            ) : searchResults.length > 0 ? (
                                <div className="py-2">
                                    {searchResults.map((movie) => (
                                        <Link
                                            to={`/movie/${movie.id}`}
                                            key={movie.id}
                                            onClick={() => setShowResults(false)}
                                        >
                                            <div className="flex items-center p-2 hover:bg-[#33373B] cursor-pointer transition-all duration-300">
                                                <div className="w-[60px] h-[80px] overflow-hidden rounded-md flex-shrink-0">
                                                    <img
                                                        src={movie.poster_url}
                                                        alt={movie.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="ml-3 flex-grow">
                                                    <div className="text-white font-medium">{movie.name}</div>
                                                    <div className="text-gray-400 text-xs">
                                                        {movie.release_date?.substring(0, 4)}
                                                    </div>
                                                    <div className="flex items-center mt-1">
                                                        <span className="text-yellow-400 text-xs mr-1">★</span>
                                                        <span className="text-gray-300 text-xs">
                                                            {movie.rating || 'Chưa có đánh giá'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4">
                                    <Empty
                                        description={<span className="text-white">Không tìm thấy phim</span>}
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Auth buttons or user dropdown - hidden on mobile, visible on larger screens */}
                <div className="hidden md:flex items-center gap-4">
                    {dataUser && dataUser.id ? (
                        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                            <a onClick={(e) => e.preventDefault()} className="cursor-pointer">
                                <Space className="flex items-center">
                                    <Avatar
                                        src={dataUser.avatar}
                                        icon={!dataUser.avatar && <UserOutlined />}
                                        size="default"
                                    />
                                    <span className="text-white text-sm hidden md:inline-block">
                                        {dataUser.fullName || dataUser.email}
                                    </span>
                                    <DownOutlined className="text-white text-xs" />
                                </Space>
                            </a>
                        </Dropdown>
                    ) : (
                        <>
                            <Link to="/login">
                                <button className="bg-[#22262A] rounded-full px-8 py-2 text-white text-sm hover:bg-[#33373B] transition-all duration-300">
                                    Đăng nhập
                                </button>
                            </Link>
                            <Link to="/register">
                                <button className="bg-[#22262A] rounded-full px-8 py-2 text-white text-sm hover:bg-[#33373B] transition-all duration-300">
                                    Đăng ký
                                </button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile menu - only visible when toggled */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full right-0 w-full bg-[#161616] rounded-b-lg shadow-lg py-4 px-4 z-50">
                        <div className="mb-4 relative">
                            <input
                                className="bg-[#22262A] rounded-full px-4 py-2 w-full h-[40px] text-white placeholder:text-white text-sm pl-10"
                                type="text"
                                placeholder="Tìm kiếm phim...."
                                value={searchMovie}
                                onChange={(e) => setSearchMovie(e.target.value)}
                            />
                            <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white" />
                        </div>

                        {/* Mobile Search Results */}
                        {showResults && searchMovie && (
                            <div className="bg-[#22262A] mb-4 rounded-lg shadow-lg max-h-[300px] overflow-auto z-50">
                                {loading ? (
                                    <div className="p-4 text-center text-white">Đang tìm kiếm...</div>
                                ) : searchResults.length > 0 ? (
                                    <div className="py-2">
                                        {searchResults.map((movie) => (
                                            <Link
                                                to={`/movie/${movie.id}`}
                                                key={movie.id}
                                                onClick={() => {
                                                    setShowResults(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                <div className="flex items-center p-2 hover:bg-[#33373B] cursor-pointer transition-all duration-300">
                                                    <div className="w-[50px] h-[70px] overflow-hidden rounded-md flex-shrink-0">
                                                        <img
                                                            src={movie.poster_url}
                                                            alt={movie.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="ml-3 flex-grow">
                                                        <div className="text-white font-medium">{movie.name}</div>
                                                        <div className="text-gray-400 text-xs">
                                                            {movie.release_date?.substring(0, 4)}
                                                        </div>
                                                        <div className="flex items-center mt-1">
                                                            <span className="text-yellow-400 text-xs mr-1">★</span>
                                                            <span className="text-gray-300 text-xs">
                                                                {movie.rating || 'Chưa có đánh giá'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <Empty
                                            description={<span className="text-white">Không tìm thấy phim</span>}
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {dataUser && dataUser._id ? (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 py-2 border-b border-gray-700">
                                    <Avatar
                                        src={dataUser.avatar}
                                        icon={!dataUser.avatar && <UserOutlined />}
                                        size="default"
                                    />
                                    <span className="text-white text-sm">{dataUser.fullName || dataUser.email}</span>
                                </div>

                                <Link to="/profile" className="flex items-center gap-2 text-white py-2">
                                    <UserOutlined />
                                    <span>Thông tin tài khoản</span>
                                </Link>
                                <Link to="/history" className="flex items-center gap-2 text-white py-2">
                                    <HistoryOutlined />
                                    <span>Lịch sử thanh toán</span>
                                </Link>
                                <Link to="/settings" className="flex items-center gap-2 text-white py-2">
                                    <SettingOutlined />
                                    <span>Cài đặt</span>
                                </Link>

                                <div
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-red-500 py-2 cursor-pointer"
                                >
                                    <LogoutOutlined />
                                    <span>Đăng xuất</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link to="/login" className="w-full">
                                    <button className="bg-[#22262A] rounded-full px-8 py-2 text-white text-sm hover:bg-[#33373B] transition-all duration-300 w-full">
                                        Đăng nhập
                                    </button>
                                </Link>
                                <Link to="/register" className="w-full">
                                    <button className="bg-[#22262A] rounded-full px-8 py-2 text-white text-sm hover:bg-[#33373B] transition-all duration-300 w-full">
                                        Đăng ký
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
