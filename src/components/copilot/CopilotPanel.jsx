import React, { useState, useRef, useEffect } from 'react';
import { useCopilot } from '@/contexts/CopilotContext';
import { JobCardList } from './renderers/JobCardList';
import { InterviewScheduleList } from './renderers/InterviewScheduleList';
import {
    Send, Sparkles, X, Loader2, Bot, User,
    Briefcase, CalendarCheck, Search, Lightbulb,
    ArrowRight, MessageSquarePlus
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

// ── Structured Data Router ──
function StructuredDataRenderer({ data }) {
    if (!data || !data.type) return null;
    switch (data.type) {
        case 'job_cards':
            return <JobCardList jobs={data.data.jobs} />;
        case 'interview_schedule':
            return <InterviewScheduleList interviews={data.data.interviews} />;
        case 'knowledge_answer':
            return null;
        default:
            return null;
    }
}

// ── Quick Prompt Suggestions ──
const quickPrompts = [
    { icon: Search, label: 'Careerzone Copilot có thể làm gì', message: 'Careerzone Copilot có thể làm gì', color: 'from-emerald-50 to-emerald-100/60 text-emerald-700 border-emerald-200/80 hover:border-emerald-300' },
    { icon: CalendarCheck, label: 'Lịch phỏng vấn sắp tới', message: 'Cho tôi xem lịch phỏng vấn sắp tới', color: 'from-sky-50 to-sky-100/60 text-sky-700 border-sky-200/80 hover:border-sky-300' },
    { icon: Briefcase, label: 'Việc sắp hết hạn', message: 'Cho tôi xem các việc làm sắp hết hạn', color: 'from-amber-50 to-amber-100/60 text-amber-700 border-amber-200/80 hover:border-amber-300' },
    { icon: Lightbulb, label: 'Gợi ý cải thiện tin', message: 'Gợi ý cách cải thiện tin tuyển dụng của tôi', color: 'from-violet-50 to-violet-100/60 text-violet-700 border-violet-200/80 hover:border-violet-300' },
];

// ── Welcome Screen ──
function WelcomeScreen({ onSendMessage }) {
    return (
        <div className="flex flex-col items-center justify-center h-full px-5 py-6 copilot-welcome-fadein">
            {/* Logo */}
            <div className="relative mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center shadow-sm">
                    <span className="text-[7px] text-emerald-700 font-bold">AI</span>
                </div>
            </div>

            <h3 className="text-base font-semibold text-gray-800 mb-0.5">
                CareerZone Copilot
            </h3>
            <p className="text-xs text-gray-500 text-center mb-6 max-w-[240px] leading-relaxed">
                Trợ lý AI thông minh giúp bạn quản lý tuyển dụng hiệu quả hơn
            </p>

            {/* Quick prompts */}
            <div className="w-full space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium px-1">
                    Bắt đầu nhanh
                </p>
                {quickPrompts.map((prompt, i) => {
                    const Icon = prompt.icon;
                    return (
                        <button
                            key={i}
                            onClick={() => onSendMessage(prompt.message)}
                            className={cn(
                                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left",
                                "bg-gradient-to-r",
                                "hover:scale-[1.01] active:scale-[0.99] transition-all duration-200",
                                "group cursor-pointer",
                                prompt.color
                            )}
                        >
                            <Icon className="w-4 h-4 shrink-0 opacity-70" />
                            <span className="text-[13px] font-medium flex-1">{prompt.label}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-200" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ── Message Bubble Component ──
function MessageBubble({ msg, index }) {
    const isUser = msg.role === 'user';

    return (
        <div
            className={cn(
                'flex gap-2 copilot-msg-fadein',
                isUser ? 'flex-row-reverse' : 'flex-row'
            )}
            style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}
        >
            {/* Avatar */}
            {!isUser && (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-3.5 h-3.5 text-white" />
                </div>
            )}
            {isUser && (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-white" />
                </div>
            )}

            <div className={cn('flex flex-col gap-1.5 max-w-[85%]', isUser ? 'items-end' : 'items-start')}>
                {/* Text content */}
                {msg.content && (
                    <div className={cn(
                        'inline-block px-3 py-2 text-[13px] leading-relaxed',
                        isUser
                            ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-md shadow-sm'
                            : 'bg-white text-gray-700 rounded-2xl rounded-tl-md border border-gray-100 shadow-sm'
                    )}>
                        <div className={cn(
                            'prose prose-sm max-w-none',
                            isUser
                                ? 'prose-invert [&_p]:text-white [&_p]:mb-1 [&_p:last-child]:mb-0'
                                : '[&_p]:text-gray-700 [&_p]:mb-1 [&_p:last-child]:mb-0 [&_strong]:text-gray-900 [&_li]:text-gray-600 [&_code]:text-emerald-600 [&_code]:bg-emerald-50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_a]:text-emerald-600 [&_a]:no-underline hover:[&_a]:underline'
                        )}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* Structured data renderers */}
                {msg.structuredDataList && msg.structuredDataList.length > 0 && (
                    <div className="w-full mt-1 space-y-2">
                        {msg.structuredDataList.map((sd, sdIdx) => (
                            <StructuredDataRenderer key={`${sd.type}-${sdIdx}`} data={sd} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Tool Progress Indicator ──
function ToolProgressIndicator({ toolProgress }) {
    const toolLabels = {
        search_jobs: 'Đang tìm kiếm việc làm…',
        get_recommendations: 'Đang tạo gợi ý cá nhân hóa…',
        get_job_detail: 'Đang đọc chi tiết công việc…',
        get_my_interviews: 'Đang lấy lịch phỏng vấn…',
        get_my_applications: 'Đang lấy danh sách ứng tuyển…',
        getExpiringJobs: 'Đang lấy các công việc sắp hết hạn…',
        getSavedJobsExpiringSoon: 'Đang kiểm tra việc làm đã lưu…',
    };
    const label = toolLabels[toolProgress.tool] || 'Đang xử lý…';

    return (
        <div className="flex items-start gap-2 copilot-msg-fadein">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="copilot-shimmer-pill">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                <span className="text-[13px] text-gray-600 font-medium">{label}</span>
            </div>
        </div>
    );
}

// ── Thinking Dots ──
function ThinkingDots() {
    return (
        <div className="flex items-start gap-2 copilot-msg-fadein">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-100 rounded-2xl rounded-tl-md shadow-sm">
                <div className="copilot-thinking-dots">
                    <span />
                    <span />
                    <span />
                </div>
            </div>
        </div>
    );
}

// ── Main Panel ──
export function CopilotPanel() {
    const { isOpen, setIsOpen, messages, isStreaming, toolProgress, sendMessage, clearSession } = useCopilot();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isStreaming, toolProgress]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
        }
    }, [input]);

    if (!isOpen) return null;

    const handleSend = () => {
        if (!input.trim() || isStreaming) return;
        sendMessage(input.trim());
        setInput('');
    };

    const hasMessages = messages.length > 0;

    // Streaming state helpers
    const lastMsg = messages[messages.length - 1];
    const hasContent = lastMsg && lastMsg.role === 'assistant' && (lastMsg.content || (lastMsg.structuredDataList && lastMsg.structuredDataList.length > 0));
    const isToolRunning = toolProgress && toolProgress.status === 'running';
    const showThinking = isStreaming && !hasContent && !isToolRunning;

    return (
        <>
            {/* Floating chat panel — anchored bottom-right, not full height */}
            <aside className={cn(
                "fixed right-4 bottom-4 w-[400px] z-50 flex flex-col copilot-panel-slidein",
                "bg-white rounded-2xl shadow-2xl shadow-gray-300/40 border border-gray-200/80",
                "overflow-hidden"
            )}
                style={{ maxHeight: 'calc(100vh - 100px)', height: '680px' }}
            >
                {/* Header */}
                <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200/50">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800 leading-none">Copilot</h2>
                            <p className="text-[10px] text-gray-400 mt-0.5">AI Assistant</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                        {hasMessages && (
                            <button
                                onClick={clearSession}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Cuộc trò chuyện mới"
                            >
                                <MessageSquarePlus className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto copilot-scrollbar bg-gray-50/50">
                    {!hasMessages ? (
                        <WelcomeScreen onSendMessage={(msg) => sendMessage(msg)} />
                    ) : (
                        <div className="p-4 space-y-4">
                            {messages.map((msg, i) => {
                                // Skip empty assistant placeholder (thinking dots handle it)
                                const isEmpty = msg.role === 'assistant' && !msg.content && (!msg.structuredDataList || msg.structuredDataList.length === 0);
                                if (isEmpty) return null;
                                return <MessageBubble key={i} msg={msg} index={i} />;
                            })}

                            {/* Tool progress */}
                            {isStreaming && isToolRunning && (
                                <ToolProgressIndicator toolProgress={toolProgress} />
                            )}

                            {/* Thinking dots */}
                            {showThinking && <ThinkingDots />}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input area */}
                <div className="border-t border-gray-100 p-3 bg-white">
                    <div className={cn(
                        "flex items-end gap-1.5 rounded-xl border transition-all duration-200",
                        "bg-gray-50/80",
                        input.trim()
                            ? "border-emerald-300 ring-2 ring-emerald-100"
                            : "border-gray-200 hover:border-gray-300"
                    )}>
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Nhập câu hỏi của bạn…"
                            className="flex-1 max-h-32 min-h-[38px] resize-none bg-transparent px-3 py-2.5 outline-none text-sm text-gray-700 placeholder:text-gray-400"
                            disabled={isStreaming}
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isStreaming || !input.trim()}
                            className={cn(
                                "p-2 m-1 rounded-lg transition-all duration-200 shrink-0",
                                input.trim() && !isStreaming
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200/50 hover:shadow-lg hover:shadow-emerald-200/70 active:scale-95"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-center mt-1.5 text-[10px] text-gray-400">
                        AI có thể mắc lỗi · Vui lòng kiểm tra thông tin quan trọng
                    </p>
                </div>
            </aside>

            {/* Panel-specific styles */}
            <style>{`
                /* Panel slide-in from bottom */
                @keyframes copilotPanelSlideIn {
                    from { transform: translateY(20px) scale(0.97); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                .copilot-panel-slidein {
                    animation: copilotPanelSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                /* Welcome screen fade */
                @keyframes copilotWelcomeFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .copilot-welcome-fadein {
                    animation: copilotWelcomeFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                /* Message fade in */
                @keyframes copilotMsgFadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .copilot-msg-fadein {
                    animation: copilotMsgFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                }

                /* Shimmer pill for tool progress */
                .copilot-shimmer-pill {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 7px 12px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 16px 16px 16px 6px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
                }
                .copilot-shimmer-pill::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(16, 185, 129, 0.06) 50%,
                        transparent 100%
                    );
                    animation: copilotShimmer 2s ease-in-out infinite;
                }
                @keyframes copilotShimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                /* Thinking dots */
                .copilot-thinking-dots {
                    display: flex;
                    gap: 3px;
                    align-items: center;
                }
                .copilot-thinking-dots span {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: #10b981;
                    opacity: 0.3;
                    animation: copilotDotPulse 1.4s ease-in-out infinite;
                }
                .copilot-thinking-dots span:nth-child(2) { animation-delay: 0.16s; }
                .copilot-thinking-dots span:nth-child(3) { animation-delay: 0.32s; }
                @keyframes copilotDotPulse {
                    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                    40% { opacity: 1; transform: scale(1.1); }
                }

                /* Custom scrollbar */
                .copilot-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .copilot-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .copilot-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 10px;
                }
                .copilot-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
        </>
    );
}

export default CopilotPanel;
