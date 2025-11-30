import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import KanbanColumn from './KanbanColumn';
import * as applicationService from '@/services/applicationService';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

const COLUMNS = [
    { id: 'PENDING', title: 'Tiếp nhận', color: 'bg-yellow-100' },
    { id: 'SUITABLE', title: 'Phù hợp', color: 'bg-blue-100' },
    { id: 'SCHEDULED_INTERVIEW', title: 'Hẹn phỏng vấn', color: 'bg-cyan-100' },
    { id: 'OFFER_SENT', title: 'Gửi đề nghị', color: 'bg-purple-100' },
    { id: 'ACCEPTED', title: 'Nhận việc', color: 'bg-green-100' },
    { id: 'REJECTED', title: 'Từ chối', color: 'bg-red-100' },
];

const VALID_TRANSITIONS = {
    'PENDING': ['SUITABLE', 'REJECTED'],
    'SUITABLE': ['SCHEDULED_INTERVIEW', 'OFFER_SENT'],
    'SCHEDULED_INTERVIEW': ['OFFER_SENT'],
    'OFFER_SENT': [],
    'ACCEPTED': [],
    'REJECTED': [],
    'OFFER_DECLINED': []
};

const KanbanBoard = ({
    applications,
    onStatusChange,
    onCardClick,
    onCardAction,
    onScheduleInterview,
    isLoading
}) => {
    const [columns, setColumns] = useState({});
    const [draggingStatus, setDraggingStatus] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState({
        open: false,
        applicationId: null,
        newStatus: null,
        oldStatus: null
    });

    // Group applications by status
    useEffect(() => {
        const grouped = COLUMNS.reduce((acc, col) => {
            if (col.id === 'OFFER_SENT') {
                acc[col.id] = applications.filter(app => app.status === 'OFFER_SENT' || app.status === 'OFFER_DECLINED');
            } else {
                acc[col.id] = applications.filter(app => app.status === col.id);
            }
            return acc;
        }, {});

        // Handle applications with statuses not in COLUMNS (fallback)
        const knownStatuses = COLUMNS.map(c => c.id);
        const others = applications.filter(app => !knownStatuses.includes(app.status));
        if (others.length > 0) {
            console.warn('Found applications with unknown statuses:', others);
        }

        setColumns(grouped);
    }, [applications]);

    const handleDragStart = (application) => {
        setDraggingStatus(application.status);
    };

    const handleDragEnd = () => {
        setDraggingStatus(null);
    };

    const executeStatusChange = async (applicationId, newStatus, oldStatus) => {
        // Intercept SCHEDULED_INTERVIEW
        if (newStatus === 'SCHEDULED_INTERVIEW') {
            const appToMove = applications.find(app => app._id === applicationId);
            if (onScheduleInterview) {
                onScheduleInterview(appToMove);
            } else {
                toast.error("Chức năng lên lịch phỏng vấn chưa được cấu hình");
            }
            return;
        }

        // Optimistic update
        onStatusChange(applicationId, newStatus);

        try {
            await applicationService.updateApplicationStatus(applicationId, newStatus);
            toast.success(`Đã chuyển sang trạng thái ${COLUMNS.find(c => c.id === newStatus)?.title}`);
        } catch (error) {
            // Revert on failure
            onStatusChange(applicationId, oldStatus);
            toast.error('Không thể cập nhật trạng thái');
            console.error(error);
        } finally {
            setConfirmConfig(prev => ({ ...prev, open: false }));
        }
    };

    const handleDrop = async (applicationId, newStatus) => {
        setDraggingStatus(null); // Reset dragging state
        const appToMove = applications.find(app => app._id === applicationId);
        if (!appToMove) return;

        const oldStatus = appToMove.status;

        if (oldStatus === newStatus) return;

        // Check valid transition
        const allowed = VALID_TRANSITIONS[oldStatus] || [];
        if (!allowed.includes(newStatus)) {
            // This should ideally be prevented by UI, but double check here
            const getStatusName = (s) => COLUMNS.find(c => c.id === s)?.title || s;
            toast.error(`Không thể chuyển từ "${getStatusName(oldStatus)}" sang "${getStatusName(newStatus)}"`);
            return;
        }

        // Confirmation for final/semi-final states
        if (['REJECTED', 'OFFER_SENT'].includes(newStatus)) {
            setConfirmConfig({
                open: true,
                applicationId,
                newStatus,
                oldStatus
            });
            return;
        }

        executeStatusChange(applicationId, newStatus, oldStatus);
    };

    if (isLoading) {
        return <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="min-w-[280px] w-[280px] shrink-0 bg-gray-100 animate-pulse rounded-lg h-full"></div>
            ))}
        </div>;
    }

    const allowedTransitions = draggingStatus ? VALID_TRANSITIONS[draggingStatus] : [];

    return (
        <div className="w-full flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-180px)] items-start">
            {COLUMNS.map((col) => {
                const isDropDisabled = draggingStatus && !allowedTransitions.includes(col.id) && col.id !== draggingStatus;

                return (
                    <KanbanColumn
                        key={col.id}
                        status={col.id}
                        title={col.title}
                        colorClass={col.color}
                        applications={columns[col.id] || []}
                        onDrop={handleDrop}
                        onCardClick={onCardClick}
                        onCardAction={onCardAction}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isDropDisabled={isDropDisabled}
                    />
                );
            })}
            <ConfirmationDialog
                open={confirmConfig.open}
                onOpenChange={(open) => setConfirmConfig(prev => ({ ...prev, open }))}
                title={confirmConfig.newStatus === 'REJECTED' ? 'Từ chối ứng viên?' : 'Gửi đề nghị (Offer)?'}
                description={confirmConfig.newStatus === 'REJECTED'
                    ? 'Bạn có chắc chắn muốn từ chối ứng viên này? Hành động này sẽ gửi email thông báo cho ứng viên và không thể hoàn tác.'
                    : 'Bạn có chắc chắn muốn gửi đề nghị làm việc cho ứng viên này?'}
                onConfirm={() => executeStatusChange(confirmConfig.applicationId, confirmConfig.newStatus, confirmConfig.oldStatus)}
                confirmText={confirmConfig.newStatus === 'REJECTED' ? 'Từ chối' : 'Gửi Offer'}
                cancelText="Hủy bỏ"
                variant={confirmConfig.newStatus === 'REJECTED' ? 'destructive' : 'default'}
            />
        </div>
    );
};

export default KanbanBoard;
