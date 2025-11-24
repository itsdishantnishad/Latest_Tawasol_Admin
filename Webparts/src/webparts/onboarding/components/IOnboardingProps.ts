export interface IOnboardingCard {
  title: string;
  caption?: string;
  iconUrl: string;
  link?: string;
}

export interface IOnboardingPage {
  heading: string;
  subheading: string;
  cards: IOnboardingCard[];
}

export interface IOnboardingProps {
  pages?: IOnboardingPage[];      // optional; if not passed, component uses defaults
  ctaStartText?: string;          // default: "Let's Get Started"
  onStart?: () => void;           // called on last slide
  className?: string;
}
