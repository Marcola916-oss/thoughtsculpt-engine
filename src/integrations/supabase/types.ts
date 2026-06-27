export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_code: string
          id: string
          is_claimed: boolean
          reward_expires_at: string | null
          reward_type: string | null
          reward_value: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_code: string
          id?: string
          is_claimed?: boolean
          reward_expires_at?: string | null
          reward_type?: string | null
          reward_value?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_code?: string
          id?: string
          is_claimed?: boolean
          reward_expires_at?: string | null
          reward_type?: string | null
          reward_value?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      calendar_tasks: {
        Row: {
          action_task: string | null
          completed_at: string | null
          created_at: string
          day_number: number
          id: string
          is_completed: boolean
          is_milestone: boolean
          notes: string | null
          phase: string | null
          reflective_task: string | null
          user_id: string
        }
        Insert: {
          action_task?: string | null
          completed_at?: string | null
          created_at?: string
          day_number: number
          id?: string
          is_completed?: boolean
          is_milestone?: boolean
          notes?: string | null
          phase?: string | null
          reflective_task?: string | null
          user_id: string
        }
        Update: {
          action_task?: string | null
          completed_at?: string | null
          created_at?: string
          day_number?: number
          id?: string
          is_completed?: boolean
          is_milestone?: boolean
          notes?: string | null
          phase?: string | null
          reflective_task?: string | null
          user_id?: string
        }
        Relationships: []
      }
      compass_analyses: {
        Row: {
          analysis_content: Json | null
          context: string | null
          created_at: string
          id: string
          observations: string | null
          probable_archetype: string | null
          relationship_type: string | null
          target_name: string
          user_id: string
        }
        Insert: {
          analysis_content?: Json | null
          context?: string | null
          created_at?: string
          id?: string
          observations?: string | null
          probable_archetype?: string | null
          relationship_type?: string | null
          target_name: string
          user_id: string
        }
        Update: {
          analysis_content?: Json | null
          context?: string | null
          created_at?: string
          id?: string
          observations?: string | null
          probable_archetype?: string | null
          relationship_type?: string | null
          target_name?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_limits: {
        Row: {
          calendars_count: number
          date: string
          generations_count: number
          id: string
          pdfs_count: number
          user_id: string
        }
        Insert: {
          calendars_count?: number
          date?: string
          generations_count?: number
          id?: string
          pdfs_count?: number
          user_id: string
        }
        Update: {
          calendars_count?: number
          date?: string
          generations_count?: number
          id?: string
          pdfs_count?: number
          user_id?: string
        }
        Relationships: []
      }
      diagnoses: {
        Row: {
          archetype: string
          financial_analysis: string | null
          generated_at: string
          id: string
          model_used: string
          personal_analysis: string | null
          professional_analysis: string | null
          romantic_analysis: string | null
          user_id: string
          version: number
        }
        Insert: {
          archetype: string
          financial_analysis?: string | null
          generated_at?: string
          id?: string
          model_used?: string
          personal_analysis?: string | null
          professional_analysis?: string | null
          romantic_analysis?: string | null
          user_id: string
          version?: number
        }
        Update: {
          archetype?: string
          financial_analysis?: string | null
          generated_at?: string
          id?: string
          model_used?: string
          personal_analysis?: string | null
          professional_analysis?: string | null
          romantic_analysis?: string | null
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      monthly_reports: {
        Row: {
          behavioral_insight: string | null
          consistency_score: number | null
          generated_at: string
          id: string
          month_headline: string | null
          month_number: number
          month_summary: string | null
          motivational_close: string | null
          next_month_challenge: string | null
          performance_badge: string | null
          raw_data: Json | null
          user_id: string
        }
        Insert: {
          behavioral_insight?: string | null
          consistency_score?: number | null
          generated_at?: string
          id?: string
          month_headline?: string | null
          month_number: number
          month_summary?: string | null
          motivational_close?: string | null
          next_month_challenge?: string | null
          performance_badge?: string | null
          raw_data?: Json | null
          user_id: string
        }
        Update: {
          behavioral_insight?: string | null
          consistency_score?: number | null
          generated_at?: string
          id?: string
          month_headline?: string | null
          month_number?: number
          month_summary?: string | null
          motivational_close?: string | null
          next_month_challenge?: string | null
          performance_badge?: string | null
          raw_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          icon: string | null
          id: string
          is_read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string
          icon?: string | null
          id?: string
          is_read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_answers: {
        Row: {
          completed_at: string
          daily_minutes: number | null
          discipline_style: string | null
          emotional_trigger: string | null
          financial_goal: string | null
          id: string
          mobile_os: string | null
          sleep_time: string | null
          user_id: string
          wake_time: string | null
        }
        Insert: {
          completed_at?: string
          daily_minutes?: number | null
          discipline_style?: string | null
          emotional_trigger?: string | null
          financial_goal?: string | null
          id?: string
          mobile_os?: string | null
          sleep_time?: string | null
          user_id: string
          wake_time?: string | null
        }
        Update: {
          completed_at?: string
          daily_minutes?: number | null
          discipline_style?: string | null
          emotional_trigger?: string | null
          financial_goal?: string | null
          id?: string
          mobile_os?: string | null
          sleep_time?: string | null
          user_id?: string
          wake_time?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_cents: number
          bumps: Json
          created_at: string
          currency: string
          customer_email: string | null
          id: string
          ip_hash: string | null
          lead_id: string
          paid_at: string | null
          raw_event: Json | null
          status: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          bumps?: Json
          created_at?: string
          currency: string
          customer_email?: string | null
          id?: string
          ip_hash?: string | null
          lead_id: string
          paid_at?: string | null
          raw_event?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          bumps?: Json
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          ip_hash?: string | null
          lead_id?: string
          paid_at?: string | null
          raw_event?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "quiz_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_generations: {
        Row: {
          archetype: Database["public"]["Enums"]["archetype"]
          attempts: Json
          content_hash: string
          cost_cents: number
          created_at: string
          error: string | null
          expires_at: string | null
          id: string
          lang: string
          lead_id: string | null
          signed_url: string | null
          status: string
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          archetype: Database["public"]["Enums"]["archetype"]
          attempts?: Json
          content_hash: string
          cost_cents?: number
          created_at?: string
          error?: string | null
          expires_at?: string | null
          id?: string
          lang: string
          lead_id?: string | null
          signed_url?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          archetype?: Database["public"]["Enums"]["archetype"]
          attempts?: Json
          content_hash?: string
          cost_cents?: number
          created_at?: string
          error?: string | null
          expires_at?: string | null
          id?: string
          lang?: string
          lead_id?: string | null
          signed_url?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdf_generations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "quiz_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          access_level: string
          archetype: string | null
          country: string | null
          created_at: string
          currency: string
          display_name: string | null
          features_expires_at: string | null
          id: string
          lang: string
          onboarding_completed: boolean
          plan_started_at: string | null
          plan_type: string | null
          quiz_lead_id: string | null
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: string
          archetype?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          display_name?: string | null
          features_expires_at?: string | null
          id?: string
          lang?: string
          onboarding_completed?: boolean
          plan_started_at?: string | null
          plan_type?: string | null
          quiz_lead_id?: string | null
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: string
          archetype?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          display_name?: string | null
          features_expires_at?: string | null
          id?: string
          lang?: string
          onboarding_completed?: boolean
          plan_started_at?: string | null
          plan_type?: string | null
          quiz_lead_id?: string | null
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_quiz_lead_id_fkey"
            columns: ["quiz_lead_id"]
            isOneToOne: false
            referencedRelation: "quiz_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_leads: {
        Row: {
          answers: Json
          country: string | null
          created_at: string
          currency: string
          display_name: string | null
          email: string | null
          id: string
          insight_preview: string | null
          ip_hash: string | null
          lang: string
          scores: Json
          secondary_archetype: Database["public"]["Enums"]["archetype"] | null
          share_token: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
          winner: Database["public"]["Enums"]["archetype"] | null
        }
        Insert: {
          answers?: Json
          country?: string | null
          created_at?: string
          currency?: string
          display_name?: string | null
          email?: string | null
          id?: string
          insight_preview?: string | null
          ip_hash?: string | null
          lang?: string
          scores?: Json
          secondary_archetype?: Database["public"]["Enums"]["archetype"] | null
          share_token?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          winner?: Database["public"]["Enums"]["archetype"] | null
        }
        Update: {
          answers?: Json
          country?: string | null
          created_at?: string
          currency?: string
          display_name?: string | null
          email?: string | null
          id?: string
          insight_preview?: string | null
          ip_hash?: string | null
          lang?: string
          scores?: Json
          secondary_archetype?: Database["public"]["Enums"]["archetype"] | null
          share_token?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          winner?: Database["public"]["Enums"]["archetype"] | null
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          event_id: string
          processed_at: string
          type: string
        }
        Insert: {
          event_id: string
          processed_at?: string
          type: string
        }
        Update: {
          event_id?: string
          processed_at?: string
          type?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_kind"]
          status: Database["public"]["Enums"]["sub_status"]
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan: Database["public"]["Enums"]["plan_kind"]
          status?: Database["public"]["Enums"]["sub_status"]
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_kind"]
          status?: Database["public"]["Enums"]["sub_status"]
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_events: {
        Row: {
          created_at: string | null
          event_name: string
          id: string
          properties: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          id?: string
          properties?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          id?: string
          properties?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          calendar_exported: boolean
          compass_used: number
          extra_days_earned: number
          id: string
          last_activity_at: string | null
          last_checkin_date: string | null
          longest_streak: number
          streak_days: number
          tasks_completed: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_exported?: boolean
          compass_used?: number
          extra_days_earned?: number
          id?: string
          last_activity_at?: string | null
          last_checkin_date?: string | null
          longest_streak?: number
          streak_days?: number
          tasks_completed?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_exported?: boolean
          compass_used?: number
          extra_days_earned?: number
          id?: string
          last_activity_at?: string | null
          last_checkin_date?: string | null
          longest_streak?: number
          streak_days?: number
          tasks_completed?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      viral_shares: {
        Row: {
          channel: Database["public"]["Enums"]["share_channel"]
          created_at: string
          id: string
          ip_hash: string | null
          lead_id: string | null
          share_token: string | null
          user_agent: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["share_channel"]
          created_at?: string
          id?: string
          ip_hash?: string | null
          lead_id?: string | null
          share_token?: string | null
          user_agent?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["share_channel"]
          created_at?: string
          id?: string
          ip_hash?: string | null
          lead_id?: string | null
          share_token?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viral_shares_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "quiz_leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_unlock_achievements:
        | { Args: { user_uuid: string }; Returns: undefined }
        | {
            Args: {
              user_uuid: string
              v_calendar_exported: boolean
              v_compass_count: number
              v_max_streak: number
              v_tasks_completed: number
            }
            Returns: undefined
          }
      get_order_status: {
        Args: { _id: string }
        Returns: {
          lead_id: string
          status: Database["public"]["Enums"]["order_status"]
        }[]
      }
      get_shared_quiz: {
        Args: { _token: string }
        Returns: {
          created_at: string
          display_name: string
          lang: string
          scores: Json
          winner: Database["public"]["Enums"]["archetype"]
        }[]
      }
      mark_calendar_exported: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      recalculate_user_stats: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      unlock_achievement: {
        Args: {
          ach_code: string
          rew_type: string
          rew_value: string
          user_uuid: string
        }
        Returns: undefined
      }
    }
    Enums: {
      archetype: "AO" | "SS" | "EA" | "HI"
      order_status: "pending" | "paid" | "failed" | "expired" | "refunded"
      plan_kind: "p30d" | "p6m" | "p1y"
      share_channel: "whatsapp" | "x" | "facebook" | "copy" | "other"
      sub_status: "incomplete" | "active" | "past_due" | "canceled" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      archetype: ["AO", "SS", "EA", "HI"],
      order_status: ["pending", "paid", "failed", "expired", "refunded"],
      plan_kind: ["p30d", "p6m", "p1y"],
      share_channel: ["whatsapp", "x", "facebook", "copy", "other"],
      sub_status: ["incomplete", "active", "past_due", "canceled", "expired"],
    },
  },
} as const
