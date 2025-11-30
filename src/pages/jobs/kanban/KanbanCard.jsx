import React from 'react';

// Actually, the plan said "HTML5 Drag and Drop API ... to avoid adding new dependencies".
// So I will use native onDragStart, etc.

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    MessageCircle,
    Calendar,
    FileText,
    MoreHorizontal,
    Download,
    RefreshCcw,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as utils from '@/utils';

const KanbanCard = ({ application, onDragStart, onDragEnd, onClick, onAction }) => {
    const handleDragStart = (e) => {
        e.dataTransfer.setData('applicationId', application._id);
        e.dataTransfer.setData('sourceStatus', application.status);
        e.dataTransfer.effectAllowed = 'move';
        if (onDragStart) onDragStart(application);
    };

    const handleDragEnd = () => {
        if (onDragEnd) onDragEnd();
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`mb-3 cursor-grab active:cursor-grabbing touch-none`}
            onClick={() => onClick(application)}
        >
            <Card className={`hover:shadow-lg transition-all duration-200 border-gray-200/60 bg-white group`}>
                <CardContent className="p-2.5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border border-gray-100">
                                <AvatarImage src={application.candidateAvatar} alt={application.candidateName} />
                                <AvatarFallback className="bg-blue-50 text-blue-600 font-medium text-[10px]">{application.candidateName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors leading-tight">{application.candidateName}</h4>
                                    {application.isReapplied && (
                                        <RefreshCcw className="h-3 w-3 text-orange-500 shrink-0" title="Ứng tuyển lại" />
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-400 block mt-0.5">
                                    {utils.formatDate(application.appliedAt)}
                                </span>
                            </div>
                        </div>
                        {application.matchScore && (
                            <Badge variant="secondary" className={`text-[10px] px-1.5 h-4 font-semibold ${application.matchScore >= 80 ? 'bg-green-50 text-green-700 border-green-100' :
                                application.matchScore >= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-gray-50 text-gray-600 border-gray-100'
                                } border`}>
                                {application.matchScore}%
                            </Badge>
                        )}
                    </div>
                    {application.isReapplied && (
                        <div className="mt-1.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 h-4 text-orange-600 border-orange-300 bg-orange-50">
                                <RefreshCcw className="h-2.5 w-2.5 mr-1" />
                                Ứng tuyển lại
                            </Badge>
                        </div>
                    )}
                    {(application.status === 'OFFER_DECLINED' || application.isDeclineByCandidate) && (
                        <div className="mt-2">
                            <Badge variant="destructive" className="w-full justify-center bg-red-100 text-red-700 hover:bg-red-200 border-red-200 shadow-none">
                                Đã từ chối Offer
                            </Badge>
                        </div>
                    )}
                    {application.status === 'OFFER_SENT' && (
                        <div className="mt-2">
                            <Badge variant="outline" className="w-full justify-center bg-orange-50 text-orange-700 border-orange-200 shadow-none">
                                Chưa phản hồi Offer
                            </Badge>
                        </div>
                    )}

                    {application.notes && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded text-xs text-gray-600">
                            <div className="flex items-center gap-1 font-medium text-yellow-700 mb-1">
                                <FileText className="h-3 w-3" /> Ghi chú:
                            </div>
                            <p className="line-clamp-2">{application.notes}</p>
                        </div>
                    )}
                </CardContent>
                <div className="px-2 pb-2 pt-0 flex justify-between items-center">
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-blue-50 hover:text-blue-600"
                            title="Nhắn tin"
                            onClick={(e) => { e.stopPropagation(); onAction('message', application); }}
                        >
                            <MessageCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-blue-50 hover:text-blue-600"
                            title="Lên lịch phỏng vấn"
                            onClick={(e) => { e.stopPropagation(); onAction('schedule', application); }}
                        >
                            <Calendar className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-3.5 w-3.5 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAction('view_cv', application); }}>
                                <FileText className="mr-2 h-4 w-4" /> Xem CV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAction('download_cv', application); }}>
                                <Download className="mr-2 h-4 w-4" /> Tải CV
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </Card>
        </div>
    );
};

export default KanbanCard;
