import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const RATING_OPTIONS = [
  { value: 'NOT_SUITABLE', label: 'Không phù hợp' },
  { value: 'MAYBE', label: 'Có thể' },
  { value: 'SUITABLE', label: 'Phù hợp' },
  { value: 'PERFECT_MATCH', label: 'Rất phù hợp' },
];

const ratingClasses = {
  'NOT_SUITABLE': 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
  'MAYBE': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
  'SUITABLE': 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
  'PERFECT_MATCH': 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
  'NOT_RATED': 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
};

const CandidateRating = ({ initialRating, onRatingSave, isSubmitting }) => {
  const [selectedRating, setSelectedRating] = useState(initialRating);

  const handleRatingClick = (ratingValue) => {
    setSelectedRating(ratingValue);
  };

  const handleSaveClick = () => {
    onRatingSave(selectedRating);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Đánh giá ứng viên</p>
      <div className="flex flex-wrap gap-2">
        {RATING_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            className={cn(
              'transition-all',
              selectedRating === option.value
                ? `${ratingClasses[option.value]} border-2`
                : 'text-muted-foreground'
            )}
            onClick={() => handleRatingClick(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <Button
        size="sm"
        onClick={handleSaveClick}
        disabled={isSubmitting || selectedRating === initialRating}
        className="w-full"
      >
        {isSubmitting ? 'Đang lưu...' : 'Lưu đánh giá'}
      </Button>
    </div>
  );
};

export default CandidateRating;