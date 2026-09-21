import { NextRequest, NextResponse } from 'next/server';
import { getVedaraKB, TRIP_PLANNER_PROMPT } from '@/lib/vedara-kb';

export async function POST(req: NextRequest) {
  try {
    const { days, interests, travelStyle, groupType, budget, travelDates, specialRequests } = await req.json();

    const kb = await getVedaraKB();

    const selectedCottages = interests === 'wellness'
      ? kb.cottages.filter(c => c.category?.includes('Mountain View'))
      : interests === 'family'
        ? kb.cottages.filter(c => c.category?.includes('Duplex'))
        : kb.cottages;

    const cheapest = [...selectedCottages].sort((a, b) => a.pricePerNight - b.pricePerNight)[0] || kb.cottages[0];

    const itinerary = generateSmartItinerary({
      days: days || 3,
      interests: interests || 'adventure',
      travelStyle: travelStyle || 'balanced',
      groupType: groupType || 'couple',
      budget: budget || 'moderate',
      travelDates: travelDates || '',
      specialRequests: specialRequests || '',
      cottage: cheapest,
      kb,
    });

    return NextResponse.json(itinerary);
  } catch (error: any) {
    console.error('Trip planner API error:', error);
    return NextResponse.json({ error: 'Failed to generate itinerary' }, { status: 500 });
  }
}

interface TripParams {
  days: number;
  interests: string;
  travelStyle: string;
  groupType: string;
  budget: string;
  travelDates: string;
  specialRequests: string;
  cottage: any;
  kb: any;
}

function generateSmartItinerary(params: TripParams) {
  const { days, interests, travelStyle, groupType, budget, travelDates, specialRequests, cottage, kb } = params;

  const titles: Record<string, string> = {
    adventure: 'Himalayan Adventure Escape',
    wellness: 'Mountain Wellness Retreat',
    romance: 'Romantic Mountain Getaway',
    family: 'Family Mountain Adventure',
    culture: 'Jibhi Cultural Immersion',
  };

  const breakfastItems = kb.menu
    .flatMap((c: any) => c.items || [])
    .filter((i: any) => i.category?.toLowerCase().includes('breakfast') || i.name?.toLowerCase().includes('dosa') || i.name?.toLowerCase().includes('omelette') || i.name?.toLowerCase().includes('pancake'))
    .slice(0, 6);

  const lunchItems = kb.menu
    .flatMap((c: any) => c.items || [])
    .filter((i: any) => i.category?.toLowerCase().includes('lunch') || i.name?.toLowerCase().includes('rice') || i.name?.toLowerCase().includes('thali'))
    .slice(0, 4);

  const dinnerItems = kb.menu
    .flatMap((c: any) => c.items || [])
    .filter((i: any) => i.category?.toLowerCase().includes('dinner') || i.name?.toLowerCase().includes('pasta') || i.name?.toLowerCase().includes('momos'))
    .slice(0, 4);

  const itinerary: any[] = [];

  if (days === 1) {
    itinerary.push({
      day: 'Day 1 – Quick Mountain Escape',
      activities: [
        { time: '1:00 PM', activity: 'Arrive & check in to The Vedara', icon: 'Compass', location: 'The Vedara, Ghiyagi' },
        { time: '2:00 PM', activity: `Relax at your cottage: ${cottage?.name || 'Cottage'}`, icon: 'Mountain', location: cottage?.name || 'The Vedara' },
        { time: '4:00 PM', activity: 'Walk to Jibhi Waterfall', icon: 'MapPin', location: 'Jibhi Waterfall' },
        { time: '7:00 PM', activity: 'Candlelit dinner at The Perch', icon: 'Coffee', location: 'The Perch' },
      ],
    });
  } else if (days === 2) {
    itinerary.push({
      day: 'Day 1 – Arrival & Exploration',
      activities: [
        { time: '1:00 PM', activity: 'Arrive & check in', icon: 'Compass', location: 'The Vedara' },
        { time: '3:00 PM', activity: 'Explore Mini Thailand riverbed', icon: 'MapPin', location: 'Mini Thailand' },
        { time: '5:30 PM', activity: 'Sunset coffee at The Perch', icon: 'Coffee', location: 'The Perch' },
        { time: '8:00 PM', activity: 'Bonfire & stargazing night', icon: 'Star', location: 'The Vedara Garden' },
      ],
    });
    itinerary.push({
      day: 'Day 2 – Trek & Departure',
      activities: [
        { time: '7:00 AM', activity: 'Sunrise yoga on cottage balcony', icon: 'Sparkles', location: cottage?.name || 'The Vedara' },
        { time: '9:00 AM', activity: 'Breakfast at The Perch', icon: 'Coffee', location: 'The Perch' },
        { time: '11:00 AM', activity: 'Check out & drive to Jalori Pass', icon: 'Mountain', location: 'Jalori Pass' },
      ],
    });
  } else if (days === 3) {
    itinerary.push({
      day: 'Day 1 – Arrival & First Impressions',
      activities: [
        { time: '1:00 PM', activity: 'Arrive & settle into The Vedara', icon: 'Compass', location: 'The Vedara' },
        { time: '3:00 PM', activity: 'Gentle walk through Ghiyagi village', icon: 'MapPin', location: 'Ghiyagi Village' },
        { time: '5:30 PM', activity: 'Golden hour coffee at The Perch', icon: 'Coffee', location: 'The Perch' },
        { time: '8:00 PM', activity: 'Bonfire night under the stars', icon: 'Star', location: 'The Vedara' },
      ],
    });
    itinerary.push({
      day: 'Day 2 – Deep Himalayan Immersion',
      activities: [
        { time: '7:30 AM', activity: 'Breakfast at The Perch', icon: 'Coffee', location: 'The Perch' },
        { time: '9:30 AM', activity: 'Drive to Jalori Pass (10 km)', icon: 'Mountain', location: 'Jalori Pass' },
        { time: '12:00 PM', activity: 'Trek to Serolsar Lake', icon: 'TreePine', location: 'Serolsar Lake' },
        { time: '4:00 PM', activity: 'Lunch at a local dhaba', icon: 'Coffee', location: 'Local Dhaba' },
        { time: '7:00 PM', activity: 'Dinner at The Perch', icon: 'Coffee', location: 'The Perch' },
      ],
    });
    itinerary.push({
      day: 'Day 3 – Nature & Farewell',
      activities: [
        { time: '7:00 AM', activity: 'Early morning nature walk', icon: 'TreePine', location: 'Cedar Forest Trail' },
        { time: '9:00 AM', activity: 'Breakfast & packing', icon: 'Coffee', location: 'The Perch' },
        { time: '11:00 AM', activity: 'Check out & Jibhi Waterfall visit', icon: 'MapPin', location: 'Jibhi Waterfall' },
        { time: '1:00 PM', activity: 'Depart with memories!', icon: 'Sparkles', location: 'The Vedara' },
      ],
    });
  } else {
    // 4+ days
    itinerary.push({
      day: 'Day 1 – Arrival & Village Life',
      activities: [
        { time: '1:00 PM', activity: 'Arrive & check in to The Vedara', icon: 'Compass', location: 'The Vedara' },
        { time: '3:00 PM', activity: 'Stroll through Ghiyagi village', icon: 'MapPin', location: 'Ghiyagi' },
        { time: '5:30 PM', activity: 'Sunset tea at The Perch', icon: 'Coffee', location: 'The Perch' },
        { time: '8:00 PM', activity: 'Welcome bonfire & music night', icon: 'Star', location: 'The Vedara' },
      ],
    });
    itinerary.push({
      day: 'Day 2 – High Altitude Adventures',
      activities: [
        { time: '7:30 AM', activity: 'Hearty mountain breakfast', icon: 'Coffee', location: 'The Perch' },
        { time: '9:00 AM', activity: 'Drive to Jalori Pass (10 km)', icon: 'Mountain', location: 'Jalori Pass' },
        { time: '10:00 AM', activity: 'Trek to Serolsar Lake', icon: 'TreePine', location: 'Serolsar Lake' },
        { time: '2:00 PM', activity: 'Lunch at a mountain dhaba', icon: 'Coffee', location: 'Local Dhaba' },
        { time: '7:00 PM', activity: 'Dinner at The Perch', icon: 'Coffee', location: 'The Perch' },
      ],
    });
    itinerary.push({
      day: 'Day 3 – Great Himalayan National Park',
      activities: [
        { time: '7:30 AM', activity: 'Breakfast & pack day bag', icon: 'Coffee', location: 'The Perch' },
        { time: '9:00 AM', activity: 'Guided GHNP nature walk', icon: 'TreePine', location: 'Great Himalayan National Park' },
        { time: '1:00 PM', activity: 'Picnic lunch in the park', icon: 'Coffee', location: 'GHNP' },
        { time: '5:00 PM', activity: 'Return & rest at cottage', icon: 'Mountain', location: cottage?.name || 'The Vedara' },
        { time: '8:00 PM', activity: 'Stargazing session', icon: 'Star', location: 'The Vedara' },
      ],
    });
    if (days >= 4) {
      itinerary.push({
        day: 'Day 4 – Waterfall & Farewell',
        activities: [
          { time: '7:00 AM', activity: 'Morning yoga on balcony', icon: 'Sparkles', location: cottage?.name || 'The Vedara' },
          { time: '8:30 AM', activity: 'Final breakfast at The Perch', icon: 'Coffee', location: 'The Perch' },
          { time: '10:00 AM', activity: 'Visit Jibhi Waterfall', icon: 'MapPin', location: 'Jibhi Waterfall' },
          { time: '11:00 AM', activity: 'Check out', icon: 'Compass', location: 'The Vedara' },
          { time: '12:00 PM', activity: 'Depart with mountain memories!', icon: 'Sparkles', location: 'The Vedara' },
        ],
      });
    }
    if (days >= 5) {
      itinerary.push({
        day: 'Day 5 – Lambhari Top & Local Culture',
        activities: [
          { time: '6:00 AM', activity: 'Early breakfast', icon: 'Coffee', location: 'The Perch' },
          { time: '7:00 AM', activity: 'Trek to Lambhari Top for sunrise', icon: 'Mountain', location: 'Lambhari Top' },
          { time: '11:00 AM', activity: 'Visit local Himachali temple', icon: 'MapPin', location: 'Ghiyagi Village' },
          { time: '2:00 PM', activity: 'Lunch at The Perch', icon: 'Coffee', location: 'The Perch' },
          { time: '4:00 PM', activity: 'Kids Zone activities', icon: 'Users', location: 'The Vedara' },
          { time: '8:00 PM', activity: 'Farewell dinner', icon: 'Coffee', location: 'The Perch' },
        ],
      });
    }
  }

  const totalCost = (cottage?.pricePerNight || 5000) * days + (days * 1500) + 500;

  return {
    title: titles[interests] || 'Your Himalayan Adventure',
    description: `${days} days of mountain magic at The Vedara retreat in Jibhi. A perfect blend of ${interests === 'wellness' ? 'peace and rejuvenation' : interests === 'romance' ? 'romance and nature' : 'adventure and relaxation'} in the heart of Himachal Pradesh.`,
    cottage: cottage?.name || 'Monal Haven',
    cottagePrice: `₹${cottage?.pricePerNight || 5000}/night`,
    totalEstimate: `₹${totalCost.toLocaleString()} (${days} nights + meals + activities)`,
    itinerary,
    tips: [
      days >= 3 ? 'Book Jalori Pass visit for clear mornings — best views before 10 AM.' : 'Carry a light jacket even in summer — mountain evenings are cool.',
      'Try the Himalayan Cold Coffee at The Perch — a guest favourite!',
      'Carry cash — ATMs are limited in Jibhi village.',
      'Carry comfortable walking shoes for treks and village walks.',
      specialRequests?.toLowerCase().includes('kid') ? 'Kids under 5 stay free! The Kids Zone has supervised activities.' : 'Download offline maps — mobile signal can be spotty on treks.',
    ],
  };
}
