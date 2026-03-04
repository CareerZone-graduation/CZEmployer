import React from 'react';
import { User, CheckCircle2, AlertCircle } from 'lucide-react';

export function CandidateComparison({ data }) {
    if (!data || !data.candidates || data.candidates.length === 0) return null;

    return (
        <div className="w-full border rounded-xl overflow-hidden bg-white shadow-sm text-sm">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b">
                <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" />
                    So sánh ứng viên
                </h4>
                {data.recommendation && (
                    <p className="text-xs text-blue-700 mt-1 italic">{data.recommendation}</p>
                )}
            </div>

            <div className="p-0">
                <div className="flex overflow-x-auto snap-x hidden-scrollbar">
                    {data.candidates.map((candidate, idx) => (
                        <div
                            key={candidate.applicationId}
                            className={`flex-none w-[200px] p-3 snap-start ${idx > 0 ? 'border-l' : ''}`}
                        >
                            <div className="flex flex-col items-center text-center mb-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2 overflow-hidden">
                                    {candidate.avatar ? (
                                        <img src={candidate.avatar} alt={candidate.candidateName} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-blue-600" />
                                    )}
                                </div>
                                <div className="font-medium truncate w-full" title={candidate.candidateName}>
                                    {candidate.candidateName}
                                </div>

                                <div className="mt-1 inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                                    Mức độ phù hợp: {candidate.overallScore}%
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Scores */}
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Kỹ năng:</span>
                                        <span className="font-medium">{candidate.skillMatch}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Kinh nghiệm:</span>
                                        <span className="font-medium">{candidate.experienceMatch}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                                        <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${candidate.overallScore}%` }}></div>
                                    </div>
                                </div>

                                {/* Highlights */}
                                {candidate.highlights && (
                                    <div className="bg-blue-50/50 p-2 rounded text-xs text-gray-700 border border-blue-100 italic">
                                        {candidate.highlights}
                                    </div>
                                )}

                                {/* Strengths */}
                                {candidate.strengths && candidate.strengths.length > 0 && (
                                    <div>
                                        <div className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-green-600" /> Điểm mạnh
                                        </div>
                                        <ul className="text-[11px] text-gray-600 space-y-1 pl-4 list-disc">
                                            {candidate.strengths.slice(0, 3).map((s, i) => (
                                                <li key={i}>{s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Weaknesses */}
                                {candidate.weaknesses && candidate.weaknesses.length > 0 && (
                                    <div>
                                        <div className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3 text-amber-500" /> Điểm cần lưu ý
                                        </div>
                                        <ul className="text-[11px] text-gray-600 space-y-1 pl-4 list-disc">
                                            {candidate.weaknesses.slice(0, 2).map((w, i) => (
                                                <li key={i}>{w}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Sparkles local icon fallback
function SparklesIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
    );
}
