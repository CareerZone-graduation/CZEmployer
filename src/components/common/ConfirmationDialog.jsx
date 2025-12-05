import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Input } from '@/components/ui/input';
import { useState } from 'react';

const ConfirmationDialog = ({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'default', // 'default' | 'destructive'
    isLoading = false,
    showOfferInputs = false,
}) => {
    const [offerLetter, setOfferLetter] = useState('');
    const [offerFile, setOfferFile] = useState(null);

    const handleConfirm = () => {
        if (showOfferInputs) {
            onConfirm({ offerLetter, offerFile });
        } else {
            onConfirm();
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                {showOfferInputs && (
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="offerLetter">Thư mời (Offer Letter)</Label>
                            <Textarea
                                id="offerLetter"
                                placeholder="Nhập nội dung thư mời..."
                                value={offerLetter}
                                onChange={(e) => setOfferLetter(e.target.value)}
                                rows={5}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="offerFile">Đính kèm file (PDF, Image)</Label>
                            <Input
                                id="offerFile"
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) => setOfferFile(e.target.files[0])}
                            />
                        </div>
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleConfirm();
                        }}
                        disabled={isLoading}
                        className={variant === 'destructive' ? 'bg-red-600 text-white hover:bg-red-700' : ''}
                    >
                        {isLoading ? 'Đang xử lý...' : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfirmationDialog;
