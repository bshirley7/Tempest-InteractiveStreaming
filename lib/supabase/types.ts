/**
 * TypeScript types for Supabase database schema
 */

export interface Database {
  public: {
    Tables: {
      universities: {
        Row: {
          id: string;
          name: string;
          domain: string;
          logo_url: string | null;
          primary_color: string;
          secondary_color: string;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain: string;
          logo_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string;
          logo_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          university_id: string | null;
          email: string;
          full_name: string | null;
          role: 'student' | 'faculty' | 'admin' | 'moderator';
          avatar_url: string | null;
          preferences: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          university_id?: string | null;
          email: string;
          full_name?: string | null;
          role?: 'student' | 'faculty' | 'admin' | 'moderator';
          avatar_url?: string | null;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          university_id?: string | null;
          email?: string;
          full_name?: string | null;
          role?: 'student' | 'faculty' | 'admin' | 'moderator';
          avatar_url?: string | null;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      channels: {
        Row: {
          id: string;
          university_id: string | null;
          name: string;
          description: string | null;
          category: string;
          thumbnail_url: string | null;
          logo_url: string | null;
          logo_svg: string | null;
          logo_metadata: any;
          is_live: boolean;
          stream_key: string | null;
          cloudflare_stream_id: string | null;
          settings: any;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          university_id?: string | null;
          name: string;
          description?: string | null;
          category: string;
          thumbnail_url?: string | null;
          logo_url?: string | null;
          logo_svg?: string | null;
          logo_metadata?: any;
          is_live?: boolean;
          stream_key?: string | null;
          cloudflare_stream_id?: string | null;
          settings?: any;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          university_id?: string | null;
          name?: string;
          description?: string | null;
          category?: string;
          thumbnail_url?: string | null;
          logo_url?: string | null;
          logo_svg?: string | null;
          logo_metadata?: any;
          is_live?: boolean;
          stream_key?: string | null;
          cloudflare_stream_id?: string | null;
          settings?: any;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      content: {
        Row: {
          id: string;
          university_id: string | null;
          channel_id: string | null;
          title: string;
          description: string | null;
          cloudflare_video_id: string;
          thumbnail_url: string | null;
          duration: number | null;
          category: string | null;
          tags: string[];
          is_featured: boolean;
          is_published: boolean;
          metadata: any;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          university_id?: string | null;
          channel_id?: string | null;
          title: string;
          description?: string | null;
          cloudflare_video_id: string;
          thumbnail_url?: string | null;
          duration?: number | null;
          category?: string | null;
          tags?: string[];
          is_featured?: boolean;
          is_published?: boolean;
          metadata?: any;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          university_id?: string | null;
          channel_id?: string | null;
          title?: string;
          description?: string | null;
          cloudflare_video_id?: string;
          thumbnail_url?: string | null;
          duration?: number | null;
          category?: string | null;
          tags?: string[];
          is_featured?: boolean;
          is_published?: boolean;
          metadata?: any;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      interactions: {
        Row: {
          id: string;
          channel_id: string | null;
          content_id: string | null;
          type: 'poll' | 'quiz' | 'rating' | 'reaction';
          title: string;
          question: string;
          options: any;
          correct_answer: string | null;
          time_limit: number | null;
          is_active: boolean;
          starts_at: string | null;
          ends_at: string | null;
          metadata: any;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          channel_id?: string | null;
          content_id?: string | null;
          type: 'poll' | 'quiz' | 'rating' | 'reaction';
          title: string;
          question: string;
          options: any;
          correct_answer?: string | null;
          time_limit?: number | null;
          is_active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          metadata?: any;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          channel_id?: string | null;
          content_id?: string | null;
          type?: 'poll' | 'quiz' | 'rating' | 'reaction';
          title?: string;
          question?: string;
          options?: any;
          correct_answer?: string | null;
          time_limit?: number | null;
          is_active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          metadata?: any;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      interaction_responses: {
        Row: {
          id: string;
          interaction_id: string;
          user_id: string;
          response: string;
          is_correct: boolean | null;
          response_time: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          interaction_id: string;
          user_id: string;
          response: string;
          is_correct?: boolean | null;
          response_time?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          interaction_id?: string;
          user_id?: string;
          response?: string;
          is_correct?: boolean | null;
          response_time?: number | null;
          created_at?: string;
        };
      };
      channel_schedules: {
        Row: {
          id: string;
          channel_id: string;
          content_id: string | null;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          is_live: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          channel_id: string;
          content_id?: string | null;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          is_live?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          channel_id?: string;
          content_id?: string | null;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          is_live?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          university_id: string | null;
          channel_id: string | null;
          content_id: string | null;
          interaction_id: string | null;
          metric_type: string;
          metric_value: number;
          dimensions: any;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          university_id?: string | null;
          channel_id?: string | null;
          content_id?: string | null;
          interaction_id?: string | null;
          metric_type: string;
          metric_value: number;
          dimensions?: any;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          university_id?: string | null;
          channel_id?: string | null;
          content_id?: string | null;
          interaction_id?: string | null;
          metric_type?: string;
          metric_value?: number;
          dimensions?: any;
          recorded_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}