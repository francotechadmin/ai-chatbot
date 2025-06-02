'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  MessageCircle,
  BookOpen,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  relatedArticles: Array<{
    slug: string;
    title: string;
  }>;
}

const faqData: FAQItem[] = [
  {
    id: 'getting-started-basics',
    question: 'How do I get started with the AI chatbot?',
    answer:
      'Getting started is easy! First, log in to your account and navigate to the chat interface. You can start a new conversation by clicking "New Chat" and selecting your preferred AI model. Begin by typing your question or request in the input field. The AI maintains context throughout your conversation, so you can have natural back-and-forth discussions.',
    category: 'basics',
    tags: ['getting-started', 'chat', 'onboarding'],
    relatedArticles: [
      {
        slug: 'chatbot-getting-started',
        title: 'Getting Started with Your AI Chatbot',
      },
      { slug: 'chat-features', title: 'Chat Features & Capabilities' },
    ],
  },
  {
    id: 'knowledge-base-upload',
    question: 'How do I upload documents to the knowledge base?',
    answer:
      'You can upload documents through the Knowledge Base section. We support various file formats including PDF, Word, Excel, and plain text files. Navigate to the Knowledge Base, click "Upload Documents," select your files, and the system will automatically extract and organize the content. You can set permissions and categories for better organization.',
    category: 'knowledge-base',
    tags: ['upload', 'documents', 'knowledge-base'],
    relatedArticles: [
      { slug: 'knowledge-base', title: 'Knowledge Base Management' },
      { slug: 'integration-setup', title: 'Integration Setup Guide' },
    ],
  },
  {
    id: 'voice-features',
    question: 'Can I use voice input with the chatbot?',
    answer:
      'Yes! The platform supports voice recording for input. Click the microphone icon in the chat input area, speak your message clearly, and click stop when finished. The system will transcribe your speech to text, which you can review and edit before sending. This feature works great for hands-free interaction.',
    category: 'features',
    tags: ['voice', 'recording', 'accessibility'],
    relatedArticles: [
      { slug: 'voice-integration', title: 'Voice Integration Guide' },
      { slug: 'chat-features', title: 'Chat Features & Capabilities' },
    ],
  },
  {
    id: 'file-attachments',
    question: 'What types of files can I attach to conversations?',
    answer:
      'You can attach various file types including documents (PDF, Word, text), images (JPG, PNG, GIF), spreadsheets (Excel, CSV), and code files. The AI can analyze these files and provide insights, answer questions about their content, or help with data analysis. File size limits apply based on your plan.',
    category: 'features',
    tags: ['files', 'attachments', 'analysis'],
    relatedArticles: [
      { slug: 'chat-features', title: 'Chat Features & Capabilities' },
      {
        slug: 'artifacts-guide',
        title: 'Artifacts: Interactive Content Creation',
      },
    ],
  },
  {
    id: 'user-permissions',
    question: 'How do user roles and permissions work?',
    answer:
      'The system has role-based access control with different permission levels. Administrators can manage users, configure system settings, and access all features. Regular users can chat with AI, upload to knowledge base (if permitted), and access analytics. Team leads may have additional permissions for their team members.',
    category: 'administration',
    tags: ['users', 'permissions', 'roles', 'admin'],
    relatedArticles: [
      { slug: 'user-management', title: 'User Management Guide' },
      { slug: 'advanced-troubleshooting', title: 'Advanced Troubleshooting' },
    ],
  },
  {
    id: 'api-access',
    question: 'Is there an API available for integration?',
    answer:
      'Yes, we provide a comprehensive REST API for integration with your existing systems. The API allows you to send messages, retrieve conversation history, upload documents, and access analytics data. Authentication is handled via API keys, and we provide detailed documentation with examples.',
    category: 'api',
    tags: ['api', 'integration', 'development'],
    relatedArticles: [
      { slug: 'api-documentation', title: 'API Documentation' },
      { slug: 'integration-setup', title: 'Integration Setup Guide' },
    ],
  },
  {
    id: 'troubleshooting-common',
    question: 'What should I do if the chatbot is not responding?',
    answer:
      "If the chatbot isn't responding, try these steps: 1) Check your internet connection, 2) Refresh the page, 3) Clear your browser cache, 4) Try a different browser, 5) Check if there are any system status updates. If the issue persists, contact support with details about your browser, operating system, and any error messages.",
    category: 'support',
    tags: ['troubleshooting', 'errors', 'support'],
    relatedArticles: [
      { slug: 'troubleshooting', title: 'Troubleshooting Common Issues' },
      { slug: 'advanced-troubleshooting', title: 'Advanced Troubleshooting' },
    ],
  },
  {
    id: 'analytics-insights',
    question: 'How can I track usage and get insights?',
    answer:
      'The Analytics section provides comprehensive insights into usage patterns, popular queries, knowledge base performance, and user activity. You can filter data by date ranges, users, or categories. Export features allow you to download reports for further analysis or sharing with stakeholders.',
    category: 'analytics',
    tags: ['analytics', 'insights', 'reporting'],
    relatedArticles: [
      { slug: 'analytics-guide', title: 'Understanding Analytics & Insights' },
    ],
  },
  {
    id: 'data-privacy',
    question: 'How is my data protected and what about privacy?',
    answer:
      'We take data privacy seriously. All conversations are encrypted in transit and at rest. Access is controlled through role-based permissions. You can delete conversations and control data retention. We comply with major privacy regulations and provide transparency about data handling in our privacy policy.',
    category: 'security',
    tags: ['privacy', 'security', 'data-protection'],
    relatedArticles: [
      { slug: 'advanced-troubleshooting', title: 'Advanced Troubleshooting' },
      { slug: 'user-management', title: 'User Management Guide' },
    ],
  },
  {
    id: 'model-selection',
    question: 'How do I choose the right AI model for my needs?',
    answer:
      'Different models are optimized for different tasks. Use General Purpose for most conversations, Advanced Reasoning for complex analysis and problem-solving, Fast Response for quick factual questions, and Specialized Models for domain-specific tasks. You can switch models during conversations based on your needs.',
    category: 'models',
    tags: ['models', 'selection', 'performance'],
    relatedArticles: [
      {
        slug: 'chatbot-getting-started',
        title: 'Getting Started with Your AI Chatbot',
      },
      { slug: 'advanced-search', title: 'Advanced Query Techniques' },
    ],
  },
];

const categoryIcons = {
  basics: BookOpen,
  'knowledge-base': BookOpen,
  features: Settings,
  administration: Users,
  api: Settings,
  support: MessageCircle,
  analytics: Settings,
  security: Settings,
  models: Settings,
};

interface EnhancedFAQProps {
  searchQuery?: string;
}

export function EnhancedFAQ({ searchQuery = '' }: EnhancedFAQProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      !localSearchQuery ||
      faq.question.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      faq.tags.some((tag) =>
        tag.toLowerCase().includes(localSearchQuery.toLowerCase()),
      );

    const matchesCategory =
      !selectedCategory || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(faqData.map((faq) => faq.category))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="size-5" />
          Frequently Asked Questions
        </CardTitle>
        <p className="text-muted-foreground">
          Find quick answers to common questions about using the platform
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Search FAQ..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto size-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No FAQs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or category filter
              </p>
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const isExpanded = expandedItems.has(faq.id);
              const Icon =
                categoryIcons[faq.category as keyof typeof categoryIcons] ||
                Settings;

              return (
                <Card key={faq.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(faq.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="size-4 text-muted-foreground" />
                            <Badge
                              variant="secondary"
                              className="text-xs capitalize"
                            >
                              {faq.category.replace('-', ' ')}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-left mb-1">
                            {faq.question}
                          </h3>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {faq.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="shrink-0 ">
                          {isExpanded ? (
                            <ChevronUp className="size-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="size-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-4">
                          {faq.answer}
                        </p>

                        {faq.relatedArticles.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Related Articles:
                            </h4>
                            <div className="space-y-1">
                              {faq.relatedArticles.map((article) => (
                                <Link
                                  key={article.slug}
                                  href={`/help/${article.slug}`}
                                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                  <ExternalLink className="size-3" />
                                  {article.title}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Contact Support CTA */}
        <Card className="bg-muted/50">
          <CardContent className="p-4 text-center">
            <h4 className="font-medium mb-2">Still need help?</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Can&apos;t find what you&apos;re looking for? Our support team is
              here to help.
            </p>
            <Button size="sm">
              <MessageCircle className="size-4 mr-2" />
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
