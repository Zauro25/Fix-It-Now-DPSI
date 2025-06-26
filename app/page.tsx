import Link from 'next/link'
import { fasilitasData } from '@/components/data/fasilitas'
import FasilitasCard from '@/components/FasilitasCard'

export default function Home() {
  const featuredFasilitas = fasilitasData.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-600 mb-6">
            Fix It Now
          </h1>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/fasilitas"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Daftar Fasilitas
            </Link>
            
            <div className="flex gap-4">
              <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors">
                Rating Fasilitas
              </button>
              <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors">
                Lapor Keluhan
              </button>
            </div>
          </div>
          
          <button className="border border-blue-400 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium transition-colors">
            3 Fasilitas Terbaik Bulan Ini
          </button>
        </div>

        {/* Featured Facilities */}
        <div className="grid md:grid-cols-3 gap-6">
          {featuredFasilitas.map((fasilitas) => (
            <Link key={fasilitas.id} href={`/fasilitas/${fasilitas.id}`}>
              <FasilitasCard fasilitas={fasilitas} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}