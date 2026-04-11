import { useEffect, useCallback } from 'react';
import { useCopilot } from '@/contexts/CopilotContext';

/**
 * Hook cho page components lắng nghe action từ Copilot
 * và tự động apply vào form/UI
 * 
 * @param {string} targetForm - Tên form mà component quản lý (e.g., "job-create")
 * @param {Function} onApply - Callback nhận fields data để apply vào form
 */
export function useCopilotAction(targetForm, onApply) {
    const { pendingAction, applyAction, dismissAction } = useCopilot();

    useEffect(() => {
        if (!pendingAction) return;

        // Chỉ xử lý action dành cho form của mình
        if (pendingAction.type === 'apply_form_data' &&
            pendingAction.payload?.targetForm === targetForm) {
            // Có thể emit event hoặc thay đổi state liên quan đến UX tại đây nếu muốn
        }
    }, [pendingAction, targetForm]);

    const apply = useCallback(() => {
        if (pendingAction?.payload?.fields) {
            onApply(pendingAction.payload.fields);
            applyAction(); // reset pending action in context
        }
    }, [pendingAction, onApply, applyAction]);

    const dismiss = useCallback(() => {
        dismissAction(); // reset pending action in context
    }, [dismissAction]);

    return {
        hasPendingAction: pendingAction?.payload?.targetForm === targetForm,
        pendingFields: pendingAction?.payload?.fields || null,
        apply,
        dismiss
    };
}
