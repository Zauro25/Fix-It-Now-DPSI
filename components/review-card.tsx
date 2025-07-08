import type { Review } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { RatingStars } from './rating-stars';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const timeAgo = formatDistanceToNow(new Date(review.created_at), { addSuffix: true });

  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src={review.user_avatar} alt={review.user_name} />
        <AvatarFallback>{review.user_name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-semibold">{review.user_name}</p>
                <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
            <RatingStars rating={review.rating} />
        </div>
        <p className="mt-2 text-foreground/90">{review.comment}</p>
      </div>
    </div>
  );
}
