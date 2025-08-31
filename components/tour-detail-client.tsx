'use client';

import { Star, MapPin, Check } from 'lucide-react';
import Image from 'next/image';
import TourCalendar from './tour-calendar';
import type { TourWithAvailability } from '@/lib/types';

interface TourDetailClientProps {
  tour: TourWithAvailability;
}

export default function TourDetailClient({ tour }: TourDetailClientProps) {

  return (
    <div className="bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight">{tour.title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center mt-2 gap-2 sm:gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span>{tour.rating} ({tour.review_count} reviews)</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{tour.city}, {tour.location}</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div className="col-span-1">
            <Image 
              src={(tour.images as string[])?.[0] || '/placeholder.jpg'}
              alt={tour.title}
              width={800}
              height={600}
              className="rounded-lg object-cover w-full h-48 sm:h-64 lg:h-full shadow-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {((tour.images as string[]) || []).slice(1, 5).map((img: string, index: number) => (
              <Image 
                key={index}
                src={img}
                alt={`${tour.title} image ${index + 2}`}
                width={400}
                height={300}
                className="rounded-lg object-cover w-full h-24 sm:h-32 lg:h-full shadow-md"
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 border-b pb-2">About this tour</h2>
          <p className="text-muted-foreground mb-6 sm:mb-8 whitespace-pre-wrap text-sm sm:text-base">{tour.full_description || tour.description}</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Highlights</h3>
              <ul className="space-y-2">
                {(tour.highlights as string[] || []).map((highlight, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground text-sm sm:text-base">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">What's Included</h3>
              <ul className="space-y-2">
                {(tour.included as string[] || []).map((item, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground text-sm sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3">Cancellation Policy</h3>
            <p className="text-muted-foreground text-sm sm:text-base">{tour.cancellation_policy}</p>
          </div>
        </div>

        {/* Calendar Section */}
        <TourCalendar 
          tourId={tour.id}
          tourTitle={tour.title}
          tourPrice={tour.price} 
          tourInfo={{
            meetingPoint: tour.meeting_point || '',
            duration: tour.duration || '',
            highlights: tour.highlights || [],
            included: tour.included || [],
            cancellation: tour.cancellation_policy || 'Consultar política de cancelación'
          }}
        />
      </div>
    </div>
  );
}
