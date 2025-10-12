import { Avatar, Menu } from 'antd';
import { UserOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import { useStore } from '../../../hooks/useStore';

function UserSidebar({ selectedMenu, handleMenuSelect, handleLogout }) {
    const { dataUser } = useStore();

    return (
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#161616] rounded-xl overflow-hidden shadow-lg">
            <div className="p-6 flex flex-col items-center border-b border-gray-800">
                <Avatar
                    size={80}
                    src={dataUser.avatar}
                    icon={!dataUser.avatar && <UserOutlined />}
                    className="mb-3 border-2 border-red-600"
                />
                <h3 className="text-lg font-semibold text-white">{dataUser.fullName}</h3>
                <p className="text-gray-400 text-sm">{dataUser.email}</p>
            </div>

            <Menu
                mode="inline"
                selectedKeys={[selectedMenu]}
                onClick={handleMenuSelect}
                className="bg-transparent border-0"
                items={[
                    {
                        key: 'profile',
                        icon: <UserOutlined />,
                        label: 'Thông tin cá nhân',
                        className: 'hover:text-red-500 text-white',
                    },
                    {
                        key: 'history',
                        icon: <HistoryOutlined />,
                        label: 'Lịch sử đặt vé',
                        className: 'hover:text-red-500 text-white',
                    },
                    {
                        key: 'logout',
                        icon: <LogoutOutlined />,
                        label: 'Đăng xuất',
                        className: 'text-red-500 hover:text-red-400',
                        onClick: handleLogout,
                    },
                ]}
            />
        </div>
    );
}

export default UserSidebar;
