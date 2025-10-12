import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Modal, Descriptions, Select, message, DatePicker, Row, Col } from 'antd';
import classNames from 'classnames/bind';
import styles from './ManagerOrder.module.scss';

import dayjs from 'dayjs';
import { requestGetPaymentByAdmin, requestUpdatePaymentStatus } from '../../../../config/request';

const cx = classNames.bind(styles);
const { RangePicker } = DatePicker;

function ManagerOrder() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);

    // Fetch payments data when component mounts

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await requestGetPaymentByAdmin();
            setPayments(response.metadata);
        } catch (error) {
            console.error('Error fetching payments:', error);
            message.error('Lỗi khi tải danh sách thanh toán');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleViewDetails = (record) => {
        setSelectedPayment(record);
        setIsModalVisible(true);
    };

    const handleStatusChange = async (newStatus, record) => {
        try {
            const data = {
                id: record.id,
                status: newStatus,
            };
            await requestUpdatePaymentStatus(data);
            message.success('Cập nhật trạng thái thành công');
            fetchPayments();
        } catch (error) {
            console.error('Error updating status:', error);
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'gold',
            success: 'green',
            failed: 'red',
        };
        return colors[status.toLowerCase()];
    };

    const getStatusText = (status) => {
        const statusText = {
            pending: 'Chờ xử lý',
            success: 'Thành công',
            failed: 'Thất bại',
        };
        return statusText[status.toLowerCase()];
    };

    const handleFilterChange = (type, value) => {
        if (type === 'status') {
            setStatusFilter(value);
        } else if (type === 'date') {
            setDateRange(value);
        }
    };

    const getFilteredPayments = () => {
        let filteredPayments = [...payments];

        // Filter by status
        if (statusFilter !== 'all') {
            filteredPayments = filteredPayments.filter((payment) => payment.status === statusFilter);
        }

        // Filter by date range
        if (dateRange && dateRange[0] && dateRange[1]) {
            const startDate = dateRange[0].startOf('day');
            const endDate = dateRange[1].endOf('day');
            filteredPayments = filteredPayments.filter((payment) => {
                const paymentDate = dayjs(payment.date);
                return paymentDate.isAfter(startDate) && paymentDate.isBefore(endDate);
            });
        }

        return filteredPayments;
    };

    const columns = [
        {
            title: 'Mã thanh toán',
            dataIndex: 'id',
            key: 'id',
            width: '15%',
        },
        {
            title: 'Mã người dùng',
            dataIndex: 'userId',
            key: 'userId',
            render: (userId, record) => record.user.fullName,
        },
        {
            title: 'Ảnh phim',
            dataIndex: 'movieId',
            key: 'movieId',
            render: (movieId, record) => <img className={cx('image')} src={record.movie.poster_url} alt="ảnh phim" />,
        },
        {
            title: 'Tên phim',
            dataIndex: 'movieId',
            key: 'movieId',
            render: (movieId, record) => record.movie.name,
        },

        {
            title: 'Ghế',
            dataIndex: 'seatId',
            key: 'seatId',
            width: '10%',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: '10%',
            align: 'right',
            render: (price) => <span className={cx('price')}>{price.toLocaleString('vi-VN')}đ</span>,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            width: '15%',
            render: (status, record) => (
                <Select
                    value={status}
                    style={{ width: 140 }}
                    onChange={(newStatus) => handleStatusChange(newStatus, record)}
                    className={cx('status-select')}
                >
                    <Select.Option value="pending">
                        <Tag color="gold">Chờ xử lý</Tag>
                    </Select.Option>
                    <Select.Option value="success">
                        <Tag color="green">Thành công</Tag>
                    </Select.Option>
                    <Select.Option value="failed">
                        <Tag color="red">Thất bại</Tag>
                    </Select.Option>
                </Select>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: '10%',
            align: 'center',
            render: (_, record) => (
                <Button type="primary" onClick={() => handleViewDetails(record)} className={cx('action-button')}>
                    Chi tiết
                </Button>
            ),
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h2 className={cx('title')}>Quản lý thanh toán vé xem phim</h2>
            </div>

            <div className={cx('filters')}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Lọc theo trạng thái"
                            value={statusFilter}
                            onChange={(value) => handleFilterChange('status', value)}
                        >
                            <Select.Option value="all">Tất cả trạng thái</Select.Option>
                            <Select.Option value="pending">Chờ xử lý</Select.Option>
                            <Select.Option value="success">Thành công</Select.Option>
                            <Select.Option value="failed">Thất bại</Select.Option>
                        </Select>
                    </Col>
                    <Col span={8}>
                        <RangePicker
                            style={{ width: '100%' }}
                            placeholder={['Từ ngày', 'Đến ngày']}
                            value={dateRange}
                            onChange={(value) => handleFilterChange('date', value)}
                            format="DD/MM/YYYY"
                        />
                    </Col>
                </Row>
            </div>

            <div className={cx('content')}>
                <Table
                    columns={columns}
                    dataSource={getFilteredPayments()}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        position: ['bottomCenter'],
                    }}
                    loading={loading}
                    className={cx('payment-table')}
                />
            </div>

            <Modal
                title={<div className={cx('modal-title')}>Chi tiết thanh toán</div>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={700}
                className={cx('payment-modal')}
            >
                {selectedPayment && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Mã thanh toán">{selectedPayment.id}</Descriptions.Item>
                        <Descriptions.Item label="Mã người dùng">{selectedPayment.user.fullName}</Descriptions.Item>
                        <Descriptions.Item label="Tên phim">{selectedPayment.movie.name}</Descriptions.Item>
                        <Descriptions.Item label="Ảnh phim">
                            <img src={selectedPayment.movie.thumb_url} alt="ảnh phim" />
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghế">{selectedPayment.seatId}</Descriptions.Item>
                        <Descriptions.Item label="Thời gian">{selectedPayment.time}</Descriptions.Item>
                        <Descriptions.Item label="Ngày xem">
                            {dayjs(selectedPayment.date).format('DD/MM/YYYY')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng tiền">
                            {selectedPayment.totalPrice.toLocaleString('vi-VN')}đ
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={getStatusColor(selectedPayment.status)}>
                                {getStatusText(selectedPayment.status)}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phương thức thanh toán">
                            {selectedPayment.paymentMethod === 'momo' ? 'MoMo' : 'VNPay'}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
}

export default ManagerOrder;
