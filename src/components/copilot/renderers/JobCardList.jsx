import React, { useEffect, useRef } from 'react';
import { MapPin, DollarSign, TrendingUp, Clock } from 'lucide-react';

function formatDeadline(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

export function JobCardList({ jobs }) {
    const prevCountRef = useRef(0);

    useEffect(() => {
        prevCountRef.current = jobs?.length || 0;
    }, [jobs]);

    if (!jobs || jobs.length === 0) {
        return (
            <div className="text-sm text-gray-400 italic px-3 py-2.5 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                Không tìm thấy việc làm phù hợp.
            </div>
        );
    }

    return (
        <div className="space-y-2 w-full">
            {jobs.map((job, index) => {
                const isNew = index >= prevCountRef.current;
                return (
                    <div
                        key={job._id}
                        className="group p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow hover:border-emerald-200 transition-all duration-200 cursor-pointer"
                        style={{
                            animation: isNew ? 'copilot-card-fadein 0.4s ease-out forwards' : 'none',
                            opacity: isNew ? 0 : 1,
                            animationDelay: isNew ? `${index * 60}ms` : '0ms',
                        }}
                    >
                        <div className="flex gap-2.5">
                            {job.logo && (
                                <div className="w-10 h-10 rounded-lg border border-gray-100 flex items-center justify-center bg-gray-50 shrink-0 overflow-hidden">
                                    <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-800 truncate group-hover:text-emerald-600 transition-colors" title={job.title}>
                                    {job.title}
                                </h4>
                                <p className="text-xs text-gray-500 truncate mb-1.5">{job.company}</p>

                                <div className="flex flex-wrap gap-1.5 text-xs">
                                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md">
                                        <DollarSign className="w-3 h-3" />
                                        <span className="font-medium">{job.minSalary} - {job.maxSalary}</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded-md">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate max-w-[80px]">{job.province}</span>
                                    </div>
                                    {job.deadline && (
                                        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md" title="Hạn ứng tuyển">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatDeadline(job.deadline)}</span>
                                        </div>
                                    )}
                                </div>

                                {job.matchScore > 0 && (
                                    <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center gap-1.5">
                                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                                                style={{ width: `${job.matchScore}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium whitespace-nowrap">
                                            <TrendingUp className="w-2.5 h-2.5" />
                                            {job.matchScore}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            <style>{`
                @keyframes copilot-card-fadein {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
