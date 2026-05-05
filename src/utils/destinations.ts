export interface Destination {
  city: string
  country: string
  lat: number
  lng: number
}

export const POPULAR_DESTINATIONS: Destination[] = [
  // Southeast Asia
  { city: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018 },
  { city: 'Chiang Mai', country: 'Thailand', lat: 18.7883, lng: 98.9853 },
  { city: 'Phuket', country: 'Thailand', lat: 7.8804, lng: 98.3923 },
  { city: 'Koh Samui', country: 'Thailand', lat: 9.5120, lng: 100.0136 },
  { city: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lng: 106.6297 },
  { city: 'Hanoi', country: 'Vietnam', lat: 21.0285, lng: 105.8542 },
  { city: 'Hoi An', country: 'Vietnam', lat: 15.8800, lng: 108.3380 },
  { city: 'Da Nang', country: 'Vietnam', lat: 16.0544, lng: 108.2022 },
  { city: 'Bali', country: 'Indonesia', lat: -8.3405, lng: 115.0920 },
  { city: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456 },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lng: 101.6869 },
  { city: 'Penang', country: 'Malaysia', lat: 5.4141, lng: 100.3288 },
  { city: 'Phnom Penh', country: 'Cambodia', lat: 11.5564, lng: 104.9282 },
  { city: 'Siem Reap', country: 'Cambodia', lat: 13.3633, lng: 103.8560 },
  { city: 'Luang Prabang', country: 'Laos', lat: 19.8845, lng: 102.1348 },
  { city: 'Manila', country: 'Philippines', lat: 14.5995, lng: 120.9842 },
  // East Asia
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { city: 'Osaka', country: 'Japan', lat: 34.6937, lng: 135.5023 },
  { city: 'Kyoto', country: 'Japan', lat: 35.0116, lng: 135.7681 },
  { city: 'Hiroshima', country: 'Japan', lat: 34.3853, lng: 132.4553 },
  { city: 'Fukuoka', country: 'Japan', lat: 33.5904, lng: 130.4017 },
  { city: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780 },
  { city: 'Busan', country: 'South Korea', lat: 35.1796, lng: 129.0756 },
  { city: 'Jeju', country: 'South Korea', lat: 33.4996, lng: 126.5312 },
  { city: 'Hong Kong', country: 'China', lat: 22.3193, lng: 114.1694 },
  { city: 'Taipei', country: 'Taiwan', lat: 25.0330, lng: 121.5654 },
  { city: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737 },
  { city: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074 },
  // South Asia
  { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
  { city: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  { city: 'Goa', country: 'India', lat: 15.2993, lng: 74.1240 },
  { city: 'Kathmandu', country: 'Nepal', lat: 27.7172, lng: 85.3240 },
  { city: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lng: 79.8612 },
  // Middle East
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { city: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
  { city: 'Tel Aviv', country: 'Israel', lat: 32.0853, lng: 34.7818 },
  // Europe
  { city: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417 },
  { city: 'Geneva', country: 'Switzerland', lat: 46.2044, lng: 6.1432 },
  { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
  { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
  { city: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
  { city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
  { city: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393 },
  { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { city: 'Florence', country: 'Italy', lat: 43.7696, lng: 11.2558 },
  { city: 'Venice', country: 'Italy', lat: 45.4408, lng: 12.3155 },
  { city: 'Prague', country: 'Czech Republic', lat: 50.0755, lng: 14.4378 },
  { city: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738 },
  { city: 'Budapest', country: 'Hungary', lat: 47.4979, lng: 19.0402 },
  { city: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275 },
  { city: 'Dubrovnik', country: 'Croatia', lat: 42.6507, lng: 18.0944 },
  // Americas
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
  { city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
  { city: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918 },
  { city: 'Cancun', country: 'Mexico', lat: 21.1619, lng: -86.8515 },
  { city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332 },
  { city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816 },
  { city: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729 },
  // Africa / Oceania
  { city: 'Cape Town', country: 'South Africa', lat: -33.9249, lng: 18.4241 },
  { city: 'Marrakech', country: 'Morocco', lat: 31.6295, lng: -7.9811 },
  { city: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
  { city: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219 },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { city: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631 },
  { city: 'Auckland', country: 'New Zealand', lat: -36.8485, lng: 174.7633 },
]
