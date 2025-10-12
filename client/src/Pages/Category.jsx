import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { useParams, Link } from 'react-router-dom';
import { requestGetMovieByCategory } from '../config/request';
import { useEffect, useState } from 'react';
import { Spin, Empty } from 'antd';

function Category() {
    const { id } = useParams();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                const res = await requestGetMovieByCategory(id);
                setMovies(res.metadata.movies);
                setCategoryName(res.metadata.nameCategory);
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, [id]);

    return (
        <div className="bg-[#161616] min-h-screen text-white pt-20">
            <header>
                <Header />
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Category title and info */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">{categoryName}</h1>
                    <p className="text-gray-400">Tìm thấy {movies.length} phim thuộc thể loại này</p>
                </div>

                {/* Movies grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spin size="large" tip="Đang tải..." />
                    </div>
                ) : movies.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-64">
                        <Empty
                            description={<span className="text-white">Không tìm thấy phim nào</span>}
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {movies.map((movie) => (
                            <Link to={`/movie/${movie.id}`} key={movie.id} className="block">
                                <div className="bg-[#1A1A1A] rounded-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-900/20">
                                    <div className="relative aspect-[2/3] overflow-hidden">
                                        <img
                                            src={`${movie.poster_url}`}
                                            alt={movie.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs py-1 px-2 rounded">
                                            {movie.quality}
                                        </div>
                                    </div>

                                    <div className="p-3">
                                        <h3 className="text-white font-semibold text-sm truncate">{movie.name}</h3>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-gray-400 text-xs">{movie.year}</span>
                                            <span className="text-red-500 text-xs font-semibold">
                                                {parseInt(movie.price).toLocaleString('vi-VN')} VNĐ
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Category;
