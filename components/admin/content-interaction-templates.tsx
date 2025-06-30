'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BookOpen, Code, GraduationCap, Lightbulb, Target, Clock } from 'lucide-react';

interface InteractionTemplate {
  category: string;
  templates: {
    type: 'poll' | 'quiz';
    title: string;
    question: string;
    options: string[];
    correct_answer?: string;
    trigger_time?: string;
    time_limit: number;
  }[];
}

const interactionTemplates: InteractionTemplate[] = [
  {
    category: 'Kotlin Programming',
    templates: [
      {
        type: 'quiz',
        title: 'Kotlin Syntax Basics',
        question: 'Which keyword is used to declare a mutable variable in Kotlin?',
        options: ['val', 'var', 'let', 'const'],
        correct_answer: 'b',
        trigger_time: '02:30',
        time_limit: 30
      },
      {
        type: 'quiz',
        title: 'Kotlin Functions',
        question: 'What is the correct syntax for declaring a function in Kotlin?',
        options: ['function myFunc()', 'fun myFunc()', 'def myFunc()', 'void myFunc()'],
        correct_answer: 'b',
        trigger_time: '05:15',
        time_limit: 45
      },
      {
        type: 'poll',
        title: 'Kotlin vs Java',
        question: 'What do you think is the biggest advantage of Kotlin over Java?',
        options: ['Null safety', 'Concise syntax', 'Interoperability', 'Coroutines'],
        trigger_time: '08:00',
        time_limit: 60
      },
      {
        type: 'quiz',
        title: 'Kotlin Data Classes',
        question: 'What does the "data" keyword automatically generate for a class?',
        options: ['Constructor only', 'toString() method only', 'equals(), hashCode(), toString(), and copy()', 'Nothing special'],
        correct_answer: 'c',
        trigger_time: '12:45',
        time_limit: 45
      },
      {
        type: 'quiz',
        title: 'Kotlin Null Safety',
        question: 'Which operator is used for safe calls in Kotlin?',
        options: ['?.', '!!', '?:', '::'],
        correct_answer: 'a',
        trigger_time: '15:20',
        time_limit: 30
      }
    ]
  },
  {
    category: 'Software Development',
    templates: [
      {
        type: 'poll',
        title: 'Development Practices',
        question: 'Which development practice do you find most valuable?',
        options: ['Test-Driven Development', 'Code Reviews', 'Pair Programming', 'Continuous Integration'],
        trigger_time: '03:00',
        time_limit: 45
      },
      {
        type: 'quiz',
        title: 'Version Control',
        question: 'What Git command is used to create a new branch?',
        options: ['git branch new-branch', 'git checkout -b new-branch', 'git create new-branch', 'Both A and B'],
        correct_answer: 'd',
        trigger_time: '07:30',
        time_limit: 40
      },
      {
        type: 'quiz',
        title: 'Software Architecture',
        question: 'What does MVC stand for in software architecture?',
        options: ['Model-View-Controller', 'Multiple-Variable-Calculation', 'Modern-Virtual-Computing', 'Managed-Version-Control'],
        correct_answer: 'a',
        trigger_time: '11:15',
        time_limit: 35
      }
    ]
  },
  {
    category: 'Mobile Development',
    templates: [
      {
        type: 'quiz',
        title: 'Android Development',
        question: 'Which file contains the app permissions in an Android project?',
        options: ['build.gradle', 'AndroidManifest.xml', 'strings.xml', 'MainActivity.kt'],
        correct_answer: 'b',
        trigger_time: '04:45',
        time_limit: 40
      },
      {
        type: 'poll',
        title: 'Mobile Platforms',
        question: 'Which mobile development approach do you prefer?',
        options: ['Native Android/iOS', 'React Native', 'Flutter', 'Xamarin'],
        trigger_time: '09:20',
        time_limit: 50
      },
      {
        type: 'quiz',
        title: 'Android UI',
        question: 'What is the recommended way to build UIs in modern Android development?',
        options: ['XML layouts', 'Jetpack Compose', 'HTML/CSS', 'Canvas drawing'],
        correct_answer: 'b',
        trigger_time: '13:10',
        time_limit: 35
      }
    ]
  },
  {
    category: 'General Programming',
    templates: [
      {
        type: 'quiz',
        title: 'Programming Concepts',
        question: 'What does OOP stand for?',
        options: ['Object-Oriented Programming', 'Open-Office-Protocol', 'Optimized-Operation-Process', 'Online-Only-Platform'],
        correct_answer: 'a',
        trigger_time: '02:00',
        time_limit: 30
      },
      {
        type: 'poll',
        title: 'Learning Preferences',
        question: 'How do you prefer to learn new programming concepts?',
        options: ['Hands-on coding', 'Video tutorials', 'Reading documentation', 'Interactive exercises'],
        trigger_time: '06:30',
        time_limit: 45
      },
      {
        type: 'quiz',
        title: 'Data Structures',
        question: 'Which data structure follows LIFO (Last In, First Out) principle?',
        options: ['Queue', 'Stack', 'Array', 'Linked List'],
        correct_answer: 'b',
        trigger_time: '10:15',
        time_limit: 35
      }
    ]
  }
];

interface ContentInteractionTemplatesProps {
  contentId: string;
  contentTitle: string;
  onTemplateApplied: () => void;
}

export function ContentInteractionTemplates({ contentId, contentTitle, onTemplateApplied }: ContentInteractionTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyTemplate = async (template: InteractionTemplate) => {
    setIsApplying(true);
    try {
      for (const interaction of template.templates) {
        const response = await fetch(`/api/content/${contentId}/interactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: interaction.type,
            title: interaction.title,
            question: interaction.question,
            options: interaction.options,
            correct_answer: interaction.correct_answer,
            time_limit: interaction.time_limit,
            trigger_time: interaction.trigger_time,
            auto_activate: true
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to create interaction: ${interaction.title}`);
        }
      }

      setIsDialogOpen(false);
      onTemplateApplied();
    } catch (error) {
      console.error('Error applying template:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'Kotlin Programming':
        return <Code className="w-5 h-5" />;
      case 'Software Development':
        return <Lightbulb className="w-5 h-5" />;
      case 'Mobile Development':
        return <Target className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <GraduationCap className="w-4 h-4" />
          <span>Apply Templates</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interaction Templates for "{contentTitle}"</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Choose from pre-built interaction sets designed for educational content
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Filter by Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {interactionTemplates.map((template) => (
                  <SelectItem key={template.category} value={template.category}>
                    {template.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {interactionTemplates
              .filter(template => !selectedCategory || template.category === selectedCategory)
              .map((template) => (
                <Card key={template.category} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTemplateIcon(template.category)}
                        <CardTitle className="text-lg">{template.category}</CardTitle>
                      </div>
                      <Badge variant="secondary">
                        {template.templates.length} interactions
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-2">
                        {template.templates.slice(0, 3).map((interaction, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center space-x-2">
                              <Badge variant={interaction.type === 'quiz' ? 'default' : 'secondary'}>
                                {interaction.type}
                              </Badge>
                              <span className="text-sm font-medium">{interaction.title}</span>
                              {interaction.trigger_time && (
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>@{interaction.trigger_time}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {template.templates.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{template.templates.length - 3} more interactions
                          </p>
                        )}
                      </div>

                      <Button 
                        onClick={() => handleApplyTemplate(template)}
                        disabled={isApplying}
                        className="w-full"
                      >
                        {isApplying ? 'Applying...' : `Apply ${template.category} Template`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}