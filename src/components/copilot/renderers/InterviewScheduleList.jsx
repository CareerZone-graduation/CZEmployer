import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Briefcase } from 'lucide-react';

const statusConfig = {
    SCHEDULED: { label: 'Đã lên lịch', color: 'bg-sky-50 text-sky-600 border-sky-200' },
    STARTED: { label: 'Đang diễn ra', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    COMPLETED: { label: 'Hoàn thành', color: 'bg-teal-50 text-teal-600 border-teal-200' },
    ENDED: { label: 'Đã kết thúc', color: 'bg-gray-50 text-gray-500 border-gray-200' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-50 text-red-500 border-red-200' },
    NO_SHOW: { label: 'Vắng mặt', color: 'bg-amber-50 text-amber-600 border-amber-200' },
};

function formatDateTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
        hour: '2-digit', minute: '2-digit',
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
}

export function InterviewScheduleList({ interviews }) {
    const navigate = useNavigate();

    if (!interviews || interviews.length === 0) {
        return (
            <div className="text-sm text-gray-400 italic px-3 py-2.5 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                Không có lịch phỏng vấn nào.
            </div>
        );
    }

    return (
        <div className="space-y-2 w-full">
            {interviews.map((iv, index) => {
                const status = statusConfig[iv.status] || statusConfig.ENDED;
                const jobTitle = iv.jobId?.title || 'Không rõ vị trí';
                const candidateEmail = iv.candidateId?.email || '';

                return (
                    <div
                        key={iv._id}
                        className="group p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow hover:border-sky-200 transition-all duration-200 cursor-pointer"
                        style={{
                            animation: 'copilot-card-fadein 0.4s ease-out forwards',
                            opacity: 0,
                            animationDelay: `${index * 60}ms`,
                        }}
                        onClick={() => navigate(`/interviews/${iv._id}`)}
                    >
                        {/* Header: Job title + Status */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center shrink-0">
                                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                                </div>
                                <h4 className="font-medium text-sm text-gray-800 truncate" title={jobTitle}>
                                    {jobTitle}
                                </h4>
                            </div>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap border ${status.color}`}>
                                {status.label}
                            </span>
                        </div>

                        {/* Details */}
                        <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-sky-500" />
                                    <span>{formatDateTime(iv.scheduledTime)}</span>
                                </div>
                                {iv.duration && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                        <span>{iv.duration} phút</span>
                                    </div>
                                )}
                            </div>

                            {candidateEmail && (
                                <div className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-teal-500" />
                                    <span className="truncate" title={candidateEmail}>
                                        {candidateEmail}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            <style>{`
                @keyframes copilot-card-fadein {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
