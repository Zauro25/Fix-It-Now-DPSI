'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon, FunnelIcon, HeartIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { fasilitasData } from '@/components/data/fasilitas'

const filters = ['Filter 1', 'Filter 2', 'Filter 3', 'Filter 4']

export default function DaftarFasilitas() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('')

  const filteredFasilitas = fasilitasData.filter(fasilitas =>
    fasilitas.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Daftar Fasilitas
          </h1>
          <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
            <HeartIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Fasilitas apa yang anda cari hari ini?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-8">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <FunnelIcon className="w-4 h-4" />
            Filter
          </button>
          
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Facilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFasilitas.map((fasilitas) => (
            <Link key={fasilitas.id} href={`/fasilitas/${fasilitas.id}`}>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200 relative">
                  <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <StarIcon className="w-4 h-4" />
                    {fasilitas.rating}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="bg-gray-700 text-white px-4 py-2 rounded-lg text-center font-medium">
                    {fasilitas.name}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}