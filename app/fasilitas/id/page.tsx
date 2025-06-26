import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StarIcon, HandThumbUpIcon, HeartIcon } from '@heroicons/react/24/solid'
import { fasilitasData, getRelatedFasilitas } from '@/components/data/fasilitas'
import FasilitasCard from '@/components/FasilitasCard'

interface PageProps {
  params: {
    id: string
  } 
}

export default function DetailFasilitas({ params }: PageProps) {
  const fasilitas = fasilitasData.find(f => f.id === params.id)
  
  if (!fasilitas) {
    notFound()
  }

  const relatedFasilitas = getRelatedFasilitas(params.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-end mb-6">
          <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
            <HeartIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Facility Card */}
        <div className="bg-gray-700 rounded-2xl p-6 text-white mb-8 relative">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold">{fasilitas.name}</h1>
            <div className="text-right">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 mb-1">
                <StarIcon className="w-4 h-4" />
                {fasilitas.rating}
              </div>
              <div className="text-sm text-gray-300">
                {fasilitas.totalRatings} Ratings
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2 mb-6">
            {fasilitas.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-600 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action Button */}
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <span>Berikan Penilaian</span>
            <HandThumbUpIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {fasilitas.name}
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure 
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit 
            anim id est laborum.
          </p>
        </div>

        {/* Related Facilities */}
        <div className="text-center mb-8">
          <button className="border border-blue-400 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium transition-colors">
            3 Fasilitas Terbaik Bulan Ini
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {relatedFasilitas.map((facility) => (
            <Link key={facility.id} href={`/fasilitas/${facility.id}`}>
              <FasilitasCard fasilitas={facility} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}