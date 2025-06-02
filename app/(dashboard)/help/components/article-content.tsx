'use client';

import type { Article } from '@/content/help';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UserIcon } from '@/components/icons';
import { MarkdownRenderer } from './markdown-renderer';

// Custom icons for article metadata
const CalendarIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    height={size}
    strokeLinejoin="round"
    viewBox="0 0 16 16"
    width={size}
    style={{ color: 'currentcolor' }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.5 1V0H3V1V2H1.5H0V3.5V4.5V14.5V16H1.5H14.5H16V14.5V4.5V3.5V2H14.5H13V1V0H11.5V1V2H4.5V1ZM1.5 4.5V3.5H3H4.5H11.5H13H14.5V4.5V6H1.5V4.5ZM1.5 7.5H14.5V14.5H1.5V7.5ZM4 9.25H5.5V10.75H4V9.25ZM7.25 9.25H8.75V10.75H7.25V9.25ZM11 9.25H12.5V10.75H11V9.25ZM4 11.75H5.5V13.25H4V11.75ZM7.25 11.75H8.75V13.25H7.25V11.75ZM11 11.75H12.5V13.25H11V11.75Z"
      fill="currentColor"
    />
  </svg>
);

const ClockIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    height={size}
    strokeLinejoin="round"
    viewBox="0 0 16 16"
    width={size}
    style={{ color: 'currentcolor' }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM8 1.5C11.5899 1.5 14.5 4.41015 14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5ZM8.75 4V3.25H7.25V4V7.43934L9.96967 10.159L10.5 10.6893L11.5607 9.62868L11.0303 9.09835L8.75 6.81066V4Z"
      fill="currentColor"
    />
  </svg>
);

const TagIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    height={size}
    strokeLinejoin="round"
    viewBox="0 0 16 16"
    width={size}
    style={{ color: 'currentcolor' }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 6.17157V1.5V0H2.5H7.17157C7.70201 0 8.21071 0.210714 8.58579 0.585786L15.4142 7.41421C16.1953 8.19526 16.1953 9.46474 15.4142 10.2458L10.2458 15.4142C9.46474 16.1953 8.19526 16.1953 7.41421 15.4142L0.585786 8.58579C0.210714 8.21071 0 7.70201 0 7.17157V6.17157V1ZM2.5 1.5V6.17157L9.32843 13L14.5 7.82843L7.67157 1H2.5ZM5.5 6C6.32843 6 7 5.32843 7 4.5C7 3.67157 6.32843 3 5.5 3C4.67157 3 4 3.67157 4 4.5C4 5.32843 4.67157 6 5.5 6Z"
      fill="currentColor"
    />
  </svg>
);

interface ArticleContentProps {
  article: Article;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const { frontmatter, content } = article;
  const {
    title,
    summary,
    category,
    readTime,
    lastUpdated,
    tags,
    difficulty,
    author,
  } = frontmatter;

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <article className="space-y-6">
      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="capitalize">
            {category}
          </Badge>
          <Badge
            variant="outline"
            className={`capitalize ${getDifficultyColor(difficulty)}`}
          >
            {difficulty}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

        <p className="text-lg text-muted-foreground leading-relaxed">
          {summary}
        </p>

        {/* Article Meta */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ClockIcon size={16} />
                <span>{readTime}</span>
              </div>

              <div className="flex items-center gap-1">
                <CalendarIcon size={16} />
                <span>
                  Updated {new Date(lastUpdated).toLocaleDateString()}
                </span>
              </div>

              {author && (
                <div className="flex items-center gap-1">
                  <UserIcon size={16} />
                  <span>{author}</span>
                </div>
              )}

              {tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <TagIcon size={16} />
                  <div className="flex gap-1">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </header>

      {/* Article Content */}
      <div className="prose prose-gray max-w-none dark:prose-invert">
        <MarkdownRenderer content={content} />
      </div>
    </article>
  );
}
