import React, { useEffect, useRef } from 'react';
import { MicOff, VideoOff, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ConnectionQualityIndicator from './ConnectionQualityIndicator';

const VideoFrame = ({
    stream,
    isMuted,
    isCameraOff,
    userName,
    isLocal,
    isActiveSpeaker,
    connectionQuality,
    className,
    avatarUrl
}) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            // Ensure video plays
            videoRef.current.play().catch(e => console.error('Video play failed:', e));
        } else if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [stream, isCameraOff]);

    // Get initials for avatar fallback
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl bg-zinc-900/50 border transition-all duration-300 shadow-lg aspect-[4/3]',
                isActiveSpeaker ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.15)]' : 'border-white/5',
                className
            )}
        >
            {/* Video Element */}
            {!isCameraOff && stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal} // Always mute local video to prevent echo
                    className={cn(
                        'w-full h-full object-cover',
                        isLocal && 'scale-x-[-1]' // Mirror local video
                    )}
                />
            ) : (
                /* Fallback UI when camera is off */
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 backdrop-blur-sm">
                    <Avatar className="h-28 w-28 border-4 border-white/5 shadow-xl">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {getInitials(userName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="mt-6 flex items-center gap-2 text-zinc-400 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
                        <VideoOff className="h-4 w-4" />
                        <span className="text-sm font-medium">Camera đang tắt</span>
                    </div>
                </div>
            )}

            {/* Overlays */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                {/* Top Right: Status Icons */}
                <div className="flex justify-end gap-2">
                    {isMuted && (
                        <div className="bg-red-600/90 p-1.5 rounded-full text-white backdrop-blur-sm shadow-sm">
                            <MicOff className="h-4 w-4" />
                        </div>
                    )}
                    {connectionQuality && (
                        <div className="bg-black/40 p-1.5 rounded-full backdrop-blur-sm">
                            <ConnectionQualityIndicator quality={connectionQuality} showLabel={false} />
                        </div>
                    )}
                </div>

                {/* Bottom Left: Name Label */}
                <div className="flex justify-start">
                    <div className="bg-black/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
                        <span className="truncate max-w-[200px]">{userName || 'Người tham gia'}</span>
                        {isLocal && <span className="text-gray-300 text-xs font-normal">(Bạn)</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoFrame;
