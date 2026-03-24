
import { Project, Category } from './types';

export const PROJECTS: Project[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `project-${i}`,
  title: 'Pledis Corporate Identity Renewal (2025)',
  subtitle: 'Brand Identity, Website, Motion, Digital Design',
  category: i % 2 === 0 ? Category.Branding : Category.UXUI,
  imageUrl: 'https://picsum.photos/1000/1000?random=' + i
}));

export const CATEGORIES = Object.values(Category);

export const GRID_CONFIG = {
  desktop: {
    columns: 12,
    margin: 'px-10', // 40px
    gutter: 'gap-3' // 12px
  },
  tabletLg: {
    columns: 12,
    margin: 'px-8', // 32px
    gutter: 'gap-3' // 12px
  },
  tabletSm: {
    columns: 8,
    margin: 'px-6', // 24px
    gutter: 'gap-3' // 12px
  },
  mobile: {
    columns: 4,
    margin: 'px-4', // 16px
    gutter: 'gap-3' // 12px
  }
};
