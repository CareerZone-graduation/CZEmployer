import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, Clock } from 'lucide-react';
import MessageButton from '@/components/candidates/MessageButton';

const CandidateCard = ({ candidate, onMessageClick }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    // Don't navigate if clicking on the message button
    if (e.target.closest('button')) {
      return;
    }
    navigate(`/candidates/${candidate.userId}`);
  };

  const handleMessageClick = () => {
    if (onMessageClick) {
      onMessageClick(candidate);
    }
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
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16 border-2 border-gray-100">
            <AvatarImage src={candidate.avatar} alt={candidate.fullname} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
              {getInitials(candidate.fullname)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name and Similarity */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {candidate.fullname}
              </h3>
              <Badge 
                className="bg-green-100 text-green-700 font-bold text-lg px-3 py-1 shrink-0"
              >
                {candidate.similarityPercentage}%
              </Badge>
            </div>

            {/* Current Position */}
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <Briefcase className="h-4 w-4 shrink-0" />
              <span className="text-sm truncate">{candidate.currentPosition}</span>
            </div>

            {/* Experience Years */}
            {candidate.experienceYears !== undefined && (
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="text-sm">
                  {candidate.experienceYears} {candidate.experienceYears === 1 ? 'năm' : 'năm'} kinh nghiệm
                </span>
              </div>
            )}

            {/* Matched Skills */}
            {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {candidate.matchedSkills.slice(0, 5).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {/* Message Button */}
            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
              <MessageButton
                candidateId={candidate.userId}
                candidateName={candidate.fullname}
                onMessageClick={handleMessageClick}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
