import { Modal, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

function AvatarUploadModal({ isVisible, onClose, onUpload }) {
    const handleAvatarUpload = () => {
        message.success('Cập nhật ảnh đại diện thành công!');
        onUpload();
    };

    return (
        <Modal
            title="Cập nhật ảnh đại diện"
            open={isVisible}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose}>
                    Hủy bỏ
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleAvatarUpload}
                    className="bg-red-600 hover:bg-red-700"
                >
                    Cập nhật
                </Button>,
            ]}
        >
            <Upload.Dragger name="avatar" multiple={false} showUploadList={false} className="mt-4">
                <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                </p>
                <p className="ant-upload-text">Nhấp hoặc kéo thả ảnh vào khu vực này</p>
                <p className="ant-upload-hint">Hỗ trợ các định dạng: JPG, PNG, WEBP. Kích thước tối đa 2MB.</p>
            </Upload.Dragger>
        </Modal>
    );
}

export default AvatarUploadModal;
