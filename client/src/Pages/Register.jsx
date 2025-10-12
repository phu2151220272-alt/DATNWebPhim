import { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../Components/Footer';
import Header from '../Components/Header';
import { Form, Input, Button, Divider } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { toast, ToastContainer } from 'react-toastify';

import { requestRegister } from '../config/request';

function Register() {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await requestRegister(values);
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

    return (
        <div className="bg-[#161616] min-h-screen">
            <ToastContainer />
            <Header />

            <div className="max-w-md mx-auto py-16 px-4 pt-25">
                <h1 className="text-3xl font-bold text-center text-white mb-2">Đăng Ký</h1>
                <p className="text-center text-gray-400 mb-8">Tạo tài khoản để trải nghiệm đầy đủ</p>

                <div className="bg-[#1E1E1E] rounded-lg p-8 shadow-lg">
                    <Form
                        name="register"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="fullName"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên đầy đủ!' }]}
                        >
                            <Input
                                prefix={<UserOutlined className="text-gray-400 mr-2" />}
                                placeholder="Họ và tên"
                                className="h-12 bg-[#292929] border-[#333] text-white rounded"
                            />
                        </Form.Item>

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

                        <Form.Item
                            name="phone"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải gồm 10 chữ số!' },
                            ]}
                        >
                            <Input
                                prefix={<PhoneOutlined className="text-gray-400 mr-2" />}
                                placeholder="Số điện thoại"
                                className="h-12 bg-[#292929] border-[#333] text-white rounded"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400 mr-2" />}
                                placeholder="Mật khẩu"
                                className="h-12 bg-[#292929] border-[#333] text-white rounded"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400 mr-2" />}
                                placeholder="Xác nhận mật khẩu"
                                className="h-12 bg-[#292929] border-[#333] text-white rounded"
                            />
                        </Form.Item>

                        <Form.Item className="mt-6">
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
                                Đăng Ký
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="relative my-6">
                        <Divider plain className="border-t border-gray-700">
                            <span className="text-gray-400 px-4">Hoặc</span>
                        </Divider>
                    </div>

                    <div className="space-y-4">
                        <button className="w-full flex items-center justify-center gap-2 bg-[#292929] hover:bg-[#333] text-white py-3 px-4 rounded transition duration-200">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    fill="#fff"
                                    d="M12 5c1.617 0 3.082.604 4.206 1.598L18.5 4.304C16.638 2.838 14.43 2 12 2 8.352 2 5.158 3.892 3.305 6.754l2.541 1.975C6.816 6.462 9.235 5 12 5zM2.045 11c-.227.612-.35 1.174-.412 1.7-.097.826 0 1.659.087 2.326.234 1.487 1.029 2.916 2.164 3.974H3.88c-3.26-3.498-3.994-8.887-1.836-13.225L2.045 11zm17.711 10c1.365-1.051 2.409-2.368 3.027-3.878.678-1.677.98-3.89.258-5.789-.689-1.843-1.711-3.076-3.341-4.333h-.02L17 9c1.073.616 1.748 1.254 2.263 2.093.258.483.412.984.524 1.519.111.529.11 1.136 0 1.684-.441 2.455-2.326 3.754-4.579 3.754-2.474 0-4.494-1.523-5.305-3.746-.1-.265-.184-.53-.247-.811a5.03 5.03 0 01-.101-1.984c.08-.565.223-1.07.443-1.56.24-.526.562-1.013.964-1.443C11.558 7.68 12.75 7.3 13.95 7.3c1.321 0 2.5.452 3.22 1.118.826.8 1.198 1.86 1.198 2.883 0 1.764-1.117 2.884-2.56 2.884-.823 0-1.587-.372-1.747-1.204h-.023c0-.7.543-.522.543-2.044 0-.575-.137-.878-.387-1.15-.233-.247-.575-.388-.977-.388-.908 0-1.598.741-1.598 2.044 0 .329.05.634.137.902.23.74.784 1.26 1.434 1.342 1.235.153 2.462-.47 3.08-1.446H17v-1.5c0-1.25-.825-2.3-2-2.3-.902 0-1.694.484-2.09 1.189h-1.82c.546-2.116 2.926-3.32 4.91-3.32 2.756 0 5 2.012 5 4.753 0 1.135-.35 2.219-.974 3.131-.669.978-1.704 1.752-2.927 2.099-1.048.271-2.17.28-3.204-.03-.89-.265-1.68-.84-2.205-1.531a4 4 0 01-.724-1.405H12c0-.368.226-.646.452-.864.255-.245.608-.403.968-.403 1.122 0 2.053.84 2.043 1.885-.022 2.126-1.42 3.17-2.46 3.374-1.1.207-1.765-.063-2.333-.332-1.727-.933-2.3-2.5-2.539-3.044-.094-.214-.17-.433-.226-.66A4.91 4.91 0 017.75 12c0-.638.11-1.304.329-1.95.1-.299.221-.586.362-.86.35-.683.825-1.292 1.398-1.795a5.97 5.97 0 012.09-1.176A6.63 6.63 0 0113.39 6c.678 0 1.338.096 1.96.282.621.187 1.206.462 1.733.815"
                                />
                            </svg>
                            Đăng ký với Google
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <span className="text-gray-400">Đã có tài khoản? </span>
                        <Link to="/login" className="text-red-500 hover:text-red-400">
                            Đăng nhập ngay
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Register;
