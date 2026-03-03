import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Clock } from 'lucide-react';

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
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border border-gray-200"
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
              <h3 className="text-lg font-bold text-gray-900 truncate pr-2 group-hover:text-primary transition-colors">
                {candidate.fullname}
              </h3>
              {typeof matchScore === 'number' && (
                <Badge
                  variant={matchScore >= 80 ? 'default' : matchScore >= 60 ? 'secondary' : 'outline'}
                  className="flex-shrink-0"
                >
                  {matchScore}% phù hợp
                </Badge>
              )}
            </div>

            <div className="space-y-2 mb-4">

              {candidate.appliedAt && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5 mr-2 text-gray-400 shrink-0" />
                  <span>Ứng tuyển {new Date(candidate.appliedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>

            {candidate.skills && candidate.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 line-clamp-2">
                {candidate.skills.slice(0, 4).map((skill, techIndex) => (
                  <Badge
                    key={techIndex}
                    variant="secondary"
                    className="text-[10px] bg-gray-100 text-gray-700 hover:bg-gray-200 border-none px-2 py-0"
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
