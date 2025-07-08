import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  className?: string;
  starClassName?: string;
  showValue?: boolean;
}

export function RatingStars({ rating, className, starClassName, showValue = false }: RatingStarsProps) {
  const roundedRating = Math.round(rating);
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-5 w-5',
              i < roundedRating ? 'text-accent fill-accent' : 'text-muted-foreground/30',
              starClassName
            )}
          />
        ))}
      </div>
      {showValue && <span className="text-sm text-muted-foreground">({rating.toFixed(1)})</span>}
    </div>
  );
}
