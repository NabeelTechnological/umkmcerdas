
import React, { useState, useRef, useEffect } from 'react';
import { askAdvisor } from '../services/geminiService';
import { useUmkmData } from '../hooks/useUmkmData';
import { useLanguage } from '../hooks/useLanguage';
import { UserIcon, BotIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const messageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const Advisor = () => {
    const { t, language } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: t('advisor_initial_message') }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { getSummary, products, sales } = useUmkmData();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Update initial message if language changes and chat is fresh
        setMessages(currentMessages => {
            if (currentMessages.length === 1 && currentMessages[0].sender === 'bot') {
                return [{ sender: 'bot', text: t('advisor_initial_message') }];
            }
            return currentMessages;
        });
    }, [t]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const businessDataSummary = {
                summary: getSummary(),
                products,
                sales,
            };
            const botResponse = await askAdvisor(input, businessDataSummary, language);
            const botMessage: Message = { sender: 'bot', text: botResponse };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error getting response from AI Advisor:", error);
            const errorMessage: Message = { sender: 'bot', text: t('advisor_error_message') };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-md">
            <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            variants={messageVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            layout
                            className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}
                        >
                            {msg.sender === 'bot' && (
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                    <BotIcon className="w-6 h-6" />
                                </div>
                            )}
                            <div className={`max-w-xl p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                            {msg.sender === 'user' && (
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-start gap-4">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                            <BotIcon className="w-6 h-6" />
                         </div>
                        <div className="max-w-xl p-4 rounded-2xl bg-slate-200 text-slate-800 rounded-bl-none">
                           <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
            <div className="p-4 border-t border-slate-200">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={t('advisor_input_placeholder')}
                        className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-500"
                        disabled={isLoading}
                    />
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSend}
                        disabled={isLoading || input.trim() === ''}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default Advisor;
