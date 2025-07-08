import { getFacilityById, getFacilities, getTagsByFacilityId } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { StarIcon, HandThumbUpIcon } from '@heroicons/react/24/solid';
import { ArrowLeft } from 'lucide-react'; // Corrected import
import FasilitasCard from '@/components/FasilitasCard';
import { Facility } from '@/lib/types';

interface PageProps { params: { id: string } }

export default async function DetailFasilitas({ params }: PageProps) {
  const facility = await getFacilityById(params.id);

  if (!facility) {
    notFound();
  }

  const allFacilities = await getFacilities();
  const relatedFasilitas = allFacilities
    .filter((f) => f.id !== facility.id)
    .slice(0, 3);

  const tags = await getTagsByFacilityId(params.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/facilities" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Fasilitas
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column: Image */}
          <div className="w-full h-80 bg-gray-200 rounded-lg shadow-lg overflow-hidden">
            {facility.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={facility.photo_url} alt={facility.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}
          </div>

          {/* Right Column: Info */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{facility.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center gap-1">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-xl font-bold text-gray-800">{facility.average_rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-500 ml-2">({(facility as any).total_ratings_count || 0} reviews)</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag) => (
                <span key={tag.id} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {tag.name}
                </span>
              ))}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{facility.description || "No description available."}</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/facilities/${facility.id}/rate`} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105">
                  <HandThumbUpIcon className="w-5 h-5" />
                  <span>Berikan Penilaian</span>
                </button>
              </Link>
              <Link href={`/facilities/${facility.id}/reviews`} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors">
                  Lihat Semua Review
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Related Facilities Section */}
        {relatedFasilitas.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Fasilitas Terkait</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
