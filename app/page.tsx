import { getFacilities } from '@/lib/data';
import FasilitasCard from '@/components/FasilitasCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function HomePage() {
  const allFacilities = await getFacilities();
  const topFacilities = allFacilities.slice(0, 2);
  // The image shows Fasilitas 2 twice. Replicating for visual accuracy.
  const displayFacilities = topFacilities.length > 1 ? [topFacilities[0], topFacilities[1], topFacilities[1]] : allFacilities;

  return (
    <div className="flex flex-col items-center justify-start h-full text-center py-16 px-4">
      <h1 className="text-5xl font-bold text-primary font-headline">
        Fix It Now
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground mt-4 mb-10">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>

      <div className="flex flex-col items-center gap-4 mb-12">
        <Button asChild size="lg" className="w-96 rounded-xl border-primary border-2 h-14 text-lg text-primary hover:bg-primary/5 hover:text-primary" variant="outline">
          <Link href="/facilities">Daftar Fasilitas</Link>
        </Button>
        <div className="flex gap-4">
          <Button asChild size="lg" className="w-44 rounded-xl border-primary border-2 h-14 text-lg text-primary hover:bg-primary/5 hover:text-primary" variant="outline">
            <Link href="/facilities">Rating Fasilitas</Link>
          </Button>
          <Button asChild size="lg" className="w-44 rounded-xl border-primary border-2 h-14 text-lg text-primary hover:bg-primary/5 hover:text-primary" variant="outline">
            <Link href="/report">Lapor Keluhan</Link>
          </Button>
        </div>
      </div>

      <Button variant="outline" className="rounded-full border-primary border-2 mb-10 text-primary hover:text-primary hover:bg-primary/5">
        3 Fasilitas Terbaik Bulan Ini
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {displayFacilities.map((facility, index) => (
          <FasilitasCard key={`${facility.id}-${index}`} fasilitas={facility} />
        ))}
      </div>
    </div>
  );
}
