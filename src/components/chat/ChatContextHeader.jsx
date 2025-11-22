import React from 'react';
import { Briefcase, Unlock, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ChatContextHeader = ({ context }) => {
    if (!context) return null;

    const { type, title, data } = context;

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

        return (
            <div className="px-4 py-2 bg-muted/30 border-b">
                <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                        <span className="text-muted-foreground mr-1">Ứng viên ứng tuyển:</span>
                        <span className="font-medium">{title}</span>
                    </div>
                    <Badge variant="secondary" className={statusColors[data?.status] || ''}>
                        {statusLabels[data?.status] || data?.status}
                    </Badge>
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
