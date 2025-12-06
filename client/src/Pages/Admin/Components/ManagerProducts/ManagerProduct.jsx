import { Table, Button, Space, Modal, Form, Input, InputNumber, Upload, Select, message, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import styles from './ManagerProduct.module.scss';
import classNames from 'classnames/bind';

import {
    requestCreateMovie,
    requestGetAllMovie,
    requestDeleteMovie, // Uncommented this line
    requestUpdateMovie,
    requestGetAllCategory,
    requestUploadImage,
} from '../../../../config/request';

const cx = classNames.bind(styles);
const { Search } = Input;
const { TextArea } = Input;

function ManagerProduct() {
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewTrailerUrl, setPreviewTrailerUrl] = useState('');
    const openPreview = (url) => {
         const clean = extractSrcFromIframe(url || '');
        setPreviewTrailerUrl(clean);
        setPreviewVisible(true);
    };
    const closePreview = () => {
        setPreviewVisible(false);
        setTimeout(() => setPreviewTrailerUrl(''), 200);
    };
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);
    const [thumbFile, setThumbFile] = useState(null);
    const [posterFile, setPosterFile] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [categories, setCategories] = useState([]);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch categories and movies
    useEffect(() => {
        fetchCategories();
        fetchMovies();
    }, []);
    const extractSrcFromIframe = (input) => {
        if (!input) return '';
        const m = input.match(/src=(?:'|")([^'"]+)(?:'|")/i);
        return m ? m[1] : input.trim();
    };
    const toWatchUrl = (url) => {
        try {
            const u = new URL(url);
            if (u.hostname.includes('youtube.com') && u.pathname.includes('/embed/')) {
            const id = u.pathname.split('/embed/')[1];
            return `https://www.youtube.com/watch?v=${id}`;
            }
            if (u.hostname === 'youtu.be') {
            const id = u.pathname.replace('/', '');
            return `https://www.youtube.com/watch?v=${id}`;
            }
        } catch (e) {}
        return url;
    };
    const toEmbedUrl = (url) => {
        if (!url) return '';
        try {
            const u = new URL(url);
            // https://www.youtube.com/watch?v=ID  ->  /embed/ID
            if (u.hostname.includes('youtube.com')) {
                const v = u.searchParams.get('v');
                if (v) return `https://www.youtube.com/embed/${v}`;
            }
            // https://youtu.be/ID -> /embed/ID
            if (u.hostname === 'youtu.be') {
                const id = u.pathname.replace('/', '');
                if (id) return `https://www.youtube.com/embed/${id}`;
            }
        } catch (e) {}
        return url;
    };
    const fetchCategories = async () => {
        try {
            const response = await requestGetAllCategory();
            setCategories(response.metadata || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Không thể tải danh mục phim');
        }
    };

    const fetchMovies = async () => {
        try {
            setLoading(true);
            const response = await requestGetAllMovie();
            setMovies(response.metadata || []);
        } catch (error) {
            console.error('Error fetching movies:', error);
            message.error('Không thể tải danh sách phim');
        } finally {
            setLoading(false);
        }
    };

    // Filter movies based on search keyword
    const filteredMovies = movies.filter(
        (movie) =>
            movie.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            (movie.description && movie.description.toLowerCase().includes(searchKeyword.toLowerCase())),
    );

    const handleSearch = (value) => {
        setSearchKeyword(value);
    };

    const handleAdd = () => {
        setEditingMovie(null);
        form.resetFields();
        setThumbFile(null);
        setPosterFile(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingMovie(record);
        form.setFieldsValue({
            name: record.name,
            category: categories.find((cat) => cat.id === record.category.id)?.id || null,
            actor: record.actor,
            country: record.country,
            description: record.description,
            director: record.director,
            time: record.time,
            price: record.price,
            quality: record.quality,
            year: record.year,
            dateStart: record.dateStart ? dayjs(record.dateStart) : null,
            dateEnd: record.dateEnd ? dayjs(record.dateEnd) : null,
            trailerUrl: record.trailer_url || record.trailerUrl || '',
        });

        // Reset file states when editing
        setThumbFile(null);
        setPosterFile(null);
        setIsModalOpen(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa phim "${record.name}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await requestDeleteMovie(record.id);
                    await fetchMovies();
                    message.success('Đã xóa phim thành công');
                } catch (error) {
                    console.error('Error deleting movie:', error);
                    message.error('Xóa phim thất bại');
                }
            },
        });
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            let trailerInput = values.trailerUrl || (editingMovie && (editingMovie.trailer_url || editingMovie.trailerUrl)) || '';
            trailerInput = extractSrcFromIframe(trailerInput);
            // validate embeddable via YouTube oEmbed when possible
            if (trailerInput.includes('youtube')) {
            const checkUrl = encodeURIComponent(toWatchUrl(trailerInput));
            try {
                const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${checkUrl}`);
                if (!res.ok) {
                message.error('Video YouTube hiện không cho phép nhúng (embed). Vui lòng dùng video khác hoặc lưu link để mở ngoài YouTube.');
                return; // dừng lưu để admin sửa
                }
            } catch (err) {
                // Nếu bị CORS hoặc mạng, cho phép lưu nhưng cảnh báo
                console.warn('oEmbed check failed:', err);
                message.warning('Không thể kiểm tra tính nhúng của YouTube (có thể do CORS). Hãy kiểm tra video sau khi lưu.');
            }
            }
            const { poster, thumb, ...rest } = values;
            let data = {
            ...rest,
            dateStart: values.dateStart ? values.dateStart.format('YYYY-MM-DD') : null,
            dateEnd: values.dateEnd ? values.dateEnd.format('YYYY-MM-DD') : null,
            };
            if (trailerInput) data.trailer_url = trailerInput;
            else if (editingMovie) data.trailer_url = editingMovie.trailer_url || editingMovie.trailerUrl || '';
            // Handle image upload
            setLoading(true);
            if (thumbFile || posterFile) {
                const formData = new FormData();

                // Only append files if they exist
                if (thumbFile) {
                    formData.append('thumb_url', thumbFile);
                }
                if (posterFile) {
                    formData.append('poster_url', posterFile);
                }

                const res = await requestUploadImage(formData);

                // Update data with new image URLs, keep existing ones if not updated
                if (res.metadata.thumb_url) {
                    data.thumb_url = res.metadata.thumb_url;
                } else if (editingMovie) {
                    data.thumb_url = editingMovie.thumb_url;
                }

                if (res.metadata.poster_url) {
                    data.poster_url = res.metadata.poster_url;
                } else if (editingMovie) {
                    data.poster_url = editingMovie.poster_url;
                }
            } else if (editingMovie) {
                // Keep existing images if no new files uploaded
                data.thumb_url = editingMovie.thumb_url;
                data.poster_url = editingMovie.poster_url;
            }

            // For new movie, ensure both images are provided
            if (!editingMovie && (!data.thumb_url || !data.poster_url)) {
                message.error('Vui lòng tải lên cả ảnh thumbnail và poster cho phim mới');
                return;
            }

            if (editingMovie) {
                data.id = editingMovie.id;
                console.log(data);

                await requestUpdateMovie(data);
                message.success('Cập nhật phim thành công');
            } else {
                await requestCreateMovie(data);
                message.success('Thêm phim mới thành công');
            }

            // Reset form and fetch updated data
            setIsModalOpen(false);
            form.resetFields();
            setThumbFile(null);
            setPosterFile(null);
            await fetchMovies();
        } catch (error) {
            console.error('Form validation or submission error:', error);
            message.error('Vui lòng kiểm tra lại thông tin');
        } finally {
            setLoading(false);
        }
    };

    // Define columns for movie table
    const columns = [
        {
            title: 'Poster',
            dataIndex: 'poster_url',
            key: 'poster_url',
            render: (poster_url) => (
                <img
                    src={`${poster_url}`}
                    alt="Movie Poster"
                    style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
                />
            ),
        },
        {
            title: 'Tên phim',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Thời lượng',
            dataIndex: 'time',
            key: 'time',
            render: (time) => `${time} phút`,
        },
        {
            title: 'Năm sản xuất',
            dataIndex: 'year',
            key: 'year',
        },
        {
            title: 'Giá vé',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${parseInt(price).toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Chất lượng',
            dataIndex: 'quality',
            key: 'quality',
        },
        {
            title: 'Trailer',
            dataIndex: 'trailer_url',
            key: 'trailer',
            render: (trailer, record) => {
                const url = trailer || record.trailerUrl || record.trailer_url || '';
                return (
                    <Space>
                        {url ? (
                            <>
                                <Button
                                    icon={<PlayCircleOutlined />}
                                    size="small"
                                    onClick={() => openPreview(url)}
                                >
                                    Xem
                                </Button>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(url);
                                            message.success('Đã sao chép link trailer');
                                        } catch {
                                            message.error('Sao chép thất bại');
                                        }
                                        }}
                                >
                                    Sao chép
                                </Button>
                            </>
                        ) : (
                            <span className="text-gray-400">Chưa có</span>
                        )}
                    </Space>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                            console.log('record', record);

                            handleEdit(record);
                        }}
                    >
                        Sửa
                    </Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h2 className="text-2xl ">Quản lý phim</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm phim mới
                </Button>
            </div>

            <div className={cx('search-container')} style={{ marginBottom: '20px' }}>
                <Search
                    placeholder="Tìm kiếm phim..."
                    allowClear
                    enterButton
                    size="large"
                    onSearch={handleSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ maxWidth: '500px' }}
                />
            </div>

            <Table
                columns={columns}
                dataSource={filteredMovies}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
            <Modal
                title="Xem Trailer"
                open={previewVisible}
                onCancel={closePreview}
                footer={null}
                width="80%"
                bodyStyle={{ padding: 0, background: '#000' }}
            >
                <div style={{ width: '100%', height: '56.25vw', maxHeight: '70vh' }}>
                    {previewTrailerUrl ? (
                        // Nếu là file mp4 -> dùng <video>, còn lại (YouTube, iframe...) -> dùng <iframe embed>
                        previewTrailerUrl.toLowerCase().endsWith('.mp4') ? (
                            <video
                                src={previewTrailerUrl}
                                controls
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <iframe
                                src={toEmbedUrl(previewTrailerUrl)}
                                title="Trailer"
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                allowFullScreen
                            />
                        )
                    ) : (
                        <div style={{ padding: 24, color: '#fff', textAlign: 'center' }}>
                            Trailer chưa có
                        </div>
                    )}
                </div>
            </Modal>


            <Modal
                title={editingMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setThumbFile(null);
                    setPosterFile(null);
                }}
                width={800}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical" className={cx('form')}>
                    <div className={cx('form-row')}>
                        <Form.Item
                            name="name"
                            label="Tên phim"
                            rules={[{ required: true, message: 'Vui lòng nhập tên phim!' }]}
                        >
                            <Input placeholder="Nhập tên phim" />
                        </Form.Item>

                        <Form.Item
                            name="category"
                            label="Thể loại"
                            rules={[{ required: true, message: 'Vui lòng chọn thể loại!' }]}
                        >
                            <Select placeholder="Chọn thể loại">
                                {categories.map((category) => (
                                    <Select.Option key={category.id} value={category.id}>
                                        {category.nameCategory}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <div className={cx('form-row')}>
                        <Form.Item
                            name="director"
                            label="Đạo diễn"
                            rules={[{ required: true, message: 'Vui lòng nhập tên đạo diễn!' }]}
                        >
                            <Input placeholder="Nhập tên đạo diễn" />
                        </Form.Item>

                        <Form.Item
                            name="country"
                            label="Quốc gia"
                            rules={[{ required: true, message: 'Vui lòng nhập quốc gia!' }]}
                        >
                            <Input placeholder="Nhập quốc gia sản xuất" />
                        </Form.Item>
                    </div>

                    <div className={cx('form-row')}>
                        <Form.Item
                            name="time"
                            label="Thời lượng (phút)"
                            rules={[{ required: true, message: 'Vui lòng nhập thời lượng phim!' }]}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập thời lượng (phút)" />
                        </Form.Item>

                        <Form.Item
                            name="price"
                            label="Giá vé"
                            rules={[{ required: true, message: 'Vui lòng nhập giá vé!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                placeholder="Nhập giá vé"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </div>

                    <div className={cx('form-row')}>
                        <Form.Item
                            name="quality"
                            label="Chất lượng"
                            rules={[{ required: true, message: 'Vui lòng chọn chất lượng!' }]}
                        >
                            <Select placeholder="Chọn chất lượng">
                                <Select.Option value="HD">HD</Select.Option>
                                <Select.Option value="Full HD">Full HD</Select.Option>
                                <Select.Option value="2K">2K</Select.Option>
                                <Select.Option value="4K">4K</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="year"
                            label="Năm sản xuất"
                            rules={[{ required: true, message: 'Vui lòng nhập năm sản xuất!' }]}
                        >
                            <Input placeholder="Nhập năm sản xuất" />
                        </Form.Item>
                    </div>

                    <div className={cx('form-row')}>
                        <Form.Item
                            name="dateStart"
                            label="Ngày bắt đầu chiếu"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                        >
                            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="Chọn ngày bắt đầu" />
                        </Form.Item>

                        <Form.Item name="dateEnd" label="Ngày kết thúc chiếu">
                            <DatePicker
                                style={{ width: '100%' }}
                                format="DD-MM-YYYY"
                                placeholder="Chọn ngày kết thúc"
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="actor"
                        label="Diễn viên"
                        rules={[{ required: true, message: 'Vui lòng nhập tên diễn viên!' }]}
                    >
                        <TextArea rows={2} placeholder="Nhập tên diễn viên (ngăn cách bằng dấu phẩy)" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả phim!' }]}
                    >
                        <TextArea rows={4} placeholder="Nhập mô tả chi tiết về phim" />

                    </Form.Item>
                    <Form.Item
                        name="trailerUrl"
                        label="Trailer URL"
                        rules={[{ required: false, message: 'Nhập URL trailer (embed hoặc mp4)' }]}
                    >
                        <Input placeholder="Ví dụ: https://www.youtube.com/embed/ID hoặc https://domain.com/trailer.mp4" />
                    </Form.Item>
                    <div className={cx('form-row')}>
                        <Form.Item
                            name="thumb"
                            label="Ảnh thumbnail"
                            rules={[{ required: !editingMovie, message: 'Vui lòng tải lên ảnh thumbnail!' }]}
                        >
                            <Upload
                                beforeUpload={(file) => {
                                    setThumbFile(file);
                                    return false;
                                }}
                                onRemove={() => setThumbFile(null)}
                                maxCount={1}
                                listType="picture"
                                accept="image/*"
                                fileList={thumbFile ? [{ uid: '-1', name: thumbFile.name, status: 'done' }] : []}
                            >
                                <Button icon={<UploadOutlined />}>
                                    {thumbFile ? 'Thay đổi ảnh thumbnail' : 'Tải ảnh thumbnail'}
                                </Button>
                            </Upload>
                            {editingMovie && editingMovie.thumb_url && !thumbFile && (
                                <div style={{ marginTop: '8px' }}>
                                    <img
                                        src={`${editingMovie.thumb_url}`}
                                        alt="Current thumbnail"
                                        style={{ height: '80px', objectFit: 'cover' }}
                                    />
                                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                                        Ảnh thumbnail hiện tại
                                    </p>
                                </div>
                            )}
                        </Form.Item>

                        <Form.Item
                            name="poster"
                            label="Ảnh poster"
                            rules={[{ required: !editingMovie, message: 'Vui lòng tải lên ảnh poster!' }]}
                        >
                            <Upload
                                beforeUpload={(file) => {
                                    setPosterFile(file);
                                    return false;
                                }}
                                onRemove={() => setPosterFile(null)}
                                maxCount={1}
                                listType="picture"
                                accept="image/*"
                                fileList={posterFile ? [{ uid: '-1', name: posterFile.name, status: 'done' }] : []}
                            >
                                <Button icon={<UploadOutlined />}>
                                    {posterFile ? 'Thay đổi ảnh poster' : 'Tải ảnh poster'}
                                </Button>
                            </Upload>
                            {editingMovie && editingMovie.poster_url && !posterFile && (
                                <div style={{ marginTop: '8px' }}>
                                    <img
                                        src={`${editingMovie.poster_url}`}
                                        alt="Current poster"
                                        style={{ height: '80px', objectFit: 'cover' }}
                                    />
                                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                                        Ảnh poster hiện tại
                                    </p>
                                </div>
                            )}
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}

export default ManagerProduct;
