import React, { useState } from 'react';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({
    status,
    title,
    applications,
    onDrop,
    onCardClick,
    onCardAction,
    onDragStart,
    onDragEnd,
    isDropDisabled,
    colorClass = "bg-gray-100"
}) => {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        if (isDropDisabled) {
            e.dataTransfer.dropEffect = 'none';
            return;
        }
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        if (isDropDisabled) return;
        setIsOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        // Only set to false if we are leaving the main container, not entering a child
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsOver(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsOver(false);
        if (isDropDisabled) return;

        const applicationId = e.dataTransfer.getData('applicationId');
        const sourceStatus = e.dataTransfer.getData('sourceStatus');

        if (sourceStatus !== status) {
            onDrop(applicationId, status);
        }
    };

    return (
        <div className={`flex flex-col w-[320px] min-w-[320px] shrink-0 h-full rounded-xl ${colorClass} bg-opacity-30 border border-gray-200/60 transition-all duration-200 ${isDropDisabled ? 'opacity-50 grayscale' : ''}`}>
            {/* Header */}
            <div className={`p-3 flex items-center justify-between rounded-t-xl ${colorClass} bg-opacity-70 backdrop-blur-sm sticky top-0 z-10`}>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colorClass.replace('bg-', 'bg-slate-900 ')} opacity-60`}></div>
                    <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{title}</h3>
                </div>
                <span className="bg-white/50 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {applications.length}
                </span>
            </div>

            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                className={`flex-1 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent transition-colors duration-200 ${isOver ? 'bg-blue-50/50 ring-2 ring-blue-200 ring-inset' : ''
                    }`}
            >
                {applications.length === 0 ? (
                    <div className="h-24 border-2 border-dashed border-gray-300/50 rounded-lg flex items-center justify-center text-gray-400 text-xs bg-white/30">
                        Kéo thả ứng viên vào đây
                    </div>
                ) : (
                    applications.map((app) => (
                        <KanbanCard
                            key={app._id}
                            application={app}
                            onClick={onCardClick}
                            onAction={onCardAction}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
