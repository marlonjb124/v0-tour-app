import type { Database, Tables } from './database.types';

export type Tour = Tables<'tours'>;
export type TourAvailability = Tables<'tour_availability'>;

export type TourWithAvailability = Tour & {
  availability: TourAvailability[];
};

export type User = Tables<'users'>;
