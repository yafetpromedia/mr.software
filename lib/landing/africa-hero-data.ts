export const AFRICA_ORANGE = "#FF7A1A";

export const ARC_ANIMATE_MS = 3200;
export const ARC_ALTITUDE = 0.2;
/** Visible length of each moving energy packet (0–1 along arc). */
export const ARC_TRAIL_LENGTH = 0.26;

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
    id: "campusone-eg",
    startLat: HUB.lat,
    startLng: HUB.lng,
    endLat: 30.044,
    endLng: 31.235,
    product: "CampusOne",
    endLabel: "Egypt",
    endFlag: "🇪🇬",
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
];

export const ORBIT_PRODUCTS = [
  { id: "campusone", name: "CampusOne", speed: 0.22, phase: 0 },
  { id: "mr-invoice", name: "Mr.Invoice", speed: 0.17, phase: 1.4 },
  { id: "healthlink", name: "HealthLink", speed: 0.19, phase: 2.8 },
  { id: "educloud", name: "EduCloud", speed: 0.15, phase: 4.2 },
];

export const HERO_PRODUCTS = [
  {
    id: "campusone",
    name: "CampusOne",
    countries: 12,
    metric: "$8.2k",
    metricLabel: "MRR",
    status: "Live",
  },
  {
    id: "mr-invoice",
    name: "Mr.Invoice",
    countries: 24,
    metric: "$12k",
    metricLabel: "MRR",
    status: "Scaling",
  },
  {
    id: "healthlink",
    name: "HealthLink",
    countries: 8,
    metric: "$4.1k",
    metricLabel: "MRR",
    status: "Deployed",
  },
  {
    id: "educloud",
    name: "EduCloud",
    countries: 6,
    metric: "$2.4k",
    metricLabel: "MRR",
    status: "Growing",
  },
];

export type LiveEvent = {
  id: string;
  icon: string;
  title: string;
  detail: string;
};

export const LIVE_EVENTS: LiveEvent[] = [
  { id: "deploy-ke", icon: "🚀", title: "New Deployment", detail: "CampusOne → Kenya" },
  { id: "sale-de", icon: "💰", title: "New Sale", detail: "HealthLink · Germany" },
  { id: "customer-us", icon: "🌍", title: "New Customer", detail: "CampusOne · USA" },
  { id: "revenue", icon: "📈", title: "Revenue +$49", detail: "Mr.Invoice subscription" },
  { id: "deploy-ng", icon: "🚀", title: "New Deployment", detail: "EduCloud → Nigeria" },
  { id: "sale-za", icon: "💰", title: "SaaS Sold", detail: "Mr.Invoice · South Africa" },
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
  energyPulse?: boolean;
  showGlobe?: boolean;
  orbitProducts?: number;
};

export const LAUNCH_STORY: LaunchStoryStep[] = [
  {
    atMs: 0,
    icon: "🌑",
    text: "Initializing global platform…",
    activeArcs: 0,
    litCountries: 0,
    revenueBoost: 0,
    showGlobe: false,
    orbitProducts: 0,
  },
  {
    atMs: 1000,
    icon: "🌍",
    text: "Africa lights up — origin of software",
    activeArcs: 0,
    litCountries: 1,
    revenueBoost: 0,
    showGlobe: false,
    orbitProducts: 0,
  },
  {
    atMs: 2000,
    icon: "🛰️",
    text: "Globe online — mission control active",
    activeArcs: 0,
    litCountries: 1,
    revenueBoost: 0,
    showGlobe: true,
    orbitProducts: 1,
  },
  {
    atMs: 3000,
    icon: "⚡",
    text: "Energy pulse from Ethiopia hub",
    activeArcs: 0,
    litCountries: 1,
    revenueBoost: 0,
    energyPulse: true,
    showGlobe: true,
    orbitProducts: 2,
  },
  {
    atMs: 4000,
    icon: "🚀",
    text: "CampusOne launching…",
    activeArcs: 0,
    litCountries: 1,
    revenueBoost: 0,
    showGlobe: true,
    orbitProducts: 2,
    travelArcId: "campusone-ke",
    travelMs: 2400,
  },
  {
    atMs: 5000,
    icon: "🇰🇪",
    text: "Kenya reached · deployment live",
    activeArcs: 1,
    litCountries: 2,
    revenueBoost: 0,
    showGlobe: true,
    orbitProducts: 3,
  },
  {
    atMs: 6000,
    icon: "🇩🇪",
    text: "Germany reached · global sale",
    activeArcs: 2,
    litCountries: 4,
    revenueBoost: 29,
    showGlobe: true,
    orbitProducts: 4,
    travelArcId: "healthlink-de",
    travelMs: 2600,
  },
  {
    atMs: 7000,
    icon: "💰",
    text: "SaaS Sold · +$49 revenue",
    activeArcs: 3,
    litCountries: 5,
    revenueBoost: 49,
    showGlobe: true,
    orbitProducts: 4,
  },
  {
    atMs: 9000,
    icon: "🇪🇬",
    text: "Egypt customer acquired",
    activeArcs: 4,
    litCountries: 6,
    revenueBoost: 120,
    showGlobe: true,
    orbitProducts: 4,
    travelArcId: "campusone-eg",
    travelMs: 2800,
  },
  {
    atMs: 12000,
    icon: "📈",
    text: "Revenue climbing globally",
    activeArcs: 5,
    litCountries: 7,
    revenueBoost: 1200,
    showGlobe: true,
    orbitProducts: 4,
  },
  {
    atMs: 16000,
    icon: "🌎",
    text: "One Platform. Infinite Possibilities.",
    activeArcs: 5,
    litCountries: 7,
    revenueBoost: 4500,
    showGlobe: true,
    orbitProducts: 4,
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
