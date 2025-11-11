// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          clerk_user_id: string;
          email: string;
          role: 'student' | 'admin';
          full_name: string | null;
          created_at: string;
          updated_at: string;
          cohort: string | null;
          session_count: number;
          total_time_seconds: number;
          total_topics: string[];
          achievements: unknown[];
          last_session_ended_at: string | null;
          avatar_url: string | null;
          auth_provider: string;
          external_auth_id: string | null;
          theme_preference: 'light' | 'dark' | 'system' | null;
        };
        Insert: {
          user_id?: string;
          clerk_user_id: string;
          email: string;
          role?: 'student' | 'admin';
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
          cohort?: string | null;
          session_count?: number;
          total_time_seconds?: number;
          total_topics?: string[];
          achievements?: unknown[];
          last_session_ended_at?: string | null;
          avatar_url?: string | null;
          auth_provider?: string;
          external_auth_id?: string | null;
          theme_preference?: 'light' | 'dark' | 'system' | null;
        };
        Update: {
          user_id?: string;
          clerk_user_id?: string;
          email?: string;
          role?: 'student' | 'admin';
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
          cohort?: string | null;
          session_count?: number;
          total_time_seconds?: number;
          total_topics?: string[];
          achievements?: unknown[];
          last_session_ended_at?: string | null;
          avatar_url?: string | null;
          auth_provider?: string;
          external_auth_id?: string | null;
          theme_preference?: 'light' | 'dark' | 'system' | null;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          role: 'student' | 'instructor' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          role?: 'student' | 'instructor' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          role?: 'student' | 'instructor' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          session_type: 'practice' | 'tutoring' | 'review' | 'general';
          status: 'active' | 'completed' | 'archived';
          total_messages: number;
          total_tokens: number;
          session_duration_seconds: number;
          created_at: string;
          updated_at: string;
          last_activity_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          session_type?: 'practice' | 'tutoring' | 'review' | 'general';
          status?: 'active' | 'completed' | 'archived';
          total_messages?: number;
          total_tokens?: number;
          session_duration_seconds?: number;
          created_at?: string;
          updated_at?: string;
          last_activity_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          session_type?: 'practice' | 'tutoring' | 'review' | 'general';
          status?: 'active' | 'completed' | 'archived';
          total_messages?: number;
          total_tokens?: number;
          session_duration_seconds?: number;
          created_at?: string;
          updated_at?: string;
          last_activity_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          token_count: number;
          model_name: string | null;
          response_time_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          token_count?: number;
          model_name?: string | null;
          response_time_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          token_count?: number;
          model_name?: string | null;
          response_time_ms?: number | null;
          created_at?: string;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_type: 'login' | 'learning' | 'chat' | 'community';
          duration_seconds: number;
          page_views: number;
          actions_count: number;
          device_type: string | null;
          browser: string | null;
          ip_address: string | null;
          created_at: string;
          ended_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type: 'login' | 'learning' | 'chat' | 'community';
          duration_seconds?: number;
          page_views?: number;
          actions_count?: number;
          device_type?: string | null;
          browser?: string | null;
          ip_address?: string | null;
          created_at?: string;
          ended_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_type?: 'login' | 'learning' | 'chat' | 'community';
          duration_seconds?: number;
          page_views?: number;
          actions_count?: number;
          device_type?: string | null;
          browser?: string | null;
          ip_address?: string | null;
          created_at?: string;
          ended_at?: string | null;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          event_category: string;
          event_data: AnalyticsEventData | null;
          page_url: string | null;
          referrer: string | null;
          user_agent: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_type: string;
          event_category: string;
          event_data?: AnalyticsEventData | null;
          page_url?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_type?: string;
          event_category?: string;
          event_data?: AnalyticsEventData | null;
          page_url?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      instructor_analytics: {
        Row: {
          user_id: string;
          display_name: string | null;
          user_created_at: string;
          role: 'student' | 'instructor' | 'admin';
          total_chat_sessions: number;
          total_messages: number;
          total_tokens_used: number;
          avg_session_duration: number;
          last_chat_activity: string | null;
          total_sessions: number;
          last_activity: string | null;
        };
      };
    };
    Functions: {
      update_chat_session_stats: {
        Args: {
          p_session_id: string;
          p_token_count: number;
        };
        Returns: void;
      };
    };
  };
}

// Enhanced analytics event data types for better type safety
export type AnalyticsEventData = 
  | PageViewEvent
  | ClickEvent
  | ChatEvent
  | LearningEvent
  | ErrorEvent
  | CustomEvent;

export interface PageViewEvent {
  type: 'page_view';
  page?: string;
  duration?: number;
  scroll_depth?: number;
}

export interface ClickEvent {
  type: 'click';
  element?: string;
  target?: string;
  position?: { x: number; y: number };
}

export interface ChatEvent {
  type: 'chat';
  message_count?: number;
  session_duration?: number;
  model_used?: string;
}

export interface LearningEvent {
  type: 'learning';
  lesson_id?: string;
  progress?: number;
  completion_time?: number;
}

export interface ErrorEvent {
  type: 'error';
  error_message?: string;
  error_code?: string;
  stack_trace?: string;
}

export interface CustomEvent {
  type: 'custom';
  [key: string]: unknown;
}
