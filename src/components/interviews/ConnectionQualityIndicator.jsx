import { Wifi, WifiOff, AlertTriangle, Signal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const ConnectionQualityIndicator = ({ quality = 'good', details = null }) => {
  const getQualityConfig = () => {
    switch (quality) {
      case 'excellent':
        return {
          icon: Wifi,
          label: 'Kết nối xuất sắc',
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500',
          description: 'Chất lượng kết nối rất tốt'
        };
      case 'good':
        return {
          icon: Wifi,
          label: 'Kết nối tốt',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500',
          description: 'Chất lượng kết nối ổn định'
        };
      case 'fair':
        return {
          icon: AlertTriangle,
          label: 'Kết nối trung bình',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500',
          description: 'Chất lượng kết nối có thể bị gián đoạn'
        };
      case 'poor':
        return {
          icon: WifiOff,
          label: 'Kết nối kém',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500',
          description: 'Chất lượng kết nối không ổn định. Hãy kiểm tra mạng của bạn.'
        };
      default:
        return {
          icon: Signal,
          label: 'Đang kiểm tra...',
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500',
          description: 'Đang kiểm tra chất lượng kết nối'
        };
    }
  };

  const config = getQualityConfig();
  const Icon = config.icon;

  const renderDetails = () => {
    if (!details) return null;

    return (
      <div className="space-y-1 text-xs">
        {details.latency && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Độ trễ:</span>
            <span className="font-medium">{details.latency} ms</span>
          </div>
        )}
        {details.fps && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">FPS:</span>
            <span className="font-medium">{details.fps}</span>
          </div>
        )}
        {details.resolution && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Độ phân giải:</span>
            <span className="font-medium">{details.resolution}</span>
          </div>
        )}
        {details.videoBitrate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Video bitrate:</span>
            <span className="font-medium">{details.videoBitrate} kbps</span>
          </div>
        )}
        {details.videoPacketLoss && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mất gói (video):</span>
            <span className="font-medium">{details.videoPacketLoss}%</span>
          </div>
        )}
        {details.audioPacketLoss && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mất gói (audio):</span>
            <span className="font-medium">{details.audioPacketLoss}%</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'flex items-center gap-2 cursor-help',
              config.color,
              config.bgColor,
              config.borderColor
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs font-medium">{config.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="w-64">
          <div className="space-y-2">
            <p className="text-sm font-medium">{config.description}</p>
            {renderDetails()}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionQualityIndicator;
