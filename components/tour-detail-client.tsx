'use client';

import { useState } from 'react';
import { Star, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import type { TourWithAvailability } from '@/lib/types';

interface TourDetailClientProps {
  tour: TourWithAvailability;
}

export default function TourDetailClient({ tour }: TourDetailClientProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const availableTimesForSelectedDate = tour.availability
    .find(a => a.available_date === selectedDate)?.time_slots as string[] | undefined || [];

  return (
    <div className="bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{tour.title}</h1>
          <div className="flex items-center mt-2 space-x-4 text-sm text-muted-foreground">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
          <div className="col-span-1">
            <Image 
              src={(tour.images as string[])?.[0] || '/placeholder.jpg'}
              alt={tour.title}
              width={800}
              height={600}
              className="rounded-lg object-cover w-full h-full shadow-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {((tour.images as string[]) || []).slice(1, 5).map((img: string, index: number) => (
              <Image 
                key={index}
                src={img}
                alt={`${tour.title} image ${index + 2}`}
                width={400}
                height={300}
                className="rounded-lg object-cover w-full h-full shadow-md"
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">About this tour</h2>
            <p className="text-muted-foreground mb-8 whitespace-pre-wrap">{tour.full_description || tour.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Highlights</h3>
                <ul className="space-y-2">
                  {(tour.highlights as string[] || []).map((highlight, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">What's Included</h3>
                <ul className="space-y-2">
                  {(tour.included as string[] || []).map((item, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Cancellation Policy</h3>
              <p className="text-muted-foreground">{tour.cancellation_policy}</p>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Book Your Tour</CardTitle>
                <p className="text-3xl font-bold text-primary">${tour.price} <span className="text-base font-normal text-muted-foreground">/ person</span></p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="font-semibold mb-2 block">Select Date</label>
                  <div className="grid grid-cols-3 gap-2">
                    {tour.availability.map(avail => (
                      <Button 
                        key={avail.id} 
                        variant={selectedDate === avail.available_date ? 'default' : 'outline'}
                        onClick={() => handleDateSelect(avail.available_date)}
                        disabled={!avail.is_available || avail.available_spots === 0}
                      >
                        {new Date(avail.available_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <label className="font-semibold mb-2 block">Select Time</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimesForSelectedDate.map(time => (
                        <Button 
                          key={time} 
                          variant={selectedTime === time ? 'default' : 'outline'}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="guests" className="font-semibold mb-2 block">Guests</label>
                  <input 
                    type="number"
                    id="guests"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                    min="1"
                    max={tour.max_group_size}
                    className="w-full p-2 border rounded-md bg-input"
                  />
                </div>

                <Button size="lg" className="w-full text-lg">Book Now</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
