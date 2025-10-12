import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import '../App.css';
import { requestFindMovieNew } from '../config/request';

var settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    fade: true,
    cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
    beforeChange: () => {
        document.querySelectorAll('.slide-content').forEach((el) => {
            el.classList.remove('animate-slide-up');
            el.classList.add('opacity-0', 'translate-y-full');
        });
    },
    afterChange: (current) => {
        const activeSlide = document.querySelector(`[data-index="${current}"] .slide-content`);
        if (activeSlide) {
            activeSlide.classList.remove('opacity-0', 'translate-y-full');
            activeSlide.classList.add('animate-slide-up');
        }
    },
};

function Banner() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestFindMovieNew();
            setData(res.metadata);
        };
        fetchData();
    }, []);

    return (
        <div className="w-full h-[100vh] relative overflow-hidden">
            <Slider {...settings}>
                {data.map((item, index) => (
                    <div key={item.id} data-index={index}>
                        <div className="w-full h-[100vh] relative">
                            <img
                                className="w-full h-full object-cover"
                                src={item.thumb_url}
                                alt={item.name || item.title}
                            />

                            {/* Text overlay with animation */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent pt-20 pb-10 px-6">
                                <div
                                    className={`slide-content flex flex-col items-start space-y-3 ${
                                        index === 0 ? 'animate-slide-up' : 'opacity-0 translate-y-full'
                                    }`}
                                >
                                    <h2 className="text-4xl font-bold text-white">{item.name}</h2>
                                    <h3 className="text-xl text-gray-300">{item.origin_name}</h3>
                                    <div className="flex items-center space-x-4">
                                        <span className="bg-red-600 text-white px-2 py-1 rounded">{item.year}</span>
                                        <span className="bg-red-600 text-white px-2 py-1 rounded">
                                            {item.time} Phút
                                        </span>
                                        <span className="bg-red-600 text-white px-2 py-1 rounded">
                                            {Number(item.price).toLocaleString()} VNĐ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}

export default Banner;
