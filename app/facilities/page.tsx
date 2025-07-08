import Link from 'next/link';
import FasilitasCard from '@/components/FasilitasCard';
import { HeartIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { getFacilities } from '@/lib/data';

export default async function FacilitiesPage() {
  const facilities = await getFacilities();

  if (!facilities) {
    return <div>Error loading facilities.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold font-headline text-gray-800">
          Daftar Fasilitas
        </h1>
        <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
          <HeartIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Fasilitas apa yang anda cari hari ini?"
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto mb-8 pb-2">
        <button className="flex items-center gap-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-full text-sm font-medium">
          <FunnelIcon className="w-4 h-4" /> Filter
        </button>
        {/* Add more filters as needed */}
      </div>

      {/* Facility Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {facilities.map((facility) => (
          <Link key={facility.id} href={`/facilities/${facility.id}`}>
            <FasilitasCard fasilitas={facility} />
          </Link>
        ))}
      </div>
    </div>
  );
}
