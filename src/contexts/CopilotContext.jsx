import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getAccessToken } from '@/utils/token';

const CopilotContext = createContext(null);

export function CopilotProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [toolProgress, setToolProgress] = useState(null);

    const abortControllerRef = useRef(null);

    // Helper method: get the current page or context route
    const getCurrentPage = () => {
        // Basic implementation for a React app - can be customized based on router hooks if needed
        const path = window.location.pathname;
        if (path.includes('/jobs/') && path.includes('/edit')) return 'job-edit';
        if (path.includes('/jobs/create')) return 'job-create';
        if (path.includes('/jobs/')) return 'job-detail';
        if (path.includes('/applications')) return 'applications';
        if (path.includes('/dashboard')) return 'dashboard';
        return 'unknown';
    };

    // ── Handle SSE events ──
    const handleSSEEvent = useCallback((event, data) => {
        switch (event) {
            case 'session':
                setActiveSessionId(data.sessionId);
                break;

            case 'text_delta':
                setMessages(prev => {
                    if (prev.length === 0) return prev;
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    updated[lastIndex] = {
                        ...updated[lastIndex],
                        content: updated[lastIndex].content + data.delta
                    };
                    return updated;
                });
                break;

            case 'structured_data':
                setMessages(prev => {
                    if (prev.length === 0) return prev;
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    const lastMsg = updated[lastIndex];
                    const list = [...(lastMsg.structuredDataList || [])];

                    // Upsert: replace if same type exists, append if new type
                    const existingIdx = list.findIndex(item => item.type === data.type);
                    if (existingIdx >= 0) {
                        list[existingIdx] = data;
                    } else {
                        list.push(data);
                    }

                    updated[lastIndex] = { ...lastMsg, structuredDataList: list };
                    return updated;
                });
                break;

            case 'action':
                // Lưu action để page component xử lý
                setPendingAction(data);
                break;

            case 'tool_progress':
                setToolProgress(data);
                break;

            case 'error':
                setMessages(prev => {
                    if (prev.length === 0) return prev;
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    updated[lastIndex] = {
                        ...updated[lastIndex],
                        content: `Lỗi: ${data.message || 'Có lỗi xảy ra'}`
                    };
                    return updated;
                });
                break;

            case 'done':
                // Do nothing specific on done
                break;

            default:
                console.warn('Unknown copilot event:', event, data);
                break;
        }
    }, []);

    // ── Core: Send message with SSE streaming ──
    const sendMessage = useCallback(async (message, context = {}) => {
        // Tạm bỏ dở controller cũ nếu đang stream
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Add user message to UI immediately (optimistic)
        const userMsg = { role: 'user', content: message, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setIsStreaming(true);

        // Prepare assistant message placeholder
        const assistantMsg = { role: 'assistant', content: '', structuredDataList: [], timestamp: new Date() };
        setMessages(prev => [...prev, assistantMsg]);

        try {
            abortControllerRef.current = new AbortController();

            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
            const response = await fetch(`${baseUrl}/api/copilot/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAccessToken()}`,
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    message,
                    sessionId: activeSessionId,
                    context: {
                        currentPage: getCurrentPage(),
                        currentUrl: window.location.pathname,
                        ...context
                    }
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                // Lưu lại phần cuối nếu chưa có \n (data chưa hoàn chỉnh)
                buffer = lines.pop() || '';

                let currentEvent = 'message';

                for (const line of lines) {
                    if (line.trim() === '') continue; // Skip empty lines between SSE

                    if (line.startsWith('event: ')) {
                        currentEvent = line.slice(7).trim();
                    } else if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6);
                        if (dataStr === '[DONE]') {
                            // handle done if standard SSE format is used
                            break;
                        }
                        try {
                            const data = JSON.parse(dataStr);
                            handleSSEEvent(currentEvent, data);
                        } catch (e) {
                            console.error('Failed to parse SSE JSON data:', dataStr, e);
                        }
                    }
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setMessages(prev => {
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    const last = updated[lastIndex];
                    if (last && last.role === 'assistant' && !last.content) {
                        updated[lastIndex] = {
                            ...last,
                            content: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại.'
                        };
                    }
                    return updated;
                });
            }
        } finally {
            setIsStreaming(false);
            setToolProgress(null);
            abortControllerRef.current = null;
        }
    }, [activeSessionId, handleSSEEvent]);

    // ── Action handlers (for form auto-fill, navigation) ──
    const applyAction = useCallback(() => {
        // pendingAction sẽ được consume bởi useCopilotAction hook ở page component
        // Sau khi apply xong, clear action
        setPendingAction(null);
    }, []);

    const dismissAction = useCallback(() => {
        setPendingAction(null);
    }, []);

    // ── Clear session (new conversation) ──
    const clearSession = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setMessages([]);
        setActiveSessionId(null);
        setPendingAction(null);
        setToolProgress(null);
        setIsStreaming(false);
    }, []);

    // ── Open copilot with trigger ──
    const openCopilot = useCallback((trigger = 'free_chat', context = {}) => {
        setIsOpen(true);
        if (trigger !== 'free_chat') {
            // Auto-send hidden message based on trigger
            const triggerMessages = {
                summarize_job: 'Hãy tóm tắt tin tuyển dụng này.'
            };
            const message = triggerMessages[trigger] || '';
            if (message) {
                sendMessage(message, { ...context, trigger });
            }
        }
    }, [sendMessage]);

    const value = {
        isOpen, setIsOpen,
        sessions, activeSessionId,
        messages, isStreaming,
        pendingAction, toolProgress,
        sendMessage, applyAction, dismissAction,
        openCopilot, closeCopilot: () => setIsOpen(false),
        clearSession
    };

    return (
        <CopilotContext.Provider value={value}>
            {children}
        </CopilotContext.Provider>
    );
}

export const useCopilot = () => useContext(CopilotContext);
