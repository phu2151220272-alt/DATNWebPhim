import { useState, useRef, useEffect } from 'react';
import { Button, Input, Spin, Avatar, Badge, Tooltip, Typography } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, CloseOutlined, MessageOutlined } from '@ant-design/icons';
import { useStore } from '../hooks/useStore';
import { useNavigate } from 'react-router-dom';
import { requestChatbot, requestGetMessageChatbot } from '../config/request';

const { Text } = Typography;

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const { dataUser } = useStore();
    const navigate = useNavigate();

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest',
            });
        }, 100);
    };

    useEffect(() => {
        const fetchMessageChatbot = async () => {
            try {
                const res = await requestGetMessageChatbot();
                setMessages(res.metadata);
            } catch (error) {
                console.error('Error fetching messages:', error);
                // Set default welcome message if no messages
                setMessages([
                    {
                        id: 'welcome',
                        sender: 'bot',
                        content:
                            '👋 Xin chào! Tôi là AI Assistant của khách sạn. Tôi có thể giúp bạn tư vấn về phòng, dịch vụ, đặt phòng và nhiều thông tin khác. Bạn cần hỗ trợ gì? 😊',
                        timestamp: new Date(),
                    },
                ]);
            }
        };
        if (!dataUser.id) return;
        fetchMessageChatbot();
    }, [dataUser.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Scroll when loading state changes
    useEffect(() => {
        if (!isLoading) {
            scrollToBottom();
        }
    }, [isLoading]);

    // Scroll when chat opens
    useEffect(() => {
        if (isOpen && messages.length > 0) {
            scrollToBottom();
        }
    }, [isOpen]);

    // Reset unread count when opening chat
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        if (!dataUser.id) {
            // Show login prompt
            const shouldLogin = window.confirm(
                '🔐 Bạn cần đăng nhập để sử dụng chatbot. Bạn có muốn đăng nhập ngay bây giờ không?',
            );
            if (shouldLogin) {
                navigate('/login');
            }
            return;
        }

        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            sender: 'user',
            content: inputValue,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Scroll after adding user message
        setTimeout(() => scrollToBottom(), 50);

        try {
            // Call API to get bot response
            const res = await requestChatbot({ question: inputValue });

            // Add bot response
            const botMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                content: res.metadata,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);

            // Scroll after adding bot message
            setTimeout(() => scrollToBottom(), 100);

            // Increment unread count if chat is minimized
            if (!isOpen) {
                setUnreadCount((prev) => prev + 1);
            }
        } catch (error) {
            // Add error message
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                content: '❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);

            // Scroll after adding error message
            setTimeout(() => scrollToBottom(), 100);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed bottom-30 right-6 z-50">
            {isOpen ? (
                <div className="bg-white rounded-2xl shadow-2xl w-[400px] h-[650px] flex flex-col border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white p-4 relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    size={40}
                                    icon={<RobotOutlined />}
                                    className="bg-white/20 border-2 border-white/30"
                                />
                                <div>
                                    <h3 className="font-semibold text-lg">AI hỗ trợ khách hàng</h3>
                                </div>
                            </div>
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 rounded-full"
                                size="large"
                            />
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white scroll-smooth">
                        {messages.map((message, index) => (
                            <div
                                key={message.id || index}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                            >
                                <div
                                    className={`flex items-start gap-2 max-w-[80%] ${
                                        message.sender === 'user' ? 'flex-row-reverse' : ''
                                    }`}
                                >
                                    {message.sender === 'bot' && (
                                        <img
                                            src="https://promete.ai/wp-content/uploads/2023/03/avatar5-1.png"
                                            alt="avatar"
                                            className="w-10 h-10 object-cover rounded-full border-2 border-white shadow-md"
                                        />
                                    )}
                                    <div className="flex flex-col">
                                        <div
                                            className={`rounded-2xl px-4 py-3 shadow-sm ${
                                                message.sender === 'user'
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                                    : 'bg-white border border-gray-200'
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                                {message.content}
                                            </p>
                                        </div>
                                        <Text
                                            className={`text-xs mt-1 ${
                                                message.sender === 'user'
                                                    ? 'text-right text-gray-500'
                                                    : 'text-left text-gray-400'
                                            }`}
                                        >
                                            {formatTime(message.timestamp)}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-start gap-2">
                                    <img
                                        src="https://promete.ai/wp-content/uploads/2023/03/avatar5-1.png"
                                        alt="avatar"
                                        className="w-10 h-10 object-cover rounded-full border-2 border-white shadow-md"
                                    />
                                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <Spin size="small" />
                                            <Text className="text-gray-500 text-sm">AI đang trả lời...</Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex gap-2">
                            <Input.TextArea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="💬 Nhập tin nhắn của bạn..."
                                autoSize={{ minRows: 1, maxRows: 4 }}
                                className="flex-1 rounded-xl border-gray-200 focus:border-purple-500 focus:shadow-md transition-all"
                                disabled={isLoading}
                                autoFocus
                            />
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSend}
                                disabled={isLoading || !inputValue.trim()}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 rounded-xl shadow-md hover:shadow-lg transition-all"
                                size="large"
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <Text className="text-xs text-gray-400">
                                💡 Nhấn Enter để gửi, Shift + Enter để xuống dòng
                            </Text>
                            {!dataUser.id && (
                                <Text className="text-xs text-orange-500">
                                    🔐 Đăng nhập để sử dụng đầy đủ tính năng
                                </Text>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <Tooltip title="Chat với AI Assistant" placement="left">
                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(true)}
                            className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
                        >
                            <MessageOutlined className="text-white text-2xl" />
                        </button>
                        {unreadCount > 0 && (
                            <Badge
                                count={unreadCount}
                                className="absolute -top-2 -right-2"
                                style={{ backgroundColor: '#ff4d4f' }}
                            />
                        )}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
                    </div>
                </Tooltip>
            )}
        </div>
    );
}

export default Chatbot;
