'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mail,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Users,
  Settings,
  Code,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import { Label } from '@radix-ui/react-label';

interface SupportTicket {
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  userEmail: string;
  relatedArticles: string[];
}

const supportCategories = [
  {
    id: 'technical',
    name: 'Technical Issues',
    description: 'Bugs, errors, or technical problems',
    icon: Settings,
    expectedResponse: '4-8 hours',
    relatedArticles: ['troubleshooting', 'advanced-troubleshooting'],
  },
  {
    id: 'account',
    name: 'Account & Billing',
    description: 'Account access, billing, or subscription issues',
    icon: Users,
    expectedResponse: '2-4 hours',
    relatedArticles: ['user-management'],
  },
  {
    id: 'feature',
    name: 'Feature Requests',
    description: 'Suggestions for new features or improvements',
    icon: BookOpen,
    expectedResponse: '1-2 business days',
    relatedArticles: ['chat-features', 'artifacts-guide'],
  },
  {
    id: 'integration',
    name: 'Integration Support',
    description: 'API, webhooks, or third-party integrations',
    icon: Globe,
    expectedResponse: '4-8 hours',
    relatedArticles: ['api-documentation', 'integration-setup'],
  },
  {
    id: 'training',
    name: 'Training & Onboarding',
    description: 'Help with getting started or training sessions',
    icon: BookOpen,
    expectedResponse: '1 business day',
    relatedArticles: ['chatbot-getting-started', 'knowledge-base'],
  },
  {
    id: 'api',
    name: 'API & Development',
    description: 'Developer support and API questions',
    icon: Code,
    expectedResponse: '4-8 hours',
    relatedArticles: ['api-documentation'],
  },
];

const troubleshootingSteps = [
  'Clear your browser cache and cookies',
  'Try using a different browser or incognito mode',
  'Check your internet connection',
  'Disable browser extensions temporarily',
  'Refresh the page and try again',
];

export function EnhancedContactSupport() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SupportTicket>>({
    priority: 'medium',
    userEmail: '',
    subject: '',
    description: '',
    relatedArticles: [],
  });
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = supportCategories.find((c) => c.id === categoryId);
    if (category) {
      setFormData((prev) => ({
        ...prev,
        category: categoryId,
        relatedArticles: category.relatedArticles,
      }));

      // Show troubleshooting for technical issues
      if (categoryId === 'technical') {
        setShowTroubleshooting(true);
      } else {
        setShowTroubleshooting(false);
        setShowForm(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create email content
    const category = supportCategories.find((c) => c.id === selectedCategory);
    const subject = `[${category?.name}] ${formData.subject}`;
    const body = `
Category: ${category?.name}
Priority: ${formData.priority}
User Email: ${formData.userEmail}

Description:
${formData.description}

Related Articles Reviewed:
${formData.relatedArticles?.map((slug) => `- /help/${slug}`).join('\n') || 'None'}

---
This ticket was submitted through the Help Center contact form.
    `.trim();

    // Open email client
    const mailtoLink = `mailto:francotechnologiesllc@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const selectedCategoryData = supportCategories.find(
    (c) => c.id === selectedCategory,
  );

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-5" />
            Contact Support
          </CardTitle>
          <p className="text-muted-foreground">
            Get personalized help from our support team
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Mail className="size-5 text-primary" />
            <div>
              <div className="font-medium">Email Support</div>
              <div className="text-sm text-muted-foreground">
                francotechnologiesllc@gmail.com
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 border rounded-lg">
              <Clock className="size-6 mx-auto mb-2 text-muted-foreground" />
              <div className="font-medium text-sm">Response Time</div>
              <div className="text-xs text-muted-foreground">
                Usually within 4-8 hours
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <MessageCircle className="size-6 mx-auto mb-2 text-muted-foreground" />
              <div className="font-medium text-sm">Support Hours</div>
              <div className="text-xs text-muted-foreground">
                Monday - Friday, 9 AM - 6 PM EST
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <CheckCircle className="size-6 mx-auto mb-2 text-muted-foreground" />
              <div className="font-medium text-sm">Resolution Rate</div>
              <div className="text-xs text-muted-foreground">
                95% first contact resolution
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Categories */}
      {!showForm && !showTroubleshooting && (
        <Card>
          <CardHeader>
            <CardTitle>What can we help you with?</CardTitle>
            <p className="text-muted-foreground">
              Select the category that best describes your issue
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="size-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{category.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {category.description}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="size-3 mr-1" />
                            {category.expectedResponse}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Troubleshooting Steps */}
      {showTroubleshooting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5" />
              Quick Troubleshooting
            </CardTitle>
            <p className="text-muted-foreground">
              Before contacting support, please try these common solutions
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {troubleshootingSteps.map((step, index) => (
                <div key={step.slice(0, 10)} className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={() => setShowForm(true)}>Still Need Help</Button>
              <Button variant="outline" onClick={() => setSelectedCategory('')}>
                Back to Categories
              </Button>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Helpful Articles</h4>
              <div className="space-y-1">
                <Link
                  href="/help/troubleshooting"
                  className="block text-sm text-primary hover:underline"
                >
                  → Troubleshooting Common Issues
                </Link>
                <Link
                  href="/help/advanced-troubleshooting"
                  className="block text-sm text-primary hover:underline"
                >
                  → Advanced Troubleshooting Guide
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Support Form */}
      {showForm && selectedCategoryData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <selectedCategoryData.icon className="size-5" />
              {selectedCategoryData.name} Support
            </CardTitle>
            <p className="text-muted-foreground">
              Expected response time: {selectedCategoryData.expectedResponse}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {/* <label className="text-sm font-medium mb-2 block">
                    Your Email
                  </label> */}
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    type="email"
                    required
                    value={formData.userEmail}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        userEmail: e.target.value,
                      }))
                    }
                    placeholder="your.email@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        Low - General question
                      </SelectItem>
                      <SelectItem value="medium">
                        Medium - Standard issue
                      </SelectItem>
                      <SelectItem value="high">High - Blocking work</SelectItem>
                      <SelectItem value="urgent">
                        Urgent - System down
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Please provide detailed information about your issue, including any error messages, steps to reproduce, and what you expected to happen."
                />
              </div>

              {selectedCategoryData.relatedArticles.length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Related Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Have you checked these articles? They might help resolve
                    your issue faster:
                  </p>
                  <div className="space-y-1">
                    {selectedCategoryData.relatedArticles.map((slug) => (
                      <Link
                        key={slug}
                        href={`/help/${slug}`}
                        target="_blank"
                        className="block text-sm text-primary hover:underline"
                      >
                        →{' '}
                        {slug
                          .replace('-', ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit">
                  <Mail className="size-4 mr-2" />
                  Send Support Request
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedCategory('');
                    setShowTroubleshooting(false);
                  }}
                >
                  Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
