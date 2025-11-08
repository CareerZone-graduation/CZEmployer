import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ErrorState from '@/components/common/ErrorState';
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
  DollarSign
} from 'lucide-react';
import * as candidateService from '@/services/candidateService';
import * as utils from '@/utils';

const CandidateProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

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

  const handleUnlockProfile = async () => {
    setIsUnlocking(true);
    try {
      await candidateService.unlockCandidateProfile(userId);
      toast.success('Đã mở khóa hồ sơ thành công!');
      fetchCandidateProfile(); // Refresh to get unmasked data
    } catch (err) {
      console.error('Error unlocking profile:', err);
      const errorMessage = err.response?.data?.message || 'Không thể mở khóa hồ sơ.';
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

  return (
    <div className="container mx-auto max-w-6xl p-4 lg:p-6">
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>

      {/* Unlock Banner */}
      {isLocked && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Lock className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Hồ sơ đang bị khóa</h3>
                  <p className="text-sm text-yellow-700">
                    Thông tin liên hệ đã được ẩn. Mở khóa để xem đầy đủ thông tin ứng viên.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUnlockProfile}
                disabled={isUnlocking}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Unlock className="h-4 w-4 mr-2" />
                {isUnlocking ? 'Đang mở khóa...' : 'Mở khóa hồ sơ'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary">
                <AvatarImage src={profile.avatar} alt={profile.fullname} />
                <AvatarFallback>
                  {profile.fullname?.charAt(0) || 'UV'}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{profile.fullname}</CardTitle>
              <CardDescription>{profile.title || 'Ứng viên'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className={isLocked ? 'text-muted-foreground' : ''}>
                  {isLocked ? maskEmail(profile.email) : profile.email}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className={isLocked ? 'text-muted-foreground' : ''}>
                  {isLocked ? maskPhone(profile.phone) : profile.phone}
                </span>
              </div>
              {profile.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{profile.address}</span>
                </div>
              )}
              {profile.expectedSalary && (
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>
                    {profile.expectedSalary.min?.toLocaleString('vi-VN')} -{' '}
                    {profile.expectedSalary.max?.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              )}
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

          {/* CV Files */}
          {profile.cvFiles && profile.cvFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">CV đính kèm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {profile.cvFiles.map((cv, index) => (
                  <Link
                    key={index}
                    to="/cv-viewer"
                    state={{ cvUrl: isLocked ? cv.maskedPath : cv.path }}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{cv.name}</p>
                      {isLocked && (
                        <p className="text-xs text-muted-foreground">
                          Thông tin liên hệ đã được ẩn
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Giới thiệu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap">{profile.bio}</p>
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
