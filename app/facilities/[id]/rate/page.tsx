import { getFacilityById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { RatingForm } from './components/rating-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function RateFacilityPage({ params }: { params: { id: string } }) {
  const facility = await getFacilityById(params.id);
  
  if (!facility) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Link href={`/facilities/${params.id}`} className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Detail Fasilitas
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Berikan Penilaian untuk</h1>
          <p className="text-xl text-blue-600 font-semibold">{facility.name}</p>
        </div>
        
        <RatingForm facilityId={params.id} />
      </div>
    </div>
  );
}
