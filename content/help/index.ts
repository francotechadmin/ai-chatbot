export interface ArticleFrontmatter {
  title: string;
  summary: string;
  category: string;
  readTime: string;
  lastUpdated: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  author?: string;
  featured?: boolean;
  order?: number;
}

export interface Article {
  slug: string;
  frontmatter: ArticleFrontmatter;
  content: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

export const categories: ArticleCategory[] = [
  {
    id: 'basics',
    name: 'Basics',
    description: 'Getting started guides and fundamentals',
    icon: 'FileIcon',
    color: 'blue',
    order: 1,
  },
  {
    id: 'guides',
    name: 'Guides',
    description: 'Step-by-step tutorials and how-tos',
    icon: 'BookIcon',
    color: 'green',
    order: 2,
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Advanced features and techniques',
    icon: 'CogIcon',
    color: 'purple',
    order: 3,
  },
  {
    id: 'administration',
    name: 'Administration',
    description: 'User management and system configuration',
    icon: 'UsersIcon',
    color: 'orange',
    order: 4,
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Connect with external tools and services',
    icon: 'GlobeIcon',
    color: 'indigo',
    order: 5,
  },
  {
    id: 'api',
    name: 'API',
    description: 'Developer documentation and API reference',
    icon: 'CodeIcon',
    color: 'gray',
    order: 6,
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Troubleshooting and problem resolution',
    icon: 'MessageIcon',
    color: 'amber',
    order: 6,
  },
];
