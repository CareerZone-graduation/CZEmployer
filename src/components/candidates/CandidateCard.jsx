import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Eye, 
  Lock,
  Star,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CandidateCard = ({ candidate, matchScore }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/candidates/${candidate.userId || candidate._id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={candidate.avatar} alt={candidate.fullname} />
            <AvatarFallback>
              {candidate.fullname?.charAt(0) || 'UV'}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {candidate.fullname}
                </h3>
                {candidate.title && (
                  <p className="text-sm text-muted-foreground truncate">
                    {candidate.title}
                  </p>
                )}
              </div>

              {/* Match Score */}
              {matchScore && (
                <Badge 
                  variant={matchScore >= 80 ? 'default' : matchScore >= 60 ? 'secondary' : 'outline'}
                  className="flex items-center gap-1 flex-shrink-0"
                >
                  <TrendingUp className="h-3 w-3" />
                  {matchScore}% phù hợp
                </Badge>
              )}
            </div>

            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {candidate.skills.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {typeof skill === 'object' ? skill.name : skill}
                  </Badge>
                ))}
                {candidate.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{candidate.skills.length - 5}
                  </Badge>
                )}
              </div>
            )}

            {/* Details */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
              {candidate.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{candidate.address}</span>
                </div>
              )}
              
              {candidate.experiences && candidate.experiences.length > 0 && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{candidate.experiences.length} kinh nghiệm</span>
                </div>
              )}

              {candidate.expectedSalary && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {candidate.expectedSalary.min?.toLocaleString('vi-VN')} - 
                    {candidate.expectedSalary.max?.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleViewProfile}
                size="sm"
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Xem hồ sơ
              </Button>

              {!candidate.isUnlocked && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Chưa mở khóa
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
