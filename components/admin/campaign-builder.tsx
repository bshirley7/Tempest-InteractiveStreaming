'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, DollarSign, Target, Users } from 'lucide-react';

interface CampaignBuilderProps {
  onSuccess?: (campaign: any) => void;
  onCancel?: () => void;
}

export function CampaignBuilder({ onSuccess, onCancel }: CampaignBuilderProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    advertiser_name: '',
    start_date: '',
    end_date: '',
    budget_limit: '',
    daily_budget_limit: '',
    target_audience: {
      demographics: [] as string[],
      interests: [] as string[]
    },
    targeting_rules: {
      channels: [] as string[],
      content_types: [] as string[]
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.advertiser_name || !formData.start_date || !formData.end_date) {
        throw new Error('Please fill in all required fields');
      }

      // Validate date range
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (startDate >= endDate) {
        throw new Error('End date must be after start date');
      }

      // Prepare request data
      const requestData = {
        name: formData.name,
        description: formData.description || null,
        advertiser_name: formData.advertiser_name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget_limit: formData.budget_limit ? parseFloat(formData.budget_limit) : null,
        daily_budget_limit: formData.daily_budget_limit ? parseFloat(formData.daily_budget_limit) : null,
        target_audience: formData.target_audience,
        targeting_rules: formData.targeting_rules
      };

      console.log('Creating campaign with data:', requestData);

      const response = await fetch('/api/admin/ad-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create campaign');
      }

      console.log('Campaign created successfully:', result);

      // Reset form
      setFormData({
        name: '',
        description: '',
        advertiser_name: '',
        start_date: '',
        end_date: '',
        budget_limit: '',
        daily_budget_limit: '',
        target_audience: {
          demographics: [],
          interests: []
        },
        targeting_rules: {
          channels: [],
          content_types: []
        }
      });

      // Call success callback
      if (onSuccess) {
        onSuccess(result.data);
      }

    } catch (err) {
      console.error('Campaign creation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Create New Campaign</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Spring Semester Promotion"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="advertiser_name">Advertiser *</Label>
                <Input
                  id="advertiser_name"
                  value={formData.advertiser_name}
                  onChange={(e) => handleInputChange('advertiser_name', e.target.value)}
                  placeholder="e.g., University Marketing"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Optional campaign description..."
                rows={3}
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Campaign Schedule</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  min={today}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  min={formData.start_date || today}
                  required
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Budget (Optional)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget_limit">Total Budget ($)</Label>
                <Input
                  id="budget_limit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget_limit}
                  onChange={(e) => handleInputChange('budget_limit', e.target.value)}
                  placeholder="e.g., 5000.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="daily_budget_limit">Daily Budget ($)</Label>
                <Input
                  id="daily_budget_limit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.daily_budget_limit}
                  onChange={(e) => handleInputChange('daily_budget_limit', e.target.value)}
                  placeholder="e.g., 100.00"
                />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}