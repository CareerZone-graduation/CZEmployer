import { Star } from 'lucide-react';
import MotionWrapper from '@/components/ui/MotionWrapper';
import LazyImage from '@/components/ui/LazyImage';
import { cn } from '@/lib/utils';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * i,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const TestimonialCard = ({ 
  name, 
  position, 
  company, 
  content, 
  avatar, 
  rating = 5, 
  index = 0,
  className 
}) => {
  return (
    <MotionWrapper
      variants={cardVariants}
      custom={index}
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300",
        className
      )}
    >
      {/* Rating */}
      <div className="flex items-center gap-1 mb-4" aria-label={`Đánh giá ${rating} trên 5 sao`}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            )}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Content */}
      <blockquote className="text-gray-700 leading-relaxed mb-6">
        "{content}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <LazyImage
            src={avatar}
            alt={`Ảnh đại diện của ${name}`}
            className="w-12 h-12 rounded-full object-cover"
            placeholder="/placeholder-user.jpg"
          />
        </div>
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-600">
            {position} • {company}
          </div>
        </div>
      </div>
    </MotionWrapper>
  );
};

export default TestimonialCard;