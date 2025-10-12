function Cardbody({ item }) {
    return (
        <div className="group relative overflow-hidden rounded-lg transition-transform duration-300 ">
            {/* Image container with overlay */}
            <div className="aspect-[2/3] overflow-hidden relative">
                <img
                    src={item.poster_url}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Quality badge */}
                <div className="absolute top-2 right-2">
                    <span className="bg-red-600 text-white text-xs font-medium py-0.5 px-1.5 rounded">
                        {item.quality || 'HD'}
                    </span>
                </div>

                {/* Hover info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex justify-between items-center">
                        <span className="text-white text-xs font-medium">{item.time || '90'} phút</span>
                        <span className="bg-yellow-500/90 text-black text-xs font-bold py-0.5 px-1.5 rounded">
                            {parseInt(item.price || 0).toLocaleString('vi-VN')} đ
                        </span>
                    </div>

                    <div className="bg-red-600/80 mt-2 py-1 px-2 rounded text-center">
                        <span className="text-white text-xs font-medium">Đặt vé</span>
                    </div>
                </div>
            </div>

            {/* Info section */}
            <div className="mt-2 p-2">
                <h3 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-red-500 transition-colors duration-300">
                    {item.name}
                </h3>

                {/* Year and country */}
                <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded">
                        {item.year || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-400 truncate max-w-[70%]">
                        {item.country || 'Đang cập nhật'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Cardbody;
