import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../Components/Footer';
import Header from '../Components/Header';
import { Form, Input, Button, Steps, Alert } from 'antd';
import { LockOutlined, MailOutlined, KeyOutlined } from '@ant-design/icons';
import { toast, ToastContainer } from 'react-toastify';
import { requestForgotPassword, requestResetPassword } from '../config/request';
import Cookies from 'js-cookie';

function ForgotPassword() {
    const [step, setStep] = useState(0); // 0: Email, 1: OTP and new password
    const [email, setEmail] = useState('');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const tokenResetPassword = Cookies.get('tokenResetPassword');
        if (tokenResetPassword) {
            setStep(1);
        }
    }, [step]);

    const handleEmailSubmit = async (values) => {
        setLoading(true);

        // Mock API call
        try {
            await requestForgotPassword(values);
            setEmail(values.email);
            setStep(1);
            setLoading(false);
            toast.success('Mã OTP đã được gửi đến email của bạn!');
        } catch (error) {
            setLoading(false);
            toast.error(error.response.data.message);
        }
    };

    const handleResetSubmit = async (values) => {
        setLoading(true);
        // Mock API call
        try {
            await requestResetPassword(values);
            setLoading(false);
            toast.success('Đặt lại mật khẩu thành công!');
        } catch (error) {
            setLoading(false);
            toast.error(error.response.data.message);
        }
    };

    const handleBack = () => {
        setStep(0);
        form.resetFields();
    };

    return (
        <div className="bg-[#161616] min-h-screen">
            <ToastContainer />
            <Header />

            <div className="max-w-md mx-auto pt-30 pb-10">
                <h1 className="text-3xl font-bold text-center text-white mb-2">Quên Mật Khẩu</h1>
                <p className="text-center text-gray-400 mb-8">
                    {step === 0 ? 'Vui lòng nhập email để lấy lại mật khẩu' : 'Nhập mã OTP và mật khẩu mới'}
                </p>

                <div className="bg-[#1E1E1E] rounded-lg p-8 shadow-lg animate-slide-up">
                    <Steps
                        current={step}
                        items={[
                            {
                                title: <span className="text-gray-300">Email</span>,
                                description: <span className="text-gray-400">Xác thực</span>,
                            },
                            {
                                title: <span className="text-gray-300">Đặt lại</span>,
                                description: <span className="text-gray-400">Mật khẩu mới</span>,
                            },
                        ]}
                        className="mb-8"
                        progressDot
                    />

                    {step === 0 ? (
                        <Form form={form} layout="vertical" onFinish={handleEmailSubmit} className="mt-8">
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

                            <Form.Item className="mt-8">
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
                                    Gửi Mã OTP
                                </Button>
                            </Form.Item>

                            <div className="mt-6 text-center">
                                <Link to="/login" className="text-red-500 hover:text-red-400">
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        </Form>
                    ) : (
                        <Form form={form} layout="vertical" onFinish={handleResetSubmit} className="mt-8">
                            <Alert
                                message={`Mã OTP đã được gửi đến ${email}`}
                                type="info"
                                showIcon
                                className="mb-6"
                                style={{ background: '#292929', borderColor: '#333', color: '#fff' }}
                            />

                            <Form.Item
                                name="otp"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mã OTP!' },
                                    { min: 4, message: 'Mã OTP phải có ít nhất 4 ký tự' },
                                ]}
                            >
                                <Input
                                    prefix={<KeyOutlined className="text-gray-400 mr-2" />}
                                    placeholder="Nhập mã OTP"
                                    maxLength={6}
                                    className="h-12 bg-[#292929] border-[#333] text-white rounded"
                                />
                            </Form.Item>

                            <Form.Item
                                name="newPassword"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="text-gray-400 mr-2" />}
                                    placeholder="Mật khẩu mới"
                                    className="h-12 bg-[#292929] border-[#333] text-white rounded"
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmNewPassword"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="text-gray-400 mr-2" />}
                                    placeholder="Xác nhận mật khẩu mới"
                                    className="h-12 bg-[#292929] border-[#333] text-white rounded"
                                />
                            </Form.Item>

                            <Form.Item className="mt-8">
                                <div className="flex gap-4">
                                    <Button
                                        type="default"
                                        onClick={handleBack}
                                        className="flex-1 h-12 border-gray-600 text-gray-300"
                                    >
                                        Quay lại
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        className="flex-1 h-12 font-medium"
                                        style={{
                                            background: '#E53E3E',
                                            borderColor: '#E53E3E',
                                        }}
                                    >
                                        Đặt Lại Mật Khẩu
                                    </Button>
                                </div>
                            </Form.Item>
                        </Form>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default ForgotPassword;
