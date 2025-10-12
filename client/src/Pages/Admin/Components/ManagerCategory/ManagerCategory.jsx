import { useEffect, useState } from 'react';
import styles from './ManagerCategory.module.scss';
import classNames from 'classnames/bind';
import { Table, Button, Modal, Form, Input, Upload, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import {
    requestCreateCategory,
    requestDeleteCategory,
    requestGetAllCategory,
    requestUpdateCategory,
} from '../../../../config/request';

const cx = classNames.bind(styles);

function ManagerCategory() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [form] = Form.useForm();

    const [categories, setCategories] = useState([]);
    const fetchCategories = async () => {
        const categories = await requestGetAllCategory();
        setCategories(categories.metadata);
    };
    useEffect(() => {
        fetchCategories();
    }, []);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'nameCategory',
            key: 'nameCategory',
        },
        {
            title: 'Tổng số phim',
            dataIndex: 'movies',
            key: 'movies',
            render: (movies) => movies.length,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setModalMode('edit');
                            setIsModalOpen(true);
                            form.setFieldsValue({
                                ...record,
                                id: record.id,
                            });
                        }}
                    >
                        Sửa
                    </Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    // Sample data - replace with your actual data
    const data = categories;

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa danh mục này?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            onOk: async () => {
                await requestDeleteCategory(id);
                message.success('Đã xóa danh mục thành công');
                await fetchCategories();
            },
        });
    };

    const handleSubmit = async (values) => {
        try {
            if (modalMode === 'add') {
                const categoryData = {
                    nameCategory: values.nameCategory,
                };

                await requestCreateCategory(categoryData);
                message.success('Đã tạo danh mục thành công');
                setIsModalOpen(false);
                form.resetFields();
                await fetchCategories();
            }
            if (modalMode === 'edit') {
                const categoryData = {
                    nameCategory: values.nameCategory,
                    id: values.id,
                };

                await requestUpdateCategory(categoryData);
                message.success('Đã cập nhật danh mục thành công');
                setIsModalOpen(false);
                form.resetFields();
                await fetchCategories();
            }
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h2>Quản lý danh mục</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setModalMode('add');
                        setIsModalOpen(true);
                        form.resetFields();
                    }}
                >
                    Thêm danh mục
                </Button>
            </div>

            <Table columns={columns} dataSource={data} bordered className={cx('category-table')} />

            <Modal
                title={modalMode === 'add' ? 'Thêm danh mục' : 'Sửa danh mục'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="id" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="nameCategory"
                        label="Tên danh mục"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập tên danh mục!',
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên danh mục" />
                    </Form.Item>

                    <Form.Item className={cx('form-actions')}>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {modalMode === 'add' ? 'Thêm' : 'Lưu'}
                            </Button>
                            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default ManagerCategory;
