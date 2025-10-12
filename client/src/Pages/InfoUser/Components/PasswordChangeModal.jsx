import { useState } from 'react';
import { Modal, Button, Form, Input, message } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { requestUpdatePassword } from '../../../config/request';

import { toast, ToastContainer } from 'react-toastify';

function PasswordChangeModal({ isVisible, onClose }) {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const data = form.getFieldsValue();
            const res = await requestUpdatePassword(data);
            toast.success(res.message);
            onClose();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    // Validate matching passwords
    const validateConfirmPassword = (_, value) => {
        const password = form.getFieldValue('newPassword');
        if (value && value !== password) {
            return Promise.reject('Mật khẩu xác nhận không khớp!');
        }
        return Promise.resolve();
    };

    // Validate password strength
    const validatePasswordStrength = (_, value) => {
        if (!value) {
            return Promise.reject('Vui lòng nhập mật khẩu mới');
        }
        if (value.length < 8) {
            return Promise.reject('Mật khẩu phải có ít nhất 8 ký tự');
        }
        // Add more password strength validation rules as needed
        if (!/[A-Z]/.test(value)) {
            return Promise.reject('Mật khẩu phải chứa ít nhất 1 chữ hoa');
        }
        if (!/[0-9]/.test(value)) {
            return Promise.reject('Mật khẩu phải chứa ít nhất 1 chữ số');
        }
        return Promise.resolve();
    };

    return (
        <Modal
            title={<span>Đổi mật khẩu</span>}
            open={isVisible}
            onCancel={handleCancel}
            footer={null}
            centered
            className="password-modal"
            maskClosable={false}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" className="mt-2">
                <Form.Item
                    name="currentPassword"
                    label={<span>Mật khẩu hiện tại</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="rounded-lg h-11"
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label={<span>Mật khẩu mới</span>}
                    rules={[{ validator: validatePasswordStrength }]}
                    hasFeedback
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        placeholder="Nhập mật khẩu mới"
                        className="rounded-lg h-11"
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label={<span>Xác nhận mật khẩu</span>}
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                        { validator: validateConfirmPassword },
                    ]}
                    hasFeedback
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        placeholder="Nhập lại mật khẩu mới"
                        className="rounded-lg h-11"
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                </Form.Item>

                <div className="flex justify-end gap-3 mt-6">
                    <Button onClick={handleCancel} className="rounded-lg h-10 px-5">
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border-none rounded-lg h-10 px-5"
                    >
                        Đổi mật khẩu
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

export default PasswordChangeModal;
