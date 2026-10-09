import type { Place } from './places';

// Widely searched cities without a zone of their own, mapped to the zone
// they use. Add to this list freely.
export const aliases: readonly Place[] = [
  { city: 'Abu Dhabi', zone: 'Asia/Dubai' },
  { city: 'Bangalore', zone: 'Asia/Kolkata' },
  { city: 'Barcelona', zone: 'Europe/Madrid' },
  { city: 'Beijing', zone: 'Asia/Shanghai' },
  { city: 'Boston', zone: 'America/New_York' },
  { city: 'Canberra', zone: 'Australia/Sydney' },
  { city: 'Cape Town', zone: 'Africa/Johannesburg' },
  { city: 'Dallas', zone: 'America/Chicago' },
  { city: 'Delhi', zone: 'Asia/Kolkata' },
  { city: 'Edinburgh', zone: 'Europe/London' },
  { city: 'Frankfurt', zone: 'Europe/Berlin' },
  { city: 'Geneva', zone: 'Europe/Zurich' },
  { city: 'Houston', zone: 'America/Chicago' },
  { city: 'Milan', zone: 'Europe/Rome' },
  { city: 'Montreal', zone: 'America/Toronto' },
  { city: 'Mumbai', zone: 'Asia/Kolkata' },
  { city: 'Osaka', zone: 'Asia/Tokyo' },
  { city: 'Rio de Janeiro', zone: 'America/Sao_Paulo' },
  { city: 'San Francisco', zone: 'America/Los_Angeles' },
  { city: 'Seattle', zone: 'America/Los_Angeles' },
  { city: 'Washington', zone: 'America/New_York' },
  { city: 'Wellington', zone: 'Pacific/Auckland' },
];
