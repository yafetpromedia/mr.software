export type StartupPricingPlan = {
  name: string;
  price: string;
  description?: string;
  highlighted?: boolean;
};

export type StartupLandingSection =
  | {
      type: "hero";
      headline: string;
      subheadline: string;
      cta: string;
    }
  | {
      type: "features";
      title: string;
      items: string[];
    }
  | {
      type: "pricing";
      title: string;
      plans: StartupPricingPlan[];
    }
  | {
      type: "cta";
      title: string;
      subtitle: string;
      button: string;
    };

export type GeneratedStartupPayload = {
  name: string;
  tagline: string;
  features: string[];
  pricing: StartupPricingPlan[];
  landingSections: StartupLandingSection[];
  brand: {
    primaryHue: number;
    label: string;
  };
};

export type GeneratedStartupRecord = {
  id: string;
  userId: string;
  idea: string;
  payload: GeneratedStartupPayload;
  createdAt: Date;
};
