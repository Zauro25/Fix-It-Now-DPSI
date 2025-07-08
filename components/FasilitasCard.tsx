import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'
import { Facility } from '@/lib/types'

interface FasilitasCardProps {
  fasilitas: Facility & { total_ratings_count?: number }
  showImage?: boolean
}

const FasilitasCard = ({ fasilitas, showImage = true }: FasilitasCardProps) => {
  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {showImage && (
        <div className="h-48 w-full relative">
          {fasilitas.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={fasilitas.photo_url} 
              alt={fasilitas.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 truncate mb-2 group-hover:text-blue-600 transition-colors">
          {fasilitas.name}
        </h3>
        
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">
            <StarIcon className="w-4 h-4 text-yellow-500" />
            <span>{fasilitas.average_rating.toFixed(1)}</span>
          </div>
          <span className="text-gray-500 text-xs">
            ({fasilitas.total_ratings_count || 0} reviews)
          </span>
        </div>
      </div>
    </div>
  )
}

export default FasilitasCard
