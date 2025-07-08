import { getFacilityById, getReviewsByFacilityId, getFacilities } from '@/lib/data';
import Link from 'next/link';
import { ReviewCard } from '@/components/review-card';
import {
  StarIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  HandThumbUpIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid';
import FasilitasCard from '@/components/FasilitasCard';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Facility } from '@/lib/types';

export default async function FacilityReviewsPage({
  params,
}: {
  params: { id: string };
}) {
  const facility = await getFacilityById(params.id);

  if (!facility) {
    notFound();
  }

  const reviews = await getReviewsByFacilityId(params.id);
  
  const allFacilities = await getFacilities();
  const relatedFasilitas = allFacilities
    .filter((f: Facility) => f.id !== facility.id)
    .slice(0, 3);

  // Use real data from the extended facility object
  const facilityStats = {
    averageRating: facility.average_rating || 0,
    commentCount: (facility as any).total_comments_count || 0,
    favoriteCount: 0, // Placeholder, as this data isn't available
    likeCount: (facility as any).total_likes_count || 0,
    totalRatingsViews: (facility as any).total_ratings_count || reviews.length,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex justify-start">
          <Link
            href={`/facilities/${params.id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {facility.name}
          </Link>
        </div>

        <div className="bg-gray-800 text-white rounded-lg p-6 mb-8 shadow-lg text-center">
          <h1 className="text-3xl font-bold font-headline mb-4">
            {facility.name}
          </h1>
          <div className="flex justify-around items-center text-center">
            <div className="flex flex-col items-center">
              <StarIcon className="w-6 h-6 text-yellow-400" />
              <span className="text-lg font-semibold">
                {facilityStats.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-300">Rating</span>
            </div>
            <div className="flex flex-col items-center">
              <ChatBubbleLeftIcon className="w-6 h-6 text-blue-400" />
              <span className="text-lg font-semibold">
                {facilityStats.commentCount}
              </span>
              <span className="text-sm text-gray-300">Comments</span>
            </div>
            <div className="flex flex-col items-center">
              <HeartIcon className="w-6 h-6 text-red-400" />
              <span className="text-lg font-semibold">
                {facilityStats.favoriteCount}
              </span>
              <span className="text-sm text-gray-300">Favorites</span>
            </div>
            <div className="flex flex-col items-center">
              <HandThumbUpIcon className="w-6 h-6 text-green-400" />
              <span className="text-lg font-semibold">
                {facilityStats.likeCount}
              </span>
              <span className="text-sm text-gray-300">Likes</span>
            </div>
            <div className="flex flex-col items-center">
              <UserGroupIcon className="w-6 h-6 text-purple-400" />
              <span className="text-lg font-semibold">
                {facilityStats.totalRatingsViews}
              </span>
              <span className="text-sm text-gray-300">Reviews</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold font-headline mb-4 text-center">
            Reviews
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-full">
                No reviews yet. Be the first to leave a review!
              </p>
            )}
          </div>
        </div>

        {relatedFasilitas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-headline mb-4 text-center">
              Related Facilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedFasilitas.map((relatedFacility) => (
                <Link key={relatedFacility.id} href={`/facilities/${relatedFacility.id}`}>
                  <FasilitasCard fasilitas={relatedFacility} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
