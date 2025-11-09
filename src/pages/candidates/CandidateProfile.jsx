import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ErrorState from '@/components/common/ErrorState';
import MessageButton from '@/components/candidates/MessageButton';
import { ChatInterface } from '@/components/chat';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Lock,
  Unlock,
  DollarSign,
  Download,
  Loader2
} from 'lucide-react';
import * as candidateService from '@/services/candidateService';
import { unlockProfile } from '@/services/chatService';
import * as utils from '@/utils';

const CandidateProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  console.log('CandidateProfile component mounted, userId:', userId);

  const fetchCandidateProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await candidateService.getCandidateProfile(userId);
      console.log('Profile response:', response);
      setProfile(response.data);
    } catch (err) {
      console.error('Error fetching candidate profile:', err);
      console.error('Error details:', err.response);
      const errorMessage = err.response?.data?.message || 'Không thể tải hồ sơ ứng viên.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCandidateProfile();
    }
  }, [userId, fetchCandidateProfile]);

  // Load PDF when profile is loaded
  useEffect(() => {
    const loadPdf = async () => {
      if (!profile || !profile.cvs || profile.cvs.length === 0 || pdfUrl) return;

      const cv = profile.cvs[0]; // Get the selected CV
      setIsLoadingPdf(true);
      try {
        const response = await candidateService.getCandidateCv(userId, cv._id);
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error('Error loading CV:', err);
        toast.error('Không thể tải CV');
      } finally {
        setIsLoadingPdf(false);
      }
    };

    loadPdf();
  }, [profile, userId, pdfUrl]);

  const handleUnlockProfile = async () => {
    setIsUnlocking(true);
    try {
      await unlockProfile(userId);
      toast.success('Đã mở khóa hồ sơ thành công!');
      fetchCandidateProfile(); // Refresh to get unmasked data
    } catch (err) {
      console.error('Error unlocking profile:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể mở khóa hồ sơ.';
      toast.error(errorMessage);
    } finally {
      setIsUnlocking(false);
    }
  };

  const maskEmail = (email) => {
    if (!email) return 'N/A';
    const [username, domain] = email.split('@');
    if (!domain) return email;
    const maskedUsername = username.charAt(0) + '***' + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  const maskPhone = (phone) => {
    if (!phone) return 'N/A';
    return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
  };

  const handleMessageClick = (conversationId = null) => {
    console.log('[CandidateProfile] Opening chat interface with conversationId:', conversationId);
    setSelectedConversationId(conversationId);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    console.log('[CandidateProfile] Closing chat interface');
    setIsChatOpen(false);
    setSelectedConversationId(null);
  };

  console.log('Render state:', { isLoading, error, profile });

  if (isLoading) {
    return <CandidateProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl p-4 lg:p-6">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <ErrorState onRetry={fetchCandidateProfile} message={error} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-6xl p-4 lg:p-6">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Không tìm thấy thông tin ứng viên.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLocked = !profile.isUnlocked;
  const cv = profile.cvs && profile.cvs.length > 0 ? profile.cvs[0] : null;

  const handleDownloadCv = () => {
    if (!pdfUrl || !cv) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = cv.name || 'CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã tải xuống CV');
  };

  return (
    <div className="container mx-auto max-w-[1600px] p-4 lg:p-6">
      {/* Header with Back Button and Actions */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="flex items-center gap-3">
          {/* Message Button with access control */}
          <MessageButton
            candidateId={userId}
            candidateName={profile?.fullname || 'Ứng viên'}
            onMessageClick={handleMessageClick}
          />

          {/* Unlock Button - Only when locked */}
          {isLocked && (
            <Button
              onClick={handleUnlockProfile}
              disabled={isUnlocking}
              className="bg-amber-600 hover:bg-amber-700"
              size="sm"
            >
              <Unlock className="h-4 w-4 mr-2" />
              {isUnlocking ? 'Đang mở khóa...' : 'Mở khóa (50 coins)'}
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {isLocked && (
        <div className="mb-6 p-4 border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-lg shadow-sm">
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-0.5">
              <div className="p-2.5 bg-amber-100 rounded-xl shadow-sm">
                <Lock className="h-5 w-5 text-amber-700" />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                Hồ sơ đang bị khóa
                <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                  50 coins để mở
                </Badge>
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Email, số điện thoại và CV đã được che thông tin. Mở khóa để xem đầy đủ và liên hệ trực tiếp với ứng viên.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isLocked && (
        <div className="mb-6 p-4 border-l-4 border-green-500 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-lg shadow-sm">
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-0.5">
              <div className="p-2.5 bg-green-100 rounded-xl shadow-sm">
                <Unlock className="h-5 w-5 text-green-700" />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-bold text-green-900 flex items-center gap-2">
                Hồ sơ đã được mở khóa
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                  Đã thanh toán
                </Badge>
              </h3>
              <p className="text-xs text-green-800 leading-relaxed">
                Bạn có thể xem đầy đủ thông tin liên hệ, CV không bị che và liên hệ trực tiếp với ứng viên.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout: CV on Left, Info on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left Column - CV Viewer (3 columns) */}
        <div className="xl:col-span-3 space-y-6">
          {/* CV Viewer Card */}
          {cv && (
            <Card className="overflow-hidden shadow-md">
              <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b-2 border-primary/20">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl shadow-sm">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">CV Tìm Việc</CardTitle>
                        {isLocked && (
                          <Badge className="text-xs gap-1 bg-amber-500 hover:bg-amber-600 text-white border-0">
                            <Lock className="h-3 w-3" />
                            Đã che
                          </Badge>
                        )}
                        {!isLocked && (
                          <Badge className="text-xs gap-1 bg-green-500 hover:bg-green-600 text-white border-0">
                            <Unlock className="h-3 w-3" />
                            Đã mở
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs font-medium">
                        {cv.name}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCv}
                    disabled={!pdfUrl}
                    className="shadow-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* PDF Viewer */}
                <div className="bg-gray-50 p-4">
                  {isLoadingPdf && (
                    <div className="flex items-center justify-center h-[800px] bg-white rounded-lg">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Đang tải CV...</p>
                      </div>
                    </div>
                  )}

                  {pdfUrl && !isLoadingPdf && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <iframe
                        src={`${pdfUrl}#view=FitH`}
                        className="w-full h-[800px]"
                        title={cv.name}
                        style={{ border: 'none' }}
                      />
                    </div>
                  )}
                </div>

                {/* Info Banner */}
                {isLocked && (
                  <div className="p-5 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-t-2 border-amber-200">
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <div className="p-2.5 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl shadow-sm">
                          <Lock className="h-5 w-5 text-amber-800" />
                        </div>
                      </div>
                      <div className="space-y-2.5 flex-1">
                        <h5 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                          CV đã được bảo mật
                          <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                            Chế độ riêng tư
                          </Badge>
                        </h5>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2.5 text-xs text-amber-900">
                            <div className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-amber-600"></div>
                            <span>Email và số điện thoại trong CV đã bị <strong>che bằng hình chữ nhật xám</strong></span>
                          </div>
                          <div className="flex items-start gap-2.5 text-xs text-amber-900">
                            <div className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-amber-600"></div>
                            <span>Đây là <strong>CV duy nhất</strong> mà ứng viên công khai cho nhà tuyển dụng</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!isLocked && (
                  <div className="p-5 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-t-2 border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        <div className="p-2.5 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-sm">
                          <Unlock className="h-5 w-5 text-green-800" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-green-900 mb-1">
                          Xem CV đầy đủ
                        </h5>
                        <p className="text-xs text-green-800 leading-relaxed">
                          Bạn đang xem <strong>CV tìm việc</strong> với thông tin liên hệ đầy đủ (không bị che)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Candidate Info (2 columns) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20 border-2 border-primary">
                  <AvatarImage src={profile.avatar} alt={profile.fullname} />
                  <AvatarFallback className="text-lg">
                    {profile.fullname?.charAt(0) || 'UV'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-1">{profile.fullname}</CardTitle>
                  <CardDescription className="text-sm">{profile.title || 'Ứng viên'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-muted rounded-lg">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className={`font-medium ${isLocked ? 'text-muted-foreground' : ''}`}>
                      {isLocked ? maskEmail(profile.email) : profile.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-muted rounded-lg">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Số điện thoại</p>
                    <p className={`font-medium ${isLocked ? 'text-muted-foreground' : ''}`}>
                      {isLocked ? maskPhone(profile.phone) : profile.phone}
                    </p>
                  </div>
                </div>

                {profile.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-muted rounded-lg">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Địa chỉ</p>
                      <p className="font-medium">{profile.address}</p>
                    </div>
                  </div>
                )}

                {profile.expectedSalary && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-muted rounded-lg">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Mức lương mong muốn</p>
                      <p className="font-medium">
                        {profile.expectedSalary.min?.toLocaleString('vi-VN')} -{' '}
                        {profile.expectedSalary.max?.toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kỹ năng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {typeof skill === 'object' ? skill.name : skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bio */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Giới thiệu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {profile.experiences && profile.experiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Kinh nghiệm làm việc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.experiences.map((exp, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <h4 className="font-semibold">{exp.position}</h4>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {utils.formatDate(exp.startDate)} -{' '}
                      {exp.endDate ? utils.formatDate(exp.endDate) : 'Hiện tại'}
                    </p>
                    {exp.description && (
                      <p className="text-sm mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {profile.educations && profile.educations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Học vấn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.educations.map((edu, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <h4 className="font-semibold">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground">{edu.school}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {utils.formatDate(edu.startDate)} -{' '}
                      {edu.endDate ? utils.formatDate(edu.endDate) : 'Hiện tại'}
                    </p>
                    {edu.description && (
                      <p className="text-sm mt-2">{edu.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Certificates */}
          {profile.certificates && profile.certificates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Chứng chỉ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.certificates.map((cert, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">{cert.name}</h4>
                      <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                      {cert.issueDate && (
                        <p className="text-xs text-muted-foreground">
                          {utils.formatDate(cert.issueDate)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {profile.projects && profile.projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dự án</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.projects.map((project, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <h4 className="font-semibold">{project.name}</h4>
                    {project.description && (
                      <p className="text-sm mt-2">{project.description}</p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.technologies.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <ChatInterface
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        conversationId={selectedConversationId}
        recipientId={userId}
      />
    </div>
  );
};

const CandidateProfileSkeleton = () => (
  <div className="container mx-auto max-w-6xl p-4 lg:p-6">
    <div className="mb-6">
      <Skeleton className="h-9 w-32" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-7 w-3/4 mx-auto" />
            <Skeleton className="h-5 w-1/2 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default CandidateProfile;
