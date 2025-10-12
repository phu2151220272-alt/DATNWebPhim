// import { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { requestGetBlogById } from '../config/request';
// import Header from '../Components/Header';
// import Footer from '../Components/Footer';

// function DetailBlog() {
//     const [blog, setBlog] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const { id } = useParams();

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 const res = await requestGetBlogById(id);
//                 setBlog(res.metadata);
//             } catch (error) {
//                 console.error('Error fetching blog data:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [id]);

//     if (loading) {
//         return (
//             <div className="bg-[#161616] min-h-screen text-white flex items-center justify-center">
//                 <Spin size="large" />
//             </div>
//         );
//     }

//     if (!blog) {
//         return (
//             <div className="bg-[#161616] min-h-screen text-white flex items-center justify-center">
//                 <div className="text-center">
//                     <p className="text-xl mb-4">Không tìm thấy bài viết</p>
//                     <Link to="/" className="text-red-500 hover:text-red-600">
//                         Quay về trang chủ
//                     </Link>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-[#161616] min-h-screen text-white">
//             <header>
//                 <Header />
//             </header>

//             <main>
//                 {/* Hero Section with Backdrop */}
//                 <div className="relative">
//                     {/* Backdrop with gradient overlay */}
//                     <div className="w-full h-[90vh] relative">
//                         <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
//                         <img
//                             src={blog.thumb_url}
//                             alt={blog.title}
//                             className="w-full h-full object-cover object-center"
//                         />
//                     </div>

//                     {/* Blog details overlay */}
//                     <div className="absolute inset-0 z-20 flex items-center">
//                         <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-8 items-start">
//                             {/* Thumbnail */}
//                             <div className="relative w-[280px] h-[400px] flex-shrink-0">
//                                 <img
//                                     src={blog.poster_url}
//                                     alt={blog.title}
//                                     className="w-full h-full object-cover rounded-md shadow-xl"
//                                 />
//                             </div>

//                             {/* Blog information */}
//                             <div className="flex-1 p-4">
//                                 <h1 className="text-4xl md:text-5xl font-bold text-red-600 mb-2">{blog.title}</h1>

//                                 {/* Blog details */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-8">
//                                     <div className="flex gap-2 text-sm">
//                                         <span className="text-gray-400 w-24">Tác giả:</span>
//                                         <span>{blog.author || 'Admin'}</span>
//                                     </div>
//                                     <div className="flex gap-2 text-sm">
//                                         <span className="text-gray-400 w-24">Ngày đăng:</span>
//                                         <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
//                                     </div>
//                                     <div className="flex gap-2 text-sm">
//                                         <span className="text-gray-400 w-24">Chuyên mục:</span>
//                                         <span>{blog.category || 'Tin tức'}</span>
//                                     </div>
//                                     {blog.tags && (
//                                         <div className="flex gap-2 text-sm">
//                                             <span className="text-gray-400 w-24">Tags:</span>
//                                             <span>{blog.tags.join(', ')}</span>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Blog content */}
//                 <div className="container mx-auto px-4 py-12">
//                     <h2 className="text-2xl font-bold mb-6 text-red-600 border-l-4 border-red-600 pl-4">
//                         NỘI DUNG BÀI VIẾT
//                     </h2>
//                     <div className="bg-[#212121] p-6 rounded-lg">
//                         <div 
//                             dangerouslySetInnerHTML={{ __html: blog.content }}
//                             className="prose prose-lg prose-invert max-w-none text-gray-300 leading-relaxed"
//                         />
//                     </div>
//                 </div>
//             </main>

//             <Footer />
//         </div>
//     );
// }

// export default DetailBlog;
