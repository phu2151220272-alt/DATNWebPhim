import '../App.css';

function Footer() {
    return (
        <footer className="bg-[#1a1a1a] text-white py-12 px-4">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo và thông tin */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold">STREAMPHIM</h2>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Trang web xem phim trực tuyến hàng đầu với nhiều bộ phim và chương trình truyền hình đa
                            dạng.
                        </p>
                        <div className="flex space-x-4 mt-4">
                            <a href="#" className="text-white hover:text-red-500 transition-colors">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                                </svg>
                            </a>
                            <a href="#" className="text-white hover:text-red-500 transition-colors">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a href="#" className="text-white hover:text-red-500 transition-colors">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Khám phá */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 relative inline-block">
                            Khám phá
                            <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-red-600"></span>
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="text-red-500 mr-2">•</span>
                                    Trang chủ
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="text-red-500 mr-2">•</span>
                                    Phim truyền hình
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="text-red-500 mr-2">•</span>
                                    Diễn viên
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="text-red-500 mr-2">•</span>
                                    Người nổi tiếng
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="text-red-500 mr-2">•</span>
                                    Phim lẻ
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="text-red-500 mr-2">•</span>
                                    Video
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Công ty */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 relative inline-block">
                            Công ty
                            <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-red-600"></span>
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="text-red-500 mr-2">•</span>
                                    Giới thiệu
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="text-red-500 mr-2">•</span>
                                    Điều khoản sử dụng
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="text-red-500 mr-2">•</span>
                                    Liên hệ
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="text-red-500 mr-2">•</span>
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="text-red-500 mr-2">•</span>
                                    Chính sách riêng tư
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="text-red-500 mr-2">•</span>
                                    Trung tâm hỗ trợ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Tải ứng dụng */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 relative inline-block">
                            Tải ứng dụng
                            <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-red-600"></span>
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Tải ứng dụng StreamPhim để xem không giới hạn phim và chương trình truyền hình trên thiết bị
                            di động.
                        </p>
                        <div className="flex flex-col space-y-3">
                            <a href="#" className="block">
                                <img
                                    src="https://play.google.com/intl/en_us/badges/images/generic/vi_badge_web_generic.png"
                                    alt="Google Play"
                                    className="h-10"
                                />
                            </a>
                            <a href="#" className="block">
                                <img
                                    src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg"
                                    alt="App Store"
                                    className="h-10"
                                />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Phần bản quyền */}
                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
                    <p>© 2024 StreamPhim. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>

            {/* Nút cuộn lên đầu trang */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-8 right-8 bg-red-600 text-white p-3 rounded-md shadow-lg hover:bg-red-700 transition-colors"
                aria-label="Cuộn lên đầu trang"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                        fillRule="evenodd"
                        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </footer>
    );
}

export default Footer;
