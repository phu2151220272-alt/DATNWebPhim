import { useState, useEffect } from 'react';
import { Avatar, Button, Form, Input, message } from 'antd';
import {
    UserOutlined,
    EditOutlined,
    SaveOutlined,
    UploadOutlined,
    CalendarOutlined,
    TeamOutlined,
    MailOutlined,
    PhoneOutlined,
    LockOutlined,
} from '@ant-design/icons';
import { useStore } from '../../../hooks/useStore';
import { requestUpdateUser } from '../../../config/request';
import PasswordChangeModal from './PasswordChangeModal';

function ProfileForm({ setIsAvatarModalVisible }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [form] = Form.useForm();

    const { dataUser, fetchAuth } = useStore();

    // Initialize form with user data
    useEffect(() => {
        form.setFieldsValue({
            fullName: dataUser.fullName,
            email: dataUser.email,
            phone: dataUser.phone,
        });
    }, [dataUser]);

    const handleEditProfile = () => {
        setIsEditing(true);
    };

    const handleSaveProfile = async () => {
        try {
            const data = form.getFieldsValue();
            const res = await requestUpdateUser(data);
            message.success(res.message);
            setIsEditing(false);
            fetchAuth();
        } catch (error) {
            message.error(error.message);
        }
    };

    const showAvatarModal = () => {
        setIsAvatarModalVisible(true);
    };

    const showPasswordModal = () => {
        setIsPasswordModalVisible(true);
    };

    return (
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#161616] rounded-xl p-6 shadow-lg">
            <div className="relative flex flex-col items-center mb-8">
                <div className="group relative">
                    <Avatar
                        size={120}
                        src={dataUser.avatar}
                        icon={!dataUser.avatar && <UserOutlined />}
                        className="mb-4 border-4 border-red-600 shadow-xl"
                    />
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={showAvatarModal}
                    >
                        <UploadOutlined className="text-2xl text-white" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{dataUser.fullName}</h2>
                <p className="text-gray-400 flex items-center gap-1">
                    <MailOutlined className="text-xs" /> {dataUser.email}
                </p>
            </div>

            <div className="mb-8 bg-[#222] rounded-xl overflow-hidden">
                {isEditing ? (
                    <Form form={form} layout="vertical" className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Form.Item
                                name="fullName"
                                label={<span className="text-white font-medium">Họ và tên</span>}
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                            >
                                <Input
                                    prefix={<UserOutlined className="text-gray-400" />}
                                    placeholder="Nhập họ và tên"
                                    className="rounded-lg h-11"
                                />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label={<span className="text-white font-medium">Số điện thoại</span>}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập số điện thoại!',
                                    },
                                ]}
                            >
                                <Input
                                    prefix={<PhoneOutlined className="text-gray-400" />}
                                    placeholder="Nhập số điện thoại"
                                    className="rounded-lg h-11"
                                />
                            </Form.Item>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <Button onClick={() => setIsEditing(false)} className="rounded-lg h-10 px-5">
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleSaveProfile}
                                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border-none rounded-lg h-10 px-5"
                                icon={<SaveOutlined />}
                            >
                                Lưu thông tin
                            </Button>
                        </div>
                    </Form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                                <UserOutlined className="text-red-500" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs">Họ và tên</p>
                                <p className="text-white font-medium">{dataUser.fullName}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                                <MailOutlined className="text-red-500" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs">Email</p>
                                <p className="text-white font-medium">{dataUser.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                                <PhoneOutlined className="text-red-500" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs">Số điện thoại</p>
                                <p className="text-white font-medium">{dataUser.phone || 'Chưa cập nhật'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                                <TeamOutlined className="text-red-500" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs">Phương thức đăng nhập</p>
                                <p className="text-white font-medium">
                                    {dataUser.typeLogin === 'google' ? 'Google' : 'Email/Mật khẩu'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                                <CalendarOutlined className="text-red-500" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs">Ngày tham gia</p>
                                <p className="text-white font-medium">
                                    {new Date(dataUser.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </div>

                        {dataUser.typeLogin !== 'google' && (
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                                    <LockOutlined className="text-red-500" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Mật khẩu</p>
                                    <Button
                                        type="primary"
                                        className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border-none rounded-lg h-10 px-5"
                                        onClick={showPasswordModal}
                                    >
                                        Thay đổi mật khẩu
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!isEditing && (
                    <div className="px-6 pb-6 flex justify-end">
                        <Button
                            type="primary"
                            onClick={handleEditProfile}
                            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border-none rounded-lg h-10 px-5"
                            icon={<EditOutlined />}
                        >
                            Chỉnh sửa thông tin
                        </Button>
                    </div>
                )}
            </div>

            {/* Password Change Modal */}
            <PasswordChangeModal isVisible={isPasswordModalVisible} onClose={() => setIsPasswordModalVisible(false)} />
        </div>
    );
}

export default ProfileForm;
