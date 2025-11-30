import React from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const ParticipantItem = ({ name, isLocal, isMuted, isCameraOff, isActiveSpeaker }) => {
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
        <div className="flex items-center justify-between p-3 hover:bg-gray-800/50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "relative rounded-full p-0.5",
                    isActiveSpeaker ? "bg-green-500" : "bg-transparent"
                )}>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="" /> {/* Add avatar URL support later */}
                        <AvatarFallback className="bg-gray-700 text-xs text-gray-300">
                            {getInitials(name)}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-200">
                        {name}
                        {isLocal && <span className="text-gray-500 ml-1">(Bạn)</span>}
                    </span>
                    <span className="text-xs text-gray-500">
                        {isActiveSpeaker ? 'Đang nói...' : isLocal ? 'Đang tham gia' : 'Khách mời'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
                {isMuted ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                ) : (
                    <Mic className="h-4 w-4" />
                )}
                {isCameraOff ? (
                    <VideoOff className="h-4 w-4 text-red-500" />
                ) : (
                    <Video className="h-4 w-4" />
                )}
            </div>
        </div>
    );
};

const ParticipantList = ({ participants, onClose }) => {
    return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800 w-80">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold">Người tham gia ({participants.length})</h3>
                {/* Close button if needed, or rely on parent toggle */}
            </div>

            <ScrollArea className="flex-1 p-2">
                <div className="space-y-1">
                    {participants.map((p) => (
                        <ParticipantItem
                            key={p.id}
                            name={p.name}
                            isLocal={p.isLocal}
                            isMuted={p.isMuted}
                            isCameraOff={p.isCameraOff}
                            isActiveSpeaker={p.isActiveSpeaker}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default ParticipantList;
