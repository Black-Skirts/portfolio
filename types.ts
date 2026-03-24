
export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
}

export enum Category {
  All = 'All',
  Branding = 'Branding',
  UXUI = 'UX/UI',
  Video = 'Video',
  Editorial = 'Editorial',
  PDP = 'PDP'
}
