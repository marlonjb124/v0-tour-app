import { notFound } from 'next/navigation';
import TourDetailClient from '@/components/tour-detail-client';

// This function can be used to generate static pages at build time.
// For now, we'll fetch data on-demand.
// export async function generateStaticParams() {
//   // Fetch all tour ids
//   return [{ id: '1' }, { id: '2' }];
// }

import { createClient } from '@/lib/supabase-server';
import { Tour, TourAvailability, TourWithAvailability } from '@/lib/types';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

async function getTourDetails(id: string): Promise<TourWithAvailability | null> {
  const supabase = await createClient();

  const tourResponse: PostgrestSingleResponse<Tour> = await supabase
    .from('tours')
    .select('*')
    .eq('id', id)
    .single();

  if (tourResponse.error || !tourResponse.data) {
    console.error('Error fetching tour:', tourResponse.error);
    return null;
  }

  const tour: Tour = tourResponse.data;

  const availabilityResponse = await supabase
    .from('tour_availability')
    .select('*')
    .eq('tour_id', id)
    .order('available_date', { ascending: true });

  if (availabilityResponse.error) {
    console.error('Error fetching availability:', availabilityResponse.error);
  }

  const availability: TourAvailability[] = availabilityResponse.data || [];

  return {
    ...tour,
    availability,
  };
}

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const tour = await getTourDetails(resolvedParams.id);

  if (!tour) {
    notFound();
  }

  return <TourDetailClient tour={tour} />;
}
