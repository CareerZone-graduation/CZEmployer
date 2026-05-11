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
import { useQuery } from '@tanstack/react-query';
import * as emailTemplateService from '@/services/emailTemplateService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    templateVariables = {},
}) => {
    const [offerLetter, setOfferLetter] = useState('');
    const [offerFile, setOfferFile] = useState(null);

    // Fetch email templates
    const { data: templatesRes, isLoading: isLoadingTemplates } = useQuery({
        queryKey: ['emailTemplates'],
        queryFn: emailTemplateService.getTemplates,
        enabled: showOfferInputs && open,
    });
    
    const templates = templatesRes?.data || [];

    const handleConfirm = () => {
        if (showOfferInputs) {
            onConfirm({ offerLetter, offerFile });
        } else {
            onConfirm();
        }
    };

    const handleTemplateSelect = (templateId) => {
        const template = templates.find(t => t._id === templateId);
        if (template) {
            let text = template.body || '';
            // Replace template variables
            if (templateVariables.candidateName) {
                text = text.replace(/\{\{candidateName\}\}/g, templateVariables.candidateName);
            }
            if (templateVariables.jobTitle) {
                text = text.replace(/\{\{jobTitle\}\}/g, templateVariables.jobTitle);
            }
            if (templateVariables.companyName) {
                text = text.replace(/\{\{companyName\}\}/g, templateVariables.companyName);
            }
            setOfferLetter(text);
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
                            <Label>Chọn mẫu email (tùy chọn)</Label>
                            <Select onValueChange={handleTemplateSelect} disabled={isLoadingTemplates}>
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingTemplates ? "Đang tải..." : "Chọn mẫu email..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => (
                                        <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
