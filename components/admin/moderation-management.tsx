'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Eye, Trash2, Plus, User, MessageSquare, Download, Upload, BookOpen } from 'lucide-react';

interface ModerationRule {
  id: string;
  rule_type: 'banned_word' | 'banned_phrase' | 'regex_pattern' | 'spam_pattern';
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'flag' | 'block' | 'shadow_ban' | 'replace';
  replacement_text?: string;
  context?: string[];
  description?: string;
  is_active: boolean;
  created_at: string;
}

interface FlaggedContent {
  id: string;
  content_type: string;
  content_text: string;
  flag_reason: string;
  severity: string;
  status: string;
  created_at: string;
  user_profiles?: {
    username?: string;
    full_name?: string;
  };
  reporter?: {
    username?: string;
    full_name?: string;
  };
}

interface UserModerationStatus {
  id: string;
  user_id: string;
  violation_count: number;
  warning_count: number;
  is_banned: boolean;
  is_shadow_banned: boolean;
  banned_until?: string;
  last_violation_at?: string;
}

export function ModerationManagement() {
  const [activeTab, setActiveTab] = useState('rules');
  const [rules, setRules] = useState<ModerationRule[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [userStatuses, setUserStatuses] = useState<UserModerationStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // New rule form state
  const [newRule, setNewRule] = useState({
    rule_type: 'banned_word' as const,
    pattern: '',
    severity: 'medium' as const,
    action: 'flag' as const,
    replacement_text: '',
    context: [] as string[],
    description: ''
  });

  // Rule templates for quick setup
  const ruleTemplates = [
    {
      name: 'Basic Profanity Filter',
      rules: [
        {
          rule_type: 'banned_word' as const,
          pattern: '\\b(fuck|shit|damn|bitch|asshole|bastard)\\b',
          severity: 'medium' as const,
          action: 'replace' as const,
          replacement_text: '***',
          description: 'Basic profanity filter'
        },
        {
          rule_type: 'banned_word' as const,
          pattern: '\\b(crap|sucks|stupid|idiot|moron)\\b',
          severity: 'low' as const,
          action: 'flag' as const,
          description: 'Mild inappropriate language'
        }
      ]
    },
    {
      name: 'Harassment Prevention',
      rules: [
        {
          rule_type: 'banned_phrase' as const,
          pattern: '\\b(kill yourself|kys|go die|end yourself)\\b',
          severity: 'critical' as const,
          action: 'block' as const,
          description: 'Self-harm encouragement'
        },
        {
          rule_type: 'banned_phrase' as const,
          pattern: '\\b(you suck|you\'re stupid|loser|worthless)\\b',
          severity: 'medium' as const,
          action: 'flag' as const,
          description: 'Personal attacks'
        }
      ]
    },
    {
      name: 'Spam Detection',
      rules: [
        {
          rule_type: 'spam_pattern' as const,
          pattern: '(.)\\1{4,}',
          severity: 'low' as const,
          action: 'flag' as const,
          description: 'Repeated characters spam'
        },
        {
          rule_type: 'regex_pattern' as const,
          pattern: '^[A-Z\\s!?.,]{20,}$',
          severity: 'low' as const,
          action: 'flag' as const,
          description: 'Excessive caps lock'
        }
      ]
    },
    {
      name: 'Privacy Protection',
      rules: [
        {
          rule_type: 'regex_pattern' as const,
          pattern: '\\b\\d{3}-\\d{3}-\\d{4}\\b',
          severity: 'high' as const,
          action: 'block' as const,
          description: 'Phone number detection'
        },
        {
          rule_type: 'regex_pattern' as const,
          pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
          severity: 'medium' as const,
          action: 'flag' as const,
          description: 'Email address detection'
        }
      ]
    },
    {
      name: 'Educational Appropriate',
      rules: [
        {
          rule_type: 'banned_phrase' as const,
          pattern: '\\b(cheat|cheating|test answers|homework help)\\b',
          severity: 'medium' as const,
          action: 'flag' as const,
          description: 'Academic misconduct'
        },
        {
          rule_type: 'banned_word' as const,
          pattern: '\\b(porn|sex|nude|adult)\\b',
          severity: 'high' as const,
          action: 'block' as const,
          description: 'Adult content'
        }
      ]
    }
  ];

  useEffect(() => {
    if (activeTab === 'rules') {
      fetchRules();
    } else if (activeTab === 'flagged') {
      fetchFlaggedContent();
    } else if (activeTab === 'users') {
      fetchUserStatuses();
    }
  }, [activeTab]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/moderation/rules');
      const data = await response.json();
      if (data.success) {
        setRules(data.data);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlaggedContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/moderation/flagged');
      const data = await response.json();
      if (data.success) {
        setFlaggedContent(data.data);
      }
    } catch (error) {
      console.error('Error fetching flagged content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatuses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/moderation/users');
      const data = await response.json();
      if (data.success) {
        setUserStatuses(data.data);
      }
    } catch (error) {
      console.error('Error fetching user statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRule = async () => {
    try {
      const response = await fetch('/api/moderation/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      
      if (response.ok) {
        setNewRule({
          rule_type: 'banned_word',
          pattern: '',
          severity: 'medium',
          action: 'flag',
          replacement_text: '',
          context: [],
          description: ''
        });
        fetchRules();
      }
    } catch (error) {
      console.error('Error creating rule:', error);
    }
  };

  const importRuleTemplate = async (template: typeof ruleTemplates[0]) => {
    try {
      for (const rule of template.rules) {
        await fetch('/api/moderation/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rule)
        });
      }
      fetchRules();
    } catch (error) {
      console.error('Error importing template:', error);
    }
  };

  const exportRules = () => {
    const dataStr = JSON.stringify(rules, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'moderation-rules.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'flag': return 'bg-yellow-100 text-yellow-800';
      case 'block': return 'bg-red-100 text-red-800';
      case 'replace': return 'bg-blue-100 text-blue-800';
      case 'shadow_ban': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Content Moderation</h2>
        <p className="text-muted-foreground">
          Manage moderation rules, review flagged content, and monitor user behavior
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Rules</span>
          </TabsTrigger>
          <TabsTrigger value="flagged" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Flagged Content</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>User Status</span>
          </TabsTrigger>
        </TabsList>

        {/* Moderation Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          {/* Quick Actions */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Rule Templates</span>
              </Button>
              <Button
                variant="outline"
                onClick={exportRules}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Rules</span>
              </Button>
            </div>
          </div>

          {/* Rule Templates */}
          {showTemplates && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Rule Templates</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Pre-configured rule sets for common moderation scenarios
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ruleTemplates.map((template, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.rules.length} rules included
                      </p>
                      <div className="space-y-1 mb-3">
                        {template.rules.slice(0, 2).map((rule, ruleIndex) => (
                          <div key={ruleIndex} className="text-xs">
                            <Badge className={getSeverityColor(rule.severity)} variant="secondary">
                              {rule.severity}
                            </Badge>
                            <span className="ml-2">{rule.description}</span>
                          </div>
                        ))}
                        {template.rules.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{template.rules.length - 2} more rules
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => importRuleTemplate(template)}
                        className="w-full"
                      >
                        Import Template
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create New Rule</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Rule Type</label>
                  <Select 
                    value={newRule.rule_type} 
                    onValueChange={(value: any) => setNewRule({...newRule, rule_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banned_word">Banned Word</SelectItem>
                      <SelectItem value="banned_phrase">Banned Phrase</SelectItem>
                      <SelectItem value="regex_pattern">Regex Pattern</SelectItem>
                      <SelectItem value="spam_pattern">Spam Pattern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <Select 
                    value={newRule.severity} 
                    onValueChange={(value: any) => setNewRule({...newRule, severity: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Action</label>
                  <Select 
                    value={newRule.action} 
                    onValueChange={(value: any) => setNewRule({...newRule, action: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flag">Flag for Review</SelectItem>
                      <SelectItem value="block">Block Content</SelectItem>
                      <SelectItem value="replace">Replace Text</SelectItem>
                      <SelectItem value="shadow_ban">Shadow Ban</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Pattern</label>
                  <Input 
                    value={newRule.pattern}
                    onChange={(e) => setNewRule({...newRule, pattern: e.target.value})}
                    placeholder="Enter pattern to match"
                  />
                </div>
              </div>

              {newRule.action === 'replace' && (
                <div>
                  <label className="text-sm font-medium">Replacement Text</label>
                  <Input 
                    value={newRule.replacement_text}
                    onChange={(e) => setNewRule({...newRule, replacement_text: e.target.value})}
                    placeholder="Text to replace with (e.g., ***)"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  value={newRule.description}
                  onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                  placeholder="Optional description of this rule"
                  rows={2}
                />
              </div>

              <Button onClick={createRule} disabled={!newRule.pattern}>
                Create Rule
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Rules</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading rules...</p>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getSeverityColor(rule.severity)}>
                            {rule.severity}
                          </Badge>
                          <Badge className={getActionColor(rule.action)}>
                            {rule.action}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {rule.rule_type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="font-mono text-sm">{rule.pattern}</p>
                        {rule.description && (
                          <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flagged Content Tab */}
        <TabsContent value="flagged" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Content Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading flagged content...</p>
              ) : (
                <div className="space-y-3">
                  {flaggedContent.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(item.severity)}>
                            {item.severity}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.content_type}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm">
                            Remove
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm bg-muted p-2 rounded mb-2">{item.content_text}</p>
                      <p className="text-sm text-muted-foreground">
                        Reason: {item.flag_reason}
                      </p>
                      {item.user_profiles && (
                        <p className="text-sm text-muted-foreground">
                          User: {item.user_profiles.username || item.user_profiles.full_name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Status Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Moderation Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading user statuses...</p>
              ) : (
                <div className="space-y-3">
                  {userStatuses.map((status) => (
                    <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {status.is_banned && (
                            <Badge className="bg-red-100 text-red-800">Banned</Badge>
                          )}
                          {status.is_shadow_banned && (
                            <Badge className="bg-purple-100 text-purple-800">Shadow Banned</Badge>
                          )}
                        </div>
                        <p className="text-sm">
                          Violations: {status.violation_count} | Warnings: {status.warning_count}
                        </p>
                        {status.last_violation_at && (
                          <p className="text-sm text-muted-foreground">
                            Last violation: {new Date(status.last_violation_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}