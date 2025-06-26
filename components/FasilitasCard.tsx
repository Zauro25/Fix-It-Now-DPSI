import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'
import { Fasilitas } from '@/components/data/fasilitas'

interface FasilitasCardProps {
  fasilitas: Fasilitas
  showImage?: boolean
}

const FasilitasCard = ({ fasilitas, showImage = true }: FasilitasCardProps) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {showImage && (
        <div className="h-48 bg-gray-200 relative">
          <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <StarIcon className="w-4 h-4" />
            {fasilitas.rating}
          </div>
        </div>
      )}
      
      <div className="p-4">
        <div className="bg-gray-700 text-white px-4 py-2 rounded-lg text-center font-medium mb-4">
          {fasilitas.name}
        </div>
        
        {!showImage && (
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <StarIcon className="w-4 h-4" />
              {fasilitas.rating}
            </div>
            <span className="text-gray-600 text-sm">
              {fasilitas.totalRatings} Ratings
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default FasilitasCard