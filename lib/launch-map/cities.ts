export type MapCity = {
  id: string;
  city: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
};

/** African origin cities for builder launches */
export const AFRICAN_ORIGIN_CITIES: MapCity[] = [
  { id: "addis", city: "Addis Ababa", country: "Ethiopia", flag: "🇪🇹", lat: 9.032, lng: 38.746 },
  { id: "nairobi", city: "Nairobi", country: "Kenya", flag: "🇰🇪", lat: -1.292, lng: 36.822 },
  { id: "lagos", city: "Lagos", country: "Nigeria", flag: "🇳🇬", lat: 6.524, lng: 3.379 },
  { id: "cairo", city: "Cairo", country: "Egypt", flag: "🇪🇬", lat: 30.044, lng: 31.235 },
  { id: "accra", city: "Accra", country: "Ghana", flag: "🇬🇭", lat: 5.603, lng: -0.187 },
  { id: "kigali", city: "Kigali", country: "Rwanda", flag: "🇷🇼", lat: -1.94, lng: 29.874 },
  { id: "johannesburg", city: "Johannesburg", country: "South Africa", flag: "🇿🇦", lat: -26.204, lng: 28.047 },
  { id: "casablanca", city: "Casablanca", country: "Morocco", flag: "🇲🇦", lat: 33.573, lng: -7.589 },
  { id: "kampala", city: "Kampala", country: "Uganda", flag: "🇺🇬", lat: 0.347, lng: 32.582 },
  { id: "dakar", city: "Dakar", country: "Senegal", flag: "🇸🇳", lat: 14.693, lng: -17.444 },
];

/** Global reach destinations */
export const GLOBAL_DESTINATION_CITIES: MapCity[] = [
  { id: "london", city: "London", country: "United Kingdom", flag: "🇬🇧", lat: 51.507, lng: -0.128 },
  { id: "berlin", city: "Berlin", country: "Germany", flag: "🇩🇪", lat: 52.52, lng: 13.405 },
  { id: "nyc", city: "New York", country: "USA", flag: "🇺🇸", lat: 40.713, lng: -74.006 },
  { id: "toronto", city: "Toronto", country: "Canada", flag: "🇨🇦", lat: 43.653, lng: -79.383 },
  { id: "sydney", city: "Sydney", country: "Australia", flag: "🇦🇺", lat: -33.868, lng: 151.209 },
  { id: "tokyo", city: "Tokyo", country: "Japan", flag: "🇯🇵", lat: 35.676, lng: 139.65 },
  { id: "mumbai", city: "Mumbai", country: "India", flag: "🇮🇳", lat: 19.076, lng: 72.877 },
  { id: "saopaulo", city: "São Paulo", country: "Brazil", flag: "🇧🇷", lat: -23.55, lng: -46.633 },
  { id: "paris", city: "Paris", country: "France", flag: "🇫🇷", lat: 48.857, lng: 2.352 },
  { id: "dubai", city: "Dubai", country: "UAE", flag: "🇦🇪", lat: 25.204, lng: 55.271 },
  { id: "singapore", city: "Singapore", country: "Singapore", flag: "🇸🇬", lat: 1.352, lng: 103.819 },
  { id: "mexico", city: "Mexico City", country: "Mexico", flag: "🇲🇽", lat: 19.432, lng: -99.133 },
];

export function pickFromList<T>(list: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return list[h % list.length]!;
}
