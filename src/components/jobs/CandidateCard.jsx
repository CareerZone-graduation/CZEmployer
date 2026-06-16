import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Clock, Sparkles, MapPin, Award, Laptop, Settings } from 'lucide-react';

const getMatchIcon = (type) => {
  switch (type) {
    case 'ai_match':
      return Sparkles;
    case 'location_match':
      return MapPin;
    case 'category_match':
      return Briefcase;
    case 'experience_match':
      return Award;
    case 'worktype_match':
      return Laptop;
    default:
      return Settings;
  }
};

const getReasonColor = (type) => {
  switch (type) {
    case 'ai_match':
      return {
        bg: 'bg-purple-50/70 border border-purple-100/80',
        text: 'text-purple-700'
      };
    case 'location_match':
      return {
        bg: 'bg-orange-50/70 border border-orange-100/80',
        text: 'text-orange-700'
      };
    case 'category_match':
      return {
        bg: 'bg-blue-50/70 border border-blue-100/80',
        text: 'text-blue-700'
      };
    case 'experience_match':
      return {
        bg: 'bg-amber-50/70 border border-amber-100/80',
        text: 'text-amber-700'
      };
    case 'worktype_match':
      return {
        bg: 'bg-teal-50/70 border border-teal-100/80',
        text: 'text-teal-700'
      };
    default:
      return {
        bg: 'bg-gray-50 border border-gray-100',
        text: 'text-gray-700'
      };
  }
};

const CandidateCard = ({ candidate, jobId, matchScore }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // If we have jobId, use the specialized /candidates/:id route with jobId query param
    // If not, we might fall back to general profile view
    const url = jobId
      ? `/candidates/${candidate.userId || candidate._id}?jobId=${jobId}`
      : `/candidates/${candidate.userId || candidate._id}`;
    navigate(url);
  };

  const getInitials = (name) => {
    if (!name) return 'UV';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.01] border border-gray-200 bg-white"
      onClick={handleClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-white shadow-sm shrink-0">
            <AvatarImage src={candidate.avatar} alt={candidate.fullname} />
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
              {getInitials(candidate.fullname)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-base font-bold text-gray-900 truncate pr-2 group-hover:text-primary transition-colors">
                {candidate.fullname}
              </h3>
              {typeof matchScore === 'number' && (
                <Badge
                  variant={matchScore >= 80 ? 'default' : matchScore >= 60 ? 'secondary' : 'outline'}
                  className="flex-shrink-0 text-xs px-2 py-0.5"
                >
                  {matchScore}% phù hợp
                </Badge>
              )}
            </div>

            {/* Position and Experience info */}
            {(candidate.currentPosition || typeof candidate.experienceYears === 'number') && (
              <div className="text-xs text-gray-600 mb-2 font-medium flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{candidate.currentPosition || 'Ứng viên'}</span>
                {typeof candidate.experienceYears === 'number' && (
                  <span className="text-gray-400 font-normal shrink-0">
                    • {candidate.experienceYears} năm kinh nghiệm
                  </span>
                )}
              </div>
            )}

            <div className="space-y-2 mb-3">
              {candidate.appliedAt && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5 mr-2 text-gray-400 shrink-0" />
                  <span>Ứng tuyển {new Date(candidate.appliedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>

            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 line-clamp-2">
                {candidate.skills.slice(0, 4).map((skill, techIndex) => (
                  <Badge
                    key={techIndex}
                    variant="secondary"
                    className="text-[10px] bg-gray-50 text-gray-600 hover:bg-gray-100 border-none px-2 py-0"
                  >
                    {typeof skill === 'object' ? skill.name : skill}
                  </Badge>
                ))}
                {candidate.skills.length > 4 && (
                  <span className="text-[10px] text-gray-400 font-medium ml-1">
                    +{candidate.skills.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Match Reasons */}
            {candidate.matchReasons && candidate.matchReasons.length > 0 && (
              <div className="mt-4 pt-3 border-t border-dashed border-gray-100">
                <div className="flex flex-wrap gap-1.5">
                  {candidate.matchReasons.map((reason, idx) => {
                    const Icon = getMatchIcon(reason.type);
                    const colors = getReasonColor(reason.type);
                    return (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${colors.bg} ${colors.text}`}
                        title={`${reason.value} (Trọng số: ${reason.weight}%)`}
                      >
                        <Icon className="h-3 w-3 shrink-0" />
                        <span>{reason.value}</span>
                        {reason.weight && (
                          <span className="opacity-80 font-bold">+{reason.weight}%</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
