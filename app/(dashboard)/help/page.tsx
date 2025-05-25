import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { HelpSearchWrapper } from './components/help-search-wrapper';
import { HelpContent, type HelpArticle } from './components/help-content';

// Mock data for help articles - now on the server component
const helpArticles: HelpArticle[] = [
  {
    id: '1',
    title: 'Getting Started with Knowledge Management',
    summary: 'Learn the basics of using the knowledge management system.',
    category: 'basics',
    readTime: '5 min read'
  },
  {
    id: '2',
    title: 'Capturing Knowledge Effectively',
    summary: 'Best practices for documenting and organizing information.',
    category: 'guides',
    readTime: '8 min read'
  },
  {
    id: '3',
    title: 'Advanced Query Techniques',
    summary: 'Learn how to craft effective queries to find exactly what you need.',
    category: 'advanced',
    readTime: '12 min read'
  },
  {
    id: '4',
    title: 'Managing Users and Permissions',
    summary: 'How to set up user roles and manage access to knowledge.',
    category: 'administration',
    readTime: '10 min read'
  },
  {
    id: '5',
    title: 'Integrating with External Systems',
    summary: 'Connect your knowledge base to other tools and platforms.',
    category: 'advanced',
    readTime: '15 min read'
  },
  {
    id: '6',
    title: 'Troubleshooting Common Issues',
    summary: 'Solutions for frequently encountered problems.',
    category: 'support',
    readTime: '7 min read'
  }
];

// Server component that manages the client components
export default function HelpPage({
  searchParams
}: {
  searchParams: { query?: string }
}) {
  // Get search query from URL params (server-side)
  const searchQuery = '';
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Help Center">
          <Button variant="outline">Contact Support</Button>
        </PageHeader>

        {/* Search - Client Component */}
        <Suspense fallback={<div className="h-24 bg-muted/20 animate-pulse rounded-lg" />}>
          <HelpSearchWrapper
            initialQuery={searchQuery}
          />
        </Suspense>

        {/* Content - Client Component */}
        <Suspense fallback={<div className="h-96 bg-muted/20 animate-pulse rounded-lg" />}>
          <HelpContent
            articles={helpArticles}
            searchQuery={searchQuery}
          />
        </Suspense>

        {/* FAQ - Server Component */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Common questions about the knowledge management system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">How do I capture knowledge from existing documents?</h3>
                <p className="text-sm text-muted-foreground">
                  You can import documents using the Import/Export tools section. We support various
                  formats including PDF, Word, Excel, and plain text files. The system will automatically
                  extract content and organize it in your knowledge base.
                </p>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Can I control who sees specific knowledge?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, the system has robust permission controls. You can set visibility at both the
                  category and individual knowledge item levels. Options include private, team-specific,
                  and organization-wide access.
                </p>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">How do I integrate with my existing tools?</h3>
                <p className="text-sm text-muted-foreground">
                  Visit the Integrations Hub to connect with services like Slack, MS Teams, Google Workspace,
                  and more. Most integrations require authentication and can be set up in a few minutes.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">What&apos;s the difference between Capture and Query?</h3>
                <p className="text-sm text-muted-foreground">
                  Knowledge Capture is for documenting and storing information, while Knowledge Query
                  is for retrieving and finding answers from your existing knowledge base.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Tutorials - Server Component */}
        <Card>
          <CardHeader>
            <CardTitle>Video Tutorials</CardTitle>
            <CardDescription>Learn visually with step-by-step guides</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm mb-1">Getting Started Tour</h4>
                  <p className="text-xs text-muted-foreground">3:45</p>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm mb-1">Knowledge Capture Tutorial</h4>
                  <p className="text-xs text-muted-foreground">5:12</p>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm mb-1">Advanced Query Techniques</h4>
                  <p className="text-xs text-muted-foreground">7:33</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support - Server Component */}
        <Card>
          <CardHeader>
            <CardTitle>Need Additional Help?</CardTitle>
            <CardDescription>Our support team is ready to assist you</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="font-medium mb-2">Contact Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get personalized help from our support team with any questions or issues.
              </p>
              <Button>Submit Support Ticket</Button>
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium mb-2">Schedule a Training</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Book a personalized training session for your team to maximize productivity.
              </p>
              <Button variant="outline">Book Session</Button>
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium mb-2">Community Forum</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect with other users to share tips and get advice from the community.
              </p>
              <Button variant="outline">Visit Forum</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}