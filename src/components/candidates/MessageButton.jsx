import { useState, useEffect } from 'react';
import { MessageCircle, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { checkMessagingAccess } from '@/services/chatService';
import ProfileUnlockModal from './ProfileUnlockModal';

/**
 * MessageButton Component
 * Displays a message button on candidate profile with access control
 * 
 * @param {Object} props
 * @param {string} props.candidateId - Candidate user ID
 * @param {string} props.candidateName - Candidate full name
 * @param {Function} props.onMessageClick - Callback when message button is clicked (with access)
 */
const MessageButton = ({ candidateId, candidateName, onMessageClick, disabledIfLocked = false, jobId }) => {
  const [accessStatus, setAccessStatus] = useState(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!candidateId) return;

      setIsCheckingAccess(true);
      try {
        const response = await checkMessagingAccess(candidateId, jobId);
        setAccessStatus(response);
      } catch (error) {
        console.error('Error checking messaging access:', error);
        toast.error('Không thể kiểm tra quyền nhắn tin');
        // Set default no access on error
        setAccessStatus({ canMessage: false, reason: 'ERROR' });
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkAccess();
  }, [candidateId, jobId]);

  const handleButtonClick = () => {
    if (!accessStatus) return;

    if (accessStatus.canMessage) {
      // User has access, open chat interface
      if (onMessageClick) {
        onMessageClick();
      }
    } else {
      // User doesn't have access, show unlock modal
      setShowUnlockModal(true);
    }
  };

  const handleUnlockSuccess = () => {
    // Refresh access status after successful unlock
    setAccessStatus({ canMessage: true, reason: 'PROFILE_UNLOCKED' });
    setShowUnlockModal(false);
    toast.success('Đã mở khóa hồ sơ thành công!');

    // Open chat interface after unlock
    if (onMessageClick) {
      onMessageClick();
    }
  };

  // Loading state
  if (isCheckingAccess) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Đang kiểm tra...
      </Button>
    );
  }

  const canMessage = accessStatus?.canMessage || false;
  const isButtonDisabled = !accessStatus || (disabledIfLocked && !canMessage);

  return (
    <>
      <Button
        variant={canMessage ? "default" : "outline"}
        size="sm"
        onClick={handleButtonClick}
        disabled={isButtonDisabled}
        className={!canMessage ? "opacity-60" : ""}
      >
        {canMessage ? (
          <>
            <MessageCircle className="h-4 w-4 mr-2" />
            Nhắn tin
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            {isButtonDisabled ? 'Chưa mở khóa' : 'Mở khóa để nhắn tin'}
          </>
        )}
      </Button>

      {/* Profile Unlock Modal */}
      {!disabledIfLocked && (
        <ProfileUnlockModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          candidateId={candidateId}
          candidateName={candidateName}
          onUnlockSuccess={handleUnlockSuccess}
          jobId={jobId}
        />
      )}
    </>
  );
};

export default MessageButton;
