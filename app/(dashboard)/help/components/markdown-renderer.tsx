'use client';

import { isValidElement, cloneElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  CodeIcon,
  InfoIcon,
  WarningIcon,
  CheckCircleIcon,
} from '@/components/icons';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Helper function to generate heading IDs
  const generateHeadingId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Helper function to check for callout types in children
  const hasCalloutType = (children: React.ReactNode, type: string): boolean => {
    // Check if children is a string and contains the callout type
    if (typeof children === 'string' && children.includes(type)) {
      return true;
    }

    // Check if children is an array
    if (Array.isArray(children)) {
      return children.some((child) => {
        if (typeof child === 'string') {
          return child.includes(type);
        }
        if (isValidElement(child)) {
          const props = child.props as any;
          return hasCalloutType(props.children, type);
        }
        return false;
      });
    }

    // Check if children is a React element
    if (isValidElement(children)) {
      const props = children.props as any;
      return hasCalloutType(props.children, type);
    }

    return false;
  };

  // Helper function to remove callout type from children
  const removeCalloutType = (
    children: React.ReactNode,
    type: string,
  ): React.ReactNode => {
    // If children is a string, replace the callout type
    if (typeof children === 'string') {
      return children.replace(type, '').trim();
    }

    // If children is an array, map through and remove the callout type from each child
    if (Array.isArray(children)) {
      return children.map((child) => {
        if (typeof child === 'string') {
          return child.replace(type, '').trim();
        }
        if (isValidElement(child)) {
          const props = child.props as any;
          return cloneElement(child as React.ReactElement<any>, {
            children: removeCalloutType(props.children, type),
          });
        }
        return child;
      });
    }

    // If children is a React element, clone it with the callout type removed from its children
    if (isValidElement(children)) {
      const props = children.props as any;
      return cloneElement(children as React.ReactElement<any>, {
        children: removeCalloutType(props.children, type),
      });
    }

    return children;
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Custom heading renderer with anchor links
        h1: ({ children, ...props }) => {
          const id = generateHeadingId(children?.toString() || '');
          return (
            <h1 id={id} className="scroll-mt-6" {...props}>
              {children}
            </h1>
          );
        },
        h2: ({ children, ...props }) => {
          const id = generateHeadingId(children?.toString() || '');
          return (
            <h2 id={id} className="scroll-mt-6" {...props}>
              {children}
            </h2>
          );
        },
        h3: ({ children, ...props }) => {
          const id = generateHeadingId(children?.toString() || '');
          return (
            <h3 id={id} className="scroll-mt-6" {...props}>
              {children}
            </h3>
          );
        },
        h4: ({ children, ...props }) => {
          const id = generateHeadingId(children?.toString() || '');
          return (
            <h4 id={id} className="scroll-mt-6" {...props}>
              {children}
            </h4>
          );
        },
        h5: ({ children, ...props }) => {
          const id = generateHeadingId(children?.toString() || '');
          return (
            <h5 id={id} className="scroll-mt-6" {...props}>
              {children}
            </h5>
          );
        },
        h6: ({ children, ...props }) => {
          const id = generateHeadingId(children?.toString() || '');
          return (
            <h6 id={id} className="scroll-mt-6" {...props}>
              {children}
            </h6>
          );
        },

        // Custom code block renderer
        code: ({ children, className, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';

          // Check if it's inline code
          if (!className) {
            return (
              <code
                className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <div className="relative">
              <div className="flex items-center justify-between rounded-t-lg bg-muted px-4 py-2">
                <div className="flex items-center gap-2">
                  <CodeIcon size={16} />
                  {language && (
                    <span className="text-sm font-medium capitalize">
                      {language}
                    </span>
                  )}
                </div>
              </div>
              <pre className="overflow-x-auto rounded-b-lg bg-muted/50 p-4">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          );
        },

        // Custom blockquote renderer for callouts
        blockquote: ({ children }) => {
          // Log the content for debugging
          console.log('Blockquote children:', children);

          // Check for callout types using our helper function
          if (hasCalloutType(children, '[!NOTE]')) {
            return (
              <div className="my-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <div className="mt-0.5 shrink-0  text-blue-600 dark:text-blue-400">
                  <InfoIcon size={20} />
                </div>
                <div className="prose prose-sm dark:prose-invert">
                  {removeCalloutType(children, '[!NOTE]')}
                </div>
              </div>
            );
          }

          if (hasCalloutType(children, '[!WARNING]')) {
            return (
              <div className="my-6 flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                <div className="mt-0.5 shrink-0  text-yellow-600 dark:text-yellow-400">
                  <WarningIcon size={20} />
                </div>
                <div className="prose prose-sm dark:prose-invert">
                  {removeCalloutType(children, '[!WARNING]')}
                </div>
              </div>
            );
          }

          if (hasCalloutType(children, '[!TIP]')) {
            return (
              <div className="my-6 flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                <div className="mt-0.5 shrink-0  text-green-600 dark:text-green-400">
                  <CheckCircleIcon size={20} />
                </div>
                <div className="prose prose-sm dark:prose-invert">
                  {removeCalloutType(children, '[!TIP]')}
                </div>
              </div>
            );
          }

          // Default blockquote
          return (
            <blockquote className="mt-6 border-l-2 pl-6 italic">
              {children}
            </blockquote>
          );
        },

        // Custom table renderer
        table: ({ children }) => (
          <div className="my-6 overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              {children}
            </table>
          </div>
        ),

        th: ({ children }) => (
          <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
            {children}
          </th>
        ),

        td: ({ children }) => (
          <td className="border border-border px-4 py-2">{children}</td>
        ),

        // Custom link renderer
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary underline underline-offset-4 hover:text-primary/80"
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
