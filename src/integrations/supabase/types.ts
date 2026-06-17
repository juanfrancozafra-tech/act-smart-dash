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
      account_activity: {
        Row: {
          account_id: string
          active_sessions: number
          created_at: string
          id: string
          week_start: string
          weekly_active_users: number
        }
        Insert: {
          account_id: string
          active_sessions?: number
          created_at?: string
          id?: string
          week_start: string
          weekly_active_users?: number
        }
        Update: {
          account_id?: string
          active_sessions?: number
          created_at?: string
          id?: string
          week_start?: string
          weekly_active_users?: number
        }
        Relationships: [
          {
            foreignKeyName: "account_activity_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      account_onboarding_progress: {
        Row: {
          account_id: string
          completed_at: string | null
          created_at: string
          id: string
          step_id: string
          updated_at: string
        }
        Insert: {
          account_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          step_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          step_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_onboarding_progress_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_onboarding_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "onboarding_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      account_risk_signals: {
        Row: {
          account_id: string
          body: string
          computed_at: string
          id: string
          rank: number
          severity: string
          title: string
        }
        Insert: {
          account_id: string
          body: string
          computed_at?: string
          id?: string
          rank: number
          severity: string
          title: string
        }
        Update: {
          account_id?: string
          body?: string
          computed_at?: string
          id?: string
          rank?: number
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_risk_signals_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          arr: number
          cohort_id: string | null
          created_at: string
          csm: string
          csm_user_id: string | null
          days_since_signup: number
          features_adopted: number
          features_total: number
          health_score: number
          id: string
          industry: string
          invited_seats: number
          last_active: string
          last_active_at: string | null
          name: string
          onboarding_completion: number
          primary_risk: string
          risk_level: string
          seats: number
          weekly_active_users: number
        }
        Insert: {
          arr?: number
          cohort_id?: string | null
          created_at?: string
          csm?: string
          csm_user_id?: string | null
          days_since_signup?: number
          features_adopted?: number
          features_total?: number
          health_score?: number
          id: string
          industry: string
          invited_seats?: number
          last_active?: string
          last_active_at?: string | null
          name: string
          onboarding_completion?: number
          primary_risk?: string
          risk_level?: string
          seats?: number
          weekly_active_users?: number
        }
        Update: {
          arr?: number
          cohort_id?: string | null
          created_at?: string
          csm?: string
          csm_user_id?: string | null
          days_since_signup?: number
          features_adopted?: number
          features_total?: number
          health_score?: number
          id?: string
          industry?: string
          invited_seats?: number
          last_active?: string
          last_active_at?: string | null
          name?: string
          onboarding_completion?: number
          primary_risk?: string
          risk_level?: string
          seats?: number
          weekly_active_users?: number
        }
        Relationships: [
          {
            foreignKeyName: "accounts_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_csm_user_id_fkey"
            columns: ["csm_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activation_funnel: {
        Row: {
          count: number
          ordinal: number
          pct: number
          stage: string
        }
        Insert: {
          count: number
          ordinal: number
          pct: number
          stage: string
        }
        Update: {
          count?: number
          ordinal?: number
          pct?: number
          stage?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          action: string
          body: string
          id: string
          ordinal: number
          severity: string
          title: string
        }
        Insert: {
          action: string
          body: string
          id?: string
          ordinal: number
          severity: string
          title: string
        }
        Update: {
          action?: string
          body?: string
          id?: string
          ordinal?: number
          severity?: string
          title?: string
        }
        Relationships: []
      }
      churn_trend: {
        Row: {
          churn: number
          ordinal: number
          retention: number
          week: string
        }
        Insert: {
          churn: number
          ordinal: number
          retention: number
          week: string
        }
        Update: {
          churn?: number
          ordinal?: number
          retention?: number
          week?: string
        }
        Relationships: []
      }
      cohorts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          started_at: string | null
          window_days: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          started_at?: string | null
          window_days?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          started_at?: string | null
          window_days?: number
        }
        Relationships: []
      }
      exports: {
        Row: {
          created_at: string
          created_by: string
          format: string
          id: string
          period_label: string
          size_bytes: number
          storage_path: string
        }
        Insert: {
          created_at?: string
          created_by: string
          format: string
          id?: string
          period_label: string
          size_bytes?: number
          storage_path: string
        }
        Update: {
          created_at?: string
          created_by?: string
          format?: string
          id?: string
          period_label?: string
          size_bytes?: number
          storage_path?: string
        }
        Relationships: []
      }
      interventions: {
        Row: {
          account_id: string
          body: string
          channel: string
          id: string
          sent_at: string
          sent_by: string
          template_key: string | null
        }
        Insert: {
          account_id: string
          body: string
          channel?: string
          id?: string
          sent_at?: string
          sent_by: string
          template_key?: string | null
        }
        Update: {
          account_id?: string
          body?: string
          channel?: string
          id?: string
          sent_at?: string
          sent_by?: string
          template_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interventions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_vs_retention: {
        Row: {
          churned: number
          cohort: string
          retained: number
        }
        Insert: {
          churned: number
          cohort: string
          retained: number
        }
        Update: {
          churned?: number
          cohort?: string
          retained?: number
        }
        Relationships: []
      }
      kpi_definitions: {
        Row: {
          calculation: string
          created_at: string
          key: string
          recommendation: string | null
          updated_at: string
          why: string
        }
        Insert: {
          calculation: string
          created_at?: string
          key: string
          recommendation?: string | null
          updated_at?: string
          why: string
        }
        Update: {
          calculation?: string
          created_at?: string
          key?: string
          recommendation?: string | null
          updated_at?: string
          why?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpi_definitions_key_fkey"
            columns: ["key"]
            isOneToOne: true
            referencedRelation: "kpis"
            referencedColumns: ["key"]
          },
        ]
      }
      kpis: {
        Row: {
          delta: number
          inverse: boolean
          key: string
          label: string
          suffix: string
          value: number
        }
        Insert: {
          delta?: number
          inverse?: boolean
          key: string
          label: string
          suffix?: string
          value: number
        }
        Update: {
          delta?: number
          inverse?: boolean
          key?: string
          label?: string
          suffix?: string
          value?: number
        }
        Relationships: []
      }
      onboarding_steps: {
        Row: {
          created_at: string
          id: string
          key: string
          label: string
          ordinal: number
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          label: string
          ordinal: number
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          label?: string
          ordinal?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recommended_interventions: {
        Row: {
          id: string
          impact: string
          name: string
          ordinal: number
          time_estimate: string
        }
        Insert: {
          id?: string
          impact: string
          name: string
          ordinal: number
          time_estimate: string
        }
        Update: {
          id?: string
          impact?: string
          name?: string
          ordinal?: number
          time_estimate?: string
        }
        Relationships: []
      }
      top_drivers: {
        Row: {
          driver: string
          id: string
          ordinal: number
          pct: number
          trend: string
        }
        Insert: {
          driver: string
          id?: string
          ordinal: number
          pct: number
          trend: string
        }
        Update: {
          driver?: string
          id?: string
          ordinal?: number
          pct?: number
          trend?: string
        }
        Relationships: []
      }
      user_quotes: {
        Row: {
          context: string
          id: string
          ordinal: number
          person: string
          quote: string
        }
        Insert: {
          context: string
          id?: string
          ordinal: number
          person: string
          quote: string
        }
        Update: {
          context?: string
          id?: string
          ordinal?: number
          person?: string
          quote?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "csm" | "viewer"
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
      app_role: ["admin", "csm", "viewer"],
    },
  },
} as const
