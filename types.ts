
export type MediaItem = { kind: 'image'; src: string } | { kind: 'video'; src: string } | { kind: 'vimeo'; id: string; aspect?: string };

export type DetailSection =
  | { type: 'image'; src: string }
  | { type: 'images'; srcs: string[] }
  | { type: 'video'; src: string; scale?: number; clickToPlay?: boolean }
  | { type: 'vimeo'; id: string; aspect?: string; scale?: number }
  | { type: 'media'; items: MediaItem[] }
  | { type: 'interactive' };

export interface CreditRole {
  title: string;
  names: string[];
}

export interface CreditGroup {
  label?: string;
  value?: string;
  valueLink?: string;
  roles: CreditRole[];
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  categories: string[];
  imageUrl: string;
  videos?: string[];
  layout?: 'full' | 'contained';
  comingSoon?: boolean;
  externalUrl?: string;
  transitionColor?: string;
  detailSections?: DetailSection[];
  overview?: string[];
  overviewKr?: string[];
  credits?: CreditGroup[];
}

export enum Category {
  All = 'All',
  Branding = 'Branding',
  UXUI = 'UX/UI',
  Video = 'Video',
  Editorial = 'Editorial',
  PDP = 'PDP'
}
