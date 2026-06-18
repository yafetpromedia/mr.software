export const AFRICA_ORANGE = "#FF7A1A";

export const HUB = {
  lat: 9.032,
  lng: 38.746,
  label: "Addis Ababa",
  flag: "🇪🇹",
};

export type DeploymentArc = {
  id: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  product: string;
  endLabel: string;
  endFlag: string;
};

export const DEPLOYMENT_ARCS: DeploymentArc[] = [
  {
    id: "campusone-ke",
    startLat: HUB.lat,
    startLng: HUB.lng,
    endLat: -1.292,
    endLng: 36.822,
    product: "CampusOne",
    endLabel: "Kenya",
    endFlag: "🇰🇪",
  },
  {
    id: "campusone-ng",
    startLat: HUB.lat,
    startLng: HUB.lng,
    endLat: 6.524,
    endLng: 3.379,
    product: "CampusOne",
    endLabel: "Nigeria",
    endFlag: "🇳🇬",
  },
  {
    id: "mrinvoice-za",
    startLat: HUB.lat,
    startLng: HUB.lng,
    endLat: -26.204,
    endLng: 28.047,
    product: "Mr.Invoice",
    endLabel: "South Africa",
    endFlag: "🇿🇦",
  },
  {
    id: "healthlink-de",
    startLat: HUB.lat,
    startLng: HUB.lng,
    endLat: 52.52,
    endLng: 13.405,
    product: "HealthLink",
    endLabel: "Germany",
    endFlag: "🇩🇪",
  },
  {
    id: "healthlink-us",
    startLat: HUB.lat,
    startLng: HUB.lng,
    endLat: 40.713,
    endLng: -74.006,
    product: "HealthLink",
    endLabel: "USA",
    endFlag: "🇺🇸",
  },
];

export const ORBIT_PRODUCTS = [
  { id: "campusone", name: "CampusOne", speed: 0.22, phase: 0 },
  { id: "mr-invoice", name: "Mr.Invoice", speed: 0.17, phase: 1.4 },
  { id: "healthlink", name: "HealthLink", speed: 0.19, phase: 2.8 },
  { id: "educloud", name: "EduCloud", speed: 0.15, phase: 4.2 },
];

export type WorldActivity = {
  id: string;
  flag: string;
  country: string;
  message: string;
  /** CSS position around the globe frame */
  position: string;
  unlockAtCountryIndex: number;
};

export const WORLD_ACTIVITIES: WorldActivity[] = [
  {
    id: "ke",
    flag: "🇰🇪",
    country: "Kenya",
    message: "CampusOne Active",
    position: "left-[54%] top-[38%]",
    unlockAtCountryIndex: 2,
  },
  {
    id: "ng",
    flag: "🇳🇬",
    country: "Nigeria",
    message: "New Deployment",
    position: "left-[42%] top-[48%]",
    unlockAtCountryIndex: 3,
  },
  {
    id: "de",
    flag: "🇩🇪",
    country: "Germany",
    message: "Mr.Invoice Sold",
    position: "right-[18%] top-[36%]",
    unlockAtCountryIndex: 5,
  },
  {
    id: "us",
    flag: "🇺🇸",
    country: "USA",
    message: "Global Product",
    position: "right-[12%] top-[44%]",
    unlockAtCountryIndex: 6,
  },
  {
    id: "za",
    flag: "🇿🇦",
    country: "South Africa",
    message: "Subscription Live",
    position: "left-[48%] top-[58%]",
    unlockAtCountryIndex: 4,
  },
];

export type LaunchStoryStep = {
  atMs: number;
  icon: string;
  text: string;
  activeArcs: number;
  litCountries: number;
  revenueBoost: number;
  travelArcId?: string;
  travelMs?: number;
};

export const LAUNCH_STORY: LaunchStoryStep[] = [
  { atMs: 0, icon: "🌍", text: "Africa glows — origin of software", activeArcs: 0, litCountries: 1, revenueBoost: 0 },
  { atMs: 2000, icon: "📤", text: "Developer uploads software", activeArcs: 0, litCountries: 1, revenueBoost: 0 },
  { atMs: 3500, icon: "🚀", text: "CampusOne published", activeArcs: 0, litCountries: 1, revenueBoost: 0 },
  {
    atMs: 4500,
    icon: "🛰️",
    text: "Deployed to Kenya",
    activeArcs: 1,
    litCountries: 2,
    revenueBoost: 0,
    travelArcId: "campusone-ke",
    travelMs: 2800,
  },
  {
    atMs: 7500,
    icon: "💰",
    text: "First subscription sold · +$29",
    activeArcs: 1,
    litCountries: 2,
    revenueBoost: 29,
  },
  {
    atMs: 8500,
    icon: "🌍",
    text: "Nigeria reached",
    activeArcs: 2,
    litCountries: 3,
    revenueBoost: 29,
    travelArcId: "campusone-ng",
    travelMs: 2600,
  },
  {
    atMs: 11500,
    icon: "🇩🇪",
    text: "Germany reached",
    activeArcs: 4,
    litCountries: 5,
    revenueBoost: 78,
    travelArcId: "healthlink-de",
    travelMs: 3000,
  },
  {
    atMs: 14500,
    icon: "📈",
    text: "Revenue climbing globally",
    activeArcs: 5,
    litCountries: 6,
    revenueBoost: 1200,
    travelArcId: "healthlink-us",
    travelMs: 3200,
  },
  {
    atMs: 18000,
    icon: "🌎",
    text: "One Platform. Infinite Possibilities.",
    activeArcs: 5,
    litCountries: 7,
    revenueBoost: 4500,
  },
];

export const COMMAND_STATS = {
  developers: 1200,
  products: 340,
  countries: 52,
  revenue: 45000,
};

export const COUNTRY_POINTS = [
  { lat: HUB.lat, lng: HUB.lng, size: 1.4, label: "Ethiopia", flag: "🇪🇹" },
  { lat: -1.292, lng: 36.822, size: 0.75, label: "Kenya", flag: "🇰🇪" },
  { lat: 6.524, lng: 3.379, size: 0.85, label: "Nigeria", flag: "🇳🇬" },
  { lat: -26.204, lng: 28.047, size: 0.7, label: "South Africa", flag: "🇿🇦" },
  { lat: 52.52, lng: 13.405, size: 0.65, label: "Germany", flag: "🇩🇪" },
  { lat: 40.713, lng: -74.006, size: 0.8, label: "USA", flag: "🇺🇸" },
  { lat: 30.044, lng: 31.235, size: 0.6, label: "Egypt", flag: "🇪🇬" },
];

/** @deprecated Use LAUNCH_STORY */
export const STORY_TIMELINE = LAUNCH_STORY.map((s, i) => ({
  id: i,
  atMs: s.atMs,
  message: s.text,
  activeArcs: s.activeArcs,
  litCountries: s.litCountries,
  revenueBoost: s.revenueBoost,
}));
