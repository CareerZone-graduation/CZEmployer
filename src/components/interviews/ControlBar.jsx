import React, { useState, useEffect } from 'react';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    MonitorUp,
    MessageSquare,
    Users,
    MoreVertical,
    Info,
    Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const ControlButton = React.forwardRef(({
    icon: Icon,
    label,
    onClick,
    isActive,
    variant = 'default', // 'default' | 'danger' | 'secondary' | 'ghost'
    className,
    ...props
}, ref) => {
    let baseStyles = "rounded-full w-10 h-10 transition-all duration-200 flex items-center justify-center";
    let variantStyles = "";

    if (variant === 'danger') {
        variantStyles = "bg-red-600 hover:bg-red-700 text-white w-14 rounded-3xl"; // Pill shape for end call
    } else if (variant === 'ghost') {
        variantStyles = "text-white hover:bg-white/10 bg-transparent";
    } else if (isActive) {
        // Active state (e.g., Mic On) - Dark grey circle
        variantStyles = "bg-[#3c4043] hover:bg-[#474a4d] text-white border border-transparent";
    } else {
        // Inactive state (e.g., Mic Off) - Red circle
        variantStyles = "bg-red-500 hover:bg-red-600 text-white border-none";
    }

    // Special case for toggle buttons like Chat/Participants
    if (variant === 'secondary') {
        variantStyles = isActive
            ? "text-blue-300 bg-blue-500/20 hover:bg-blue-500/30"
            : "text-white hover:bg-white/10 bg-transparent";
        baseStyles = "rounded-full w-10 h-10 transition-all duration-200 flex items-center justify-center";
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        ref={ref}
                        variant="ghost"
                        size="icon"
                        onClick={onClick}
                        className={cn(baseStyles, variantStyles, className)}
                        {...props}
                    >
                        <Icon className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-800 text-white border-gray-700 text-xs">
                    <p>{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
});

const ControlBar = ({
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    isChatOpen,
    isParticipantsOpen,
    onToggleAudio,
    onToggleVideo,
    onToggleScreenShare,
    onToggleChat,
    onToggleParticipants,
    onEndCall,
    onSendEmoji,
    className,
    children,
    interviewTitle,
    interviewId
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const emojis = ['👍', '👏', '❤️', '😂', '😮', '😢', '🎉'];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={cn(
            "flex items-center justify-between px-4 py-3 bg-[#202124] text-white h-[80px]",
            className
        )}>
            {/* Left: Time | Meeting Code | Title */}
            <div className="flex items-center gap-4 min-w-[200px]">
                <span className="text-base font-medium tracking-wide">
                    {format(currentTime, 'HH:mm')}
                </span>
                <div className="h-4 w-px bg-gray-600" />
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-white truncate max-w-[200px]">
                        {interviewTitle || 'Phỏng vấn'}
                    </span>
                    <span className="text-xs text-gray-400 truncate max-w-[200px]">
                        {interviewId || 'zca-svda-nre'}
                    </span>
                </div>
            </div>

            {/* Center: Main Controls */}
            <div className="flex items-center gap-3">
                <ControlButton
                    icon={isAudioEnabled ? Mic : MicOff}
                    label={isAudioEnabled ? "Tắt micro" : "Bật micro"}
                    isActive={isAudioEnabled}
                    onClick={onToggleAudio}
                />

                <ControlButton
                    icon={isVideoEnabled ? Video : VideoOff}
                    label={isVideoEnabled ? "Tắt camera" : "Bật camera"}
                    isActive={isVideoEnabled}
                    onClick={onToggleVideo}
                />

                <Popover>
                    <PopoverTrigger asChild>
                        <div>
                            <ControlButton
                                icon={Smile}
                                label="Cảm xúc"
                                isActive={true}
                                variant="secondary"
                                className="hidden md:flex"
                            />
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 bg-[#202124] border-gray-700" sideOffset={10}>
                        <div className="flex gap-2">
                            {emojis.map(emoji => (
                                <button
                                    key={emoji}
                                    className="text-2xl hover:bg-white/10 p-2 rounded transition-colors cursor-pointer"
                                    onClick={() => onSendEmoji && onSendEmoji(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                <ControlButton
                    icon={MonitorUp}
                    label={isScreenSharing ? "Dừng chia sẻ" : "Chia sẻ màn hình"}
                    isActive={!isScreenSharing}
                    variant="secondary"
                    onClick={onToggleScreenShare}
                    className={cn(isScreenSharing && "bg-blue-500/20 text-blue-300")}
                />

                <ControlButton
                    icon={MoreVertical}
                    label="Tùy chọn khác"
                    isActive={true}
                    variant="secondary"
                    onClick={() => { }}
                />

                <ControlButton
                    icon={PhoneOff}
                    label="Kết thúc"
                    variant="danger"
                    onClick={onEndCall}
                />
            </div>

            {/* Right: Side Panel Toggles */}
            <div className="flex items-center gap-2 min-w-[200px] justify-end">
                {children} {/* For Recording Controls etc */}

                <ControlButton
                    icon={Info}
                    label="Chi tiết cuộc họp"
                    isActive={false}
                    variant="secondary"
                    onClick={() => { }}
                />

                {onToggleParticipants && (
                    <ControlButton
                        icon={Users}
                        label="Mọi người"
                        isActive={isParticipantsOpen}
                        variant="secondary"
                        onClick={onToggleParticipants}
                    />
                )}

                <ControlButton
                    icon={MessageSquare}
                    label="Trò chuyện"
                    isActive={isChatOpen}
                    variant="secondary"
                    onClick={onToggleChat}
                />
            </div>
        </div>
    );
};

export default ControlBar;
