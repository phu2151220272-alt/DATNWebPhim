import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Tag, Spin, DatePicker } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, EyeOutlined } from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import styles from './DashBoard.module.scss';
import classNames from 'classnames/bind';
import { requestDashboard, requestGetOrderStats, requestGetPieChartData } from '../../../../config/request';
import axios from 'axios';

const { Title } = Typography;
const cx = classNames.bind(styles);

function DashBoard() {
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalRevenue: 0,
        totalWatching: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [orderStats, setOrderStats] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);
    const [orderStatusStats, setOrderStatusStats] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const params = {};
                if (startDate) params.startDate = startDate.format('YYYY-MM-DD');
                if (endDate) params.endDate = endDate.format('YYYY-MM-DD');

                const response = await requestDashboard(params);
                const {
                    statistics: statsData,
                    recentOrders: ordersData,
                    topProducts: productsData,
                } = response.metadata;

                setStatistics(statsData);
                setRecentOrders(
                    ordersData.map((order) => ({
                        key: order.idPayment,
                        ...order,
                    })),
                );
                setTopProducts(
                    productsData.map((product) => ({
                        key: product.id,
                        ...product,
                    })),
                );
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchOrderStats = async () => {
            try {
                const params = {};
                if (startDate) params.startDate = startDate.format('YYYY-MM-DD');
                if (endDate) params.endDate = endDate.format('YYYY-MM-DD');

                const response = await requestGetOrderStats(params);
                setOrderStats(response.metadata);
            } catch (error) {
                console.error('Error fetching order statistics:', error);
            }
        };

        const fetchPieChartData = async () => {
            try {
                const response = await requestGetPieChartData();
                const { categoryStats, orderStats } = response.metadata;
                setCategoryStats(categoryStats);
                setOrderStatusStats(orderStats);
            } catch (error) {
                console.error('Error fetching pie chart data:', error);
            }
        };

        fetchDashboardData();
        fetchOrderStats();
        fetchPieChartData();
    }, [startDate, endDate]);

    const orderColumns = [
        {
            title: 'ID',
            dataIndex: 'idPayment',
            key: 'idPayment',
            width: 100,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price) => `${price.toLocaleString('vi-VN')}đ`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const getStatusConfig = (status) => {
                    switch (status) {
                        case 'pending':
                            return { color: 'orange', text: 'Đang chờ xử lý' };
                        case 'success':
                            return { color: 'green', text: 'Thành công' };

                        case 'cancelled':
                            return { color: 'red', text: 'Đã hủy' };
                        default:
                            return { color: 'default', text: 'Không xác định' };
                    }
                };
                const { color, text } = getStatusConfig(status);
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Phương thức',
            dataIndex: 'typePayment',
            key: 'typePayment',
            render: (type) => {
                const colors = {
                    COD: 'blue',
                    Banking: 'green',
                    Momo: 'purple',
                };
                return <Tag color={colors[type]}>{type}</Tag>;
            },
        },
    ];

    const productColumns = [
        {
            title: 'Phim',
            dataIndex: 'name',
            key: 'name',
        },

        {
            title: 'Số lượng xem',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity) => quantity,
        },
        {
            title: 'Giá vé',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${price?.toLocaleString('vi-VN')}đ`,
        },
    ];

    // Chart configuration
    const config = {
        data: orderStats,
        xField: 'date',
        yField: 'count',
        color: '#1890ff',
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
            },
        },
        meta: {
            date: { alias: 'Ngày' },
            count: { alias: 'Số đơn hàng' },
        },
    };

    // Category pie chart configuration
    const categoryConfig = {
        data: categoryStats,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            type: 'spider',
            content: '{name}: {percentage}',
            style: {
                fontSize: 14,
            },
        },
        interactions: [{ type: 'element-active' }],
        color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'],
    };

    // Order status pie chart configuration
    const orderStatusConfig = {
        data: orderStatusStats,
        angleField: 'value',
        colorField: 'status',
        radius: 0.8,
        label: {
            type: 'spider',
            content: '{name}: {percentage}',
            style: {
                fontSize: 14,
            },
        },
        interactions: [{ type: 'element-active' }],
        color: ['#52c41a', '#ff4d4f'],
    };

    if (loading) {
        return (
            <div className={cx('loading-container')}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <Title level={2}>Thống kê Website Xem Phim</Title>
            <div style={{ marginBottom: 24 }}>
                <DatePicker
                    placeholder="Chọn ngày bắt đầu"
                    onChange={setStartDate}
                    style={{ marginRight: 8 }}
                    value={startDate}
                />
                <DatePicker placeholder="Chọn ngày kết thúc" onChange={setEndDate} value={endDate} />
            </div>

            {/* Thống kê */}
            <Row gutter={[16, 16]} className={cx('statistics')}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Tổng người dùng" value={statistics.totalUsers} prefix={<UserOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Tổng phim" value={statistics.totalMovies} prefix={<ShoppingCartOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu"
                            value={statistics.totalRevenue}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                            formatter={(value) => `${value.toLocaleString('vi-VN')}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Lượt xem phim" value={statistics.totalWatching} prefix={<EyeOutlined />} />
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ đơn hàng 7 ngày gần đây */}
            <Row gutter={[16, 16]} className={cx('order-chart')}>
                <Col xs={24}>
                    <Card title="Thống kê thanh toán theo ngày">
                        <Column {...config} />
                    </Card>
                </Col>
            </Row>

            {/* Bảng dữ liệu */}
            <Row gutter={[16, 16]} className={cx('data-tables')}>
                <Col xs={24} lg={12}>
                    <Card title="Thanh toán gần đây">
                        <Table
                            columns={orderColumns}
                            dataSource={recentOrders}
                            pagination={false}
                            scroll={{ x: true }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Phim đặt chỗ nhiều">
                        <Table
                            columns={productColumns}
                            dataSource={topProducts}
                            pagination={false}
                            scroll={{ x: true }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default DashBoard;
