import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Mic,
    Video,
    Chrome,
    Globe,
    Settings,
    Lock,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Camera
} from 'lucide-react';

/**
 * DevicePermissionGuide - Modal hướng dẫn user bật quyền camera & microphone
 * Hiển thị hướng dẫn chi tiết cho từng trình duyệt phổ biến
 */
const DevicePermissionGuide = ({ isOpen, onClose, onRetry }) => {
    // Detect browser
    const getBrowserInfo = () => {
        const userAgent = navigator.userAgent;

        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            return { name: 'Chrome', icon: Chrome };
        } else if (userAgent.includes('Firefox')) {
            return { name: 'Firefox', icon: Globe };
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            return { name: 'Safari', icon: Globe };
        } else if (userAgent.includes('Edg')) {
            return { name: 'Edge', icon: Globe };
        }
        return { name: 'Browser', icon: Globe };
    };

    const browser = getBrowserInfo();
    const BrowserIcon = browser.icon;

    // Browser-specific instructions
    const getInstructions = () => {
        switch (browser.name) {
            case 'Chrome':
                return {
                    steps: [
                        'Nhấp vào biểu tượng khóa 🔒 hoặc camera 🎥 bên trái thanh địa chỉ',
                        'Tìm mục "Camera" và "Microphone" trong danh sách',
                        'Bật công tắc hoặc chọn "Cho phép" (Allow) cho cả hai',
                        'Tải lại trang và thử lại'
                    ],
                    alternative: [
                        'Vào Chrome Settings (chrome://settings/content)',
                        'Tìm đến mục Camera và Microphone',
                        'Tìm website này trong danh sách "Đã chặn" (Blocked)',
                        'Nhấp vào biểu tượng thùng rác để xóa hoặc đổi sang "Cho phép"',
                        'Quay lại trang và thử lại'
                    ]
                };

            case 'Firefox':
                return {
                    steps: [
                        'Nhấp vào biểu tượng khóa 🔒 hoặc camera 🎥 bên trái thanh địa chỉ',
                        'Tìm mục "Permissions" (Quyền)',
                        'Xóa các mục chặn tạm thời (nếu có) bằng cách nhấn dấu X',
                        'Tải lại trang, khi được hỏi hãy chọn "Allow" (Cho phép)'
                    ],
                    alternative: [
                        'Vào Firefox Settings > Privacy & Security',
                        'Cuộn xuống phần "Permissions"',
                        'Kiểm tra cài đặt của Camera và Microphone',
                        'Nhấp "Settings..." và tìm website này, đổi thành "Allow"'
                    ]
                };

            case 'Safari':
                return {
                    steps: [
                        'Mở Safari > Settings (hoặc Preferences)',
                        'Chọn tab "Websites"',
                        'Kiểm tra mục "Camera" và "Microphone" ở sidebar trái',
                        'Tìm website này trong danh sách bên phải',
                        'Chọn "Allow" (Cho phép) từ menu thả xuống',
                        'Đóng Settings và tải lại trang'
                    ],
                    alternative: [
                        'Trên macOS: System Settings > Privacy & Security',
                        'Kiểm tra quyền Camera và Microphone',
                        'Đảm bảo trình duyệt Safari được cấp quyền',
                        'Quay lại Safari và thử lại'
                    ]
                };

            case 'Edge':
                return {
                    steps: [
                        'Nhấp vào biểu tượng khóa 🔒 bên trái thanh địa chỉ',
                        'Chọn "Permissions for this site"',
                        'Tìm "Camera" và "Microphone"',
                        'Chuyển cả hai sang trạng thái "Allow" (Cho phép)',
                        'Tải lại trang và thử lại'
                    ],
                    alternative: [
                        'Vào Edge Settings (edge://settings/content)',
                        'Kiểm tra cài đặt Camera và Microphone',
                        'Đảm bảo website không bị chặn',
                        'Di chuyển website sang danh sách "Allow" nếu cần'
                    ]
                };

            default:
                return {
                    steps: [
                        'Tìm biểu tượng khóa 🔒 hoặc cài đặt trang web trên thanh địa chỉ',
                        'Tìm cài đặt quyền Camera và Microphone',
                        'Thay đổi thành "Cho phép" (Allow)',
                        'Tải lại trang và thử lại'
                    ],
                    alternative: []
                };
        }
    };

    const instructions = getInstructions();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex gap-1">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <Video className="h-6 w-6 text-red-500" />
                            </div>
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Mic className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                        <DialogTitle className="text-xl">
                            Cách bật quyền truy cập Camera & Microphone
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        Để tham gia phỏng vấn video, bạn cần cho phép website truy cập cả camera và microphone.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Browser Detection */}
                    <Alert>
                        <BrowserIcon className="h-4 w-4" />
                        <AlertDescription>
                            Chúng tôi phát hiện bạn đang dùng <strong>{browser.name}</strong>.
                            Dưới đây là hướng dẫn chi tiết.
                        </AlertDescription>
                    </Alert>

                    {/* Main Instructions */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Settings className="h-4 w-4 text-primary" />
                            <span>Cách 1: Cài đặt nhanh từ thanh địa chỉ</span>
                        </div>

                        <ol className="space-y-3 ml-6">
                            {instructions.steps.map((step, index) => (
                                <li key={index} className="flex gap-3 text-sm">
                                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                                        {index + 1}
                                    </span>
                                    <span className="pt-0.5">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Alternative Method */}
                    {instructions.alternative.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Lock className="h-4 w-4 text-primary" />
                                <span>Cách 2: Từ cài đặt trình duyệt</span>
                            </div>

                            <ol className="space-y-3 ml-6">
                                {instructions.alternative.map((step, index) => (
                                    <li key={index} className="flex gap-3 text-sm">
                                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                                            {index + 1}
                                        </span>
                                        <span className="pt-0.5">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* Important Notes */}
                    <Alert variant="default" className="border-amber-200 bg-amber-50">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-900">
                            <strong>Lưu ý quan trọng:</strong>
                            <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                                <li>Chúng tôi chỉ sử dụng camera và microphone trong quá trình kiểm tra thiết bị và phỏng vấn</li>
                                <li>Bạn có thể tắt camera/microphone bất cứ lúc nào trong cuộc gọi</li>
                                <li>Nếu bạn đang sử dụng phần mềm khác chiếm dụng camera (như Zoom, Skype), hãy tắt chúng trước</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    {/* Success Tips */}
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-green-900">
                                    Sau khi bật quyền thành công:
                                </p>
                                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                                    <li>Nhấn nút "Thử lại" bên dưới hoặc tải lại trang</li>
                                    <li>Bạn sẽ thấy hình ảnh của mình trong khung preview</li>
                                    <li>Thanh âm thanh sẽ chuyển động khi bạn nói</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Troubleshooting */}
                    <details className="group">
                        <summary className="cursor-pointer text-sm font-semibold flex items-center gap-2 hover:text-primary transition-colors">
                            <AlertCircle className="h-4 w-4" />
                            <span>Vẫn không được? Xem thêm cách khắc phục</span>
                        </summary>
                        <div className="mt-3 ml-6 space-y-2 text-sm text-muted-foreground">
                            <p>• <strong>Kiểm tra hệ thống:</strong> Windows/macOS có thể chặn quyền truy cập của trình duyệt. Vào Settings {'>'} Privacy {'>'} Camera/Microphone để kiểm tra.</p>
                            <p>• <strong>Driver:</strong> Cập nhật driver webcam và âm thanh mới nhất.</p>
                            <p>• <strong>Thiết bị khác:</strong> Đảm bảo không có ứng dụng nào khác đang sử dụng camera.</p>
                            <p>• <strong>Kết nối lại:</strong> Thử rút và cắm lại webcam/microphone USB.</p>
                        </div>
                    </details>

                    {/* External Resources */}
                    <div className="pt-4 border-t">
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => window.open('https://support.google.com/chrome/answer/2693767', '_blank')}
                            >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Chrome Help
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => window.open('https://support.mozilla.org/kb/permissions-request-access-camera-microphone-location', '_blank')}
                            >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Firefox Support
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => window.open('https://support.apple.com/guide/safari/websites-ibrwe2159f50/mac', '_blank')}
                            >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Safari Guide
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1"
                    >
                        Đóng
                    </Button>
                    <Button
                        onClick={() => {
                            onClose();
                            if (onRetry) onRetry();
                        }}
                        className="flex-1 bg-primary text-white"
                    >
                        <Camera className="h-4 w-4 mr-2" />
                        Thử lại
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DevicePermissionGuide;
