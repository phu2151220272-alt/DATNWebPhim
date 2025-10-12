import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import Cardbody from './Cardbody';
import { requestGetAllCategory } from '../config/request';

function HomePage() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const resCategories = await requestGetAllCategory();
            setCategories(resCategories.metadata);
        };
        fetchData();
    }, []);

    return (
        <div className="w-[90%] mx-auto">
            {categories.map((item) => (
                <div>
                    <div className="flex justify-between items-center text-white mb-10 border-b border-white pb-5">
                        <h1 className="text-2xl font-bold">{item.nameCategory}</h1>
                        <Link to={`/category/${item.id}`}>
                            <button className="bg-[#e50916] rounded-full px-8 py-2 text-white text-sm hover:bg-[#33373B] transition-all duration-300">
                                Xem tất cả
                            </button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-6 gap-4">
                        {item.movies.map((movie) => (
                            <Link key={movie.id} to={`/movie/${movie.id}`}>
                                <Cardbody item={movie} />
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default HomePage;
