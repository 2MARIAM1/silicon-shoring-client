import React, { useState, useRef, useEffect } from 'react';
import {queryDocuments} from "../services/ChatAssistantService";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

const ChatAssistant = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setInputValue(e.target.value);

    const sendMessage = async () => {
        if (!inputValue.trim()) return;

        const question = inputValue;
        setMessages((prev) => [...prev, { role: 'user', content: question }]);
        setInputValue('');
        setIsLoading(true);

        try {
            const res = await queryDocuments(question);
            setMessages((prev) => [...prev, { role: 'bot', content: res.answer }]);
        } catch (error) {
            setMessages((prev) => [...prev, { role: 'bot', content: "❌ Error retrieving answer." }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div id="wrapper">
            <Sidebar />
            <div id="content-wrapper" className="d-flex flex-column"  style={{ height: '100vh' }}>
                <div id="content" className="d-flex flex-column" style={{ flex: 1 }}>
                    <Header />
                    {/* Scrollable chat messages */}
                    <div className="container-fluid " style={{ flexGrow: 1, overflowY: 'auto' }}>
                        {messages.length === 0 && (
                            <div className="alert alert-primary text-center">
                                👋 Hello! Ask me any question.
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div key={index} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                <div className={`d-inline-block p-3 rounded shadow ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                                     style={{ maxWidth: '75%' }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="text-left mb-3">
                                <div className="d-inline-block p-3 rounded shadow bg-light text-muted" style={{ maxWidth: '75%' }}>
                                    ⏳ Thinking...
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                    {/* Chat input at bottom */}

                    <div className="container-fluid bg-white border-top py-3" style={{ position: 'sticky', bottom: 0 }}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Type your question here..."
                                value={inputValue}
                                onChange={handleChange}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <div className="input-group-append">
                                <button className="btn btn-primary" onClick={sendMessage} disabled={isLoading}>
                                    <i className="fa fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default ChatAssistant;
