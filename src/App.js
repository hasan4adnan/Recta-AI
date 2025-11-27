import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
    const [messages, setMessages] = useState([{
        type: 'bot',
        content: 'Hello! I am Recta, your AI companion. How can I assist you today? 😊',
        timestamp: new Date().toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    }]);
    const [inputMessage, setInputMessage] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
        }
    };

    const handleInputChange = (e) => {
        setInputMessage(e.target.value);
        adjustTextareaHeight();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const newMessage = {
            type: 'user',
            content: inputMessage.trim(),
            timestamp: new Date().toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };

        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setIsLoading(true);
        
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        if (!process.env.REACT_APP_GEMINI_API_KEY) {
            setTimeout(() => {
                setIsLoading(false);
                const botResponse = {
                    type: 'bot',
                    content: 'API key is not configured. Please follow the steps in the README file to add your API key.',
                    timestamp: new Date().toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                };
                setMessages(prev => [...prev, botResponse]);
            }, 1000);
            return;
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: inputMessage.trim()
                        }]
                    }]
                })
            });

            const data = await response.json();
            setIsLoading(false);

            if (data.candidates && data.candidates[0].content.parts[0].text) {
                const botResponse = {
                    type: 'bot',
                    content: data.candidates[0].content.parts[0].text,
                    timestamp: new Date().toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                };
                setMessages(prev => [...prev, botResponse]);
            }
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
            const errorMessage = {
                type: 'bot',
                content: 'Sorry, an error occurred. Please try again.',
                timestamp: new Date().toLocaleTimeString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    return (
        <div className={`${isDarkMode ? 'dark-theme' : ''}`}>
            <div className="app-container">
                <div className="chat-container">
                    <header className="header">
                        <div className="logo">
                            <i className="fas fa-robot"></i>
                            <h1>Recta AI</h1>
                        </div>
                        <button 
                            className="theme-toggle"
                            onClick={toggleTheme}
                        >
                            <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
                        </button>
                    </header>

                    <div className="messages">
                        {messages.map((message, index) => (
                            <div 
                                key={index} 
                                className={`message ${message.type}`}
                            >
                                <div className="message-content">
                                    <div className="avatar">
                                        <i className={`fas fa-${message.type === 'bot' ? 'robot' : 'user'}`}></i>
                                    </div>
                                    <div className="text">{message.content}</div>
                                </div>
                                <div className="timestamp">{message.timestamp}</div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="loading-indicator">
                                <div className="loading-dot"></div>
                                <div className="loading-dot"></div>
                                <div className="loading-dot"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="input-container">
                        <div className="input-wrapper">
                            <textarea 
                                ref={textareaRef}
                                value={inputMessage}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyPress}
                                placeholder="Type your message..."
                                rows="1"
                            />
                            <button
                                className="send-button"
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                            >
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;