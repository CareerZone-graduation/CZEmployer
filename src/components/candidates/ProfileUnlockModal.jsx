import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Coins, Lock, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { unlockProfile } from '@/services/chatService';
import { updateCoinBalance } from '@/redux/authSlice';

const PROFILE_UNLOCK_COST = 50;

/**
 * ProfileUnlockModal Component
 * Modal for unlocking candidate profiles to enable messaging
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 * @param {string} props.candidateId - Candidate user ID
 * @param {string} props.candidateName - Candidate full name
 * @param {Function} props.onUnlockSuccess - Callback when unlock is successful
 */
const ProfileUnlockModal = ({ 
  isOpen, 
  onClose, 
  candidateId, 
  candidateName,
  onUnlockSuccess 
}) => {
  const dispatch = useDispatch();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState(null);

  // Get current user's credit balance from Redux store
  const currentBalance = useSelector((state) => 
    state.auth.user?.user?.coinBalance || 0
  );

  const hasInsufficientCredits = currentBalance < PROFILE_UNLOCK_COST;

  const handleUnlock = async () => {
    if (hasInsufficientCredits) {
      return;
    }

    setIsUnlocking(true);
    setError(null);

    try {
      const response = await unlockProfile(candidateId);
      
      // Update credit balance in Redux store
      if (response.updatedBalance !== undefined) {
        dispatch(updateCoinBalance(response.updatedBalance));
      }

      // Call success callback
      if (onUnlockSuccess) {
        onUnlockSuccess();
      }

      // Close modal
      onClose();
    } catch (err) {
      console.error('Error unlocking profile:', err);
      setError(err.message || 'Có lỗi xảy ra khi mở khóa hồ sơ');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleClose = () => {
    if (!isUnlocking) {
      setError(null);
      onClose();
    }
  };

  const handleGoToBilling = () => {
    // Navigate to billing page
    window.location.href = '/billing';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Mở khóa hồ sơ ứng viên
          </DialogTitle>
          <DialogDescription>
            Mở khóa hồ sơ để xem thông tin chi tiết và nhắn tin với ứng viên
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Candidate Info */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground mb-1">Ứng viên</p>
            <p className="font-semibold">{candidateName}</p>
          </div>

          {/* Cost and Balance Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Chi phí mở khóa</span>
              <div className="flex items-center gap-1 font-semibold">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span>{PROFILE_UNLOCK_COST} credits</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Số dư hiện tại</span>
              <div className="flex items-center gap-1 font-semibold">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className={hasInsufficientCredits ? 'text-destructive' : ''}>
                  {currentBalance} credits
                </span>
              </div>
            </div>

            {!hasInsufficientCredits && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Số dư sau khi mở khóa</span>
                <div className="flex items-center gap-1 font-semibold text-primary">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span>{currentBalance - PROFILE_UNLOCK_COST} credits</span>
                </div>
              </div>
            )}
          </div>

          {/* Insufficient Credits Warning */}
          {hasInsufficientCredits && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bạn không đủ credits để mở khóa hồ sơ này. Vui lòng nạp thêm credits để tiếp tục.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUnlocking}
          >
            Hủy
          </Button>

          {hasInsufficientCredits ? (
            <Button onClick={handleGoToBilling}>
              Nạp credits
            </Button>
          ) : (
            <Button
              onClick={handleUnlock}
              disabled={isUnlocking}
            >
              {isUnlocking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Xác nhận mở khóa
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileUnlockModal;
