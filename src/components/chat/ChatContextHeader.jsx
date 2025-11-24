import React from 'react';
import { Briefcase, Unlock, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

const ChatContextHeader = ({ context }) => {
    if (!context) return null;

    const { type, title, applications } = context;

    if (type === 'APPLICATION') {
        const statusColors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            REVIEWING: 'bg-blue-100 text-blue-800',
            SCHEDULED_INTERVIEW: 'bg-purple-100 text-purple-800',
            INTERVIEWED: 'bg-indigo-100 text-indigo-800',
            ACCEPTED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
        };

        const statusLabels = {
            PENDING: 'Đang chờ',
            REVIEWING: 'Đang xem xét',
            SCHEDULED_INTERVIEW: 'Phỏng vấn',
            INTERVIEWED: 'Đã phỏng vấn',
            ACCEPTED: 'Được nhận',
            REJECTED: 'Bị từ chối',
        };

        // If there are multiple applications, show a summary and a hover card
        if (applications && applications.length > 0) {
            const primaryApp = applications[0]; // Most recent or primary
            const otherAppsCount = applications.length - 1;

            return (
                <div className="px-4 py-2 bg-muted/30 border-b">
                    <div className="flex items-center gap-3 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 flex items-center gap-2">
                            <span className="text-muted-foreground">Ứng viên ứng tuyển:</span>

                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <button className="font-medium hover:underline flex items-center gap-1 cursor-pointer">
                                        {primaryApp.jobTitle}
                                        {otherAppsCount > 0 && (
                                            <span className="text-muted-foreground font-normal text-xs ml-1">
                                                (+{otherAppsCount} vị trí khác)
                                            </span>
                                        )}
                                        <ChevronDown className="h-3 w-3 opacity-50" />
                                    </button>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80 p-0 overflow-hidden" align="start">
                                    <div className="bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                                        Các vị trí đã ứng tuyển
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {applications.map((app) => (
                                            <div key={app.applicationId} className="p-3 border-b last:border-0 hover:bg-muted/20 transition-colors">
                                                <div className="font-medium text-sm mb-1">{app.jobTitle}</div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">
                                                        {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-5 ${statusColors[app.status] || ''}`}>
                                                        {statusLabels[app.status] || app.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        </div>

                        {/* Show status of primary application directly */}
                        <Badge variant="secondary" className={statusColors[primaryApp.status] || ''}>
                            {statusLabels[primaryApp.status] || primaryApp.status}
                        </Badge>
                    </div>
                </div>
            );
        }

        // Fallback
        return (
            <div className="px-4 py-2 bg-muted/30 border-b">
                <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                        <span className="text-muted-foreground mr-1">Ứng viên ứng tuyển:</span>
                        <span className="font-medium">{title}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'PROFILE_UNLOCK') {
        return (
            <div className="px-4 py-2 bg-muted/30 border-b">
                <div className="flex items-center gap-3 text-sm">
                    <Unlock className="h-4 w-4 text-amber-500" />
                    <div className="flex-1">
                        <span className="font-medium text-amber-700">
                            Bạn đã mở khóa hồ sơ này
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default ChatContextHeader;
