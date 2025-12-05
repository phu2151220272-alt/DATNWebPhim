import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { Form, Input, Button, Divider } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { toast, ToastContainer } from 'react-toastify';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import { requestLogin, requestLoginGoogle } from '../config/request';

function Login() {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await requestLogin(values);
            toast.success(res.data.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            window.location.href = '/';
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = async (response) => {
        const { credential } = response; // Nhận ID Token từ Google
        try {
            const res = await requestLoginGoogle({ credential });
            
            // Hiển thị thông báo thành công màu xanh
            toast.success('Đăng nhập bằng Google thành công!', {
                style: { background: '#4CAF50', color: 'white' },
                progressStyle: { background: '#45a049' },
                autoClose: 1000 // Đóng toast sau 1 giây
            });

            // Đợi toast hiển thị xong rồi mới chuyển trang
            setTimeout(() => {
                window.location.href = '/';
            }, 1500); // Đợi 1.5 giây để toast hiển thị hoàn tất
            
        } catch (error) {
            // Xử lý lỗi và hiển thị thông báo lỗi màu đỏ
            const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại, vui lòng thử lại!';
            toast.error(errorMessage, {
                style: { background: '#f44336', color: 'white' },
                progressStyle: { background: '#d32f2f' }
            });
        }
    };

    return (
        <div className="bg-[#161616] min-h-screen">
            <ToastContainer />
            <Header />

            <div className="max-w-md mx-auto py-16 px-4 pt-25">
                <h1 className="text-3xl font-bold text-center text-white mb-2">Đăng Nhập</h1>
                <p className="text-center text-gray-400 mb-8">Vui lòng đăng nhập để tiếp tục</p>

                <div className="bg-[#1E1E1E] rounded-lg p-8 shadow-lg">
                    <Form
                        name="login"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined className="text-gray-400 mr-2" />}
                                placeholder="Email"
                                className="h-12 bg-[#292929] border-[#333] text-white rounded"
                            />
                        </Form.Item>

                        <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400 mr-2" />}
                                placeholder="Mật khẩu"
                                className="h-12 bg-[#292929] border-[#333] text-white rounded"
                            />
                        </Form.Item>

                        <Link to="/forgot-password" className="text-red-500 hover:text-red-400 flex justify-end pb-6">
                            Quên mật khẩu?
                        </Link>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full h-12 font-medium rounded"
                                loading={loading}
                                style={{
                                    background: '#E53E3E',
                                    borderColor: '#E53E3E',
                                }}
                            >
                                Đăng Nhập
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="relative my-6">
                        <Divider plain className="border-t border-gray-700">
                            <span className="text-gray-400 px-4">Hoặc</span>
                        </Divider>
                    </div>

                    <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
                        <GoogleLogin onSuccess={handleSuccess} onError={() => console.log('Login Failed')} />
                    </GoogleOAuthProvider>

                    <div className="mt-6 text-center">
                        <span className="text-gray-400">Chưa có tài khoản? </span>
                        <Link to="/register" className="text-red-500 hover:text-red-400">
                            Đăng ký ngay
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Login;
