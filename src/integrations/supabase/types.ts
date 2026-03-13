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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_invites: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invitee_email: string
          inviter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email: string
          inviter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email?: string
          inviter_id?: string
          status?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          consultant_type: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          consultant_type?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          consultant_type?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          consultant_type: string
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          images: string[] | null
          role: string
          user_id: string
        }
        Insert: {
          consultant_type?: string
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          role: string
          user_id: string
        }
        Update: {
          consultant_type?: string
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          amount_cents: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          type?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string
          current_amount: number
          deadline: string
          id: string
          name: string
          target_amount: number
          user_id: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          current_amount?: number
          deadline?: string
          id?: string
          name?: string
          target_amount?: number
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          current_amount?: number
          deadline?: string
          id?: string
          name?: string
          target_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          amount: number
          country: string | null
          created_at: string
          current_value: number
          date: string
          id: string
          name: string
          portfolio_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          amount?: number
          country?: string | null
          created_at?: string
          current_value?: number
          date?: string
          id?: string
          name?: string
          portfolio_id?: string | null
          type?: string
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          amount?: number
          country?: string | null
          created_at?: string
          current_value?: number
          date?: string
          id?: string
          name?: string
          portfolio_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          preferred_account_type:
            | Database["public"]["Enums"]["account_type"]
            | null
          referral_code: string | null
          referred_by: string | null
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          trial_end: string | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          preferred_account_type?:
            | Database["public"]["Enums"]["account_type"]
            | null
          referral_code?: string | null
          referred_by?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_end?: string | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          preferred_account_type?:
            | Database["public"]["Enums"]["account_type"]
            | null
          referral_code?: string | null
          referred_by?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_end?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_accounts: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          partner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          partner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          partner_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          amount: number
          category: string
          created_at: string
          currency: string
          date: string
          description: string
          entry_type: Database["public"]["Enums"]["entry_type"] | null
          frequency: Database["public"]["Enums"]["frequency_type"] | null
          id: string
          installments: number | null
          is_percentage: boolean | null
          percentage: number | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          amount?: number
          category?: string
          created_at?: string
          currency?: string
          date?: string
          description?: string
          entry_type?: Database["public"]["Enums"]["entry_type"] | null
          frequency?: Database["public"]["Enums"]["frequency_type"] | null
          id?: string
          installments?: number | null
          is_percentage?: boolean | null
          percentage?: number | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          amount?: number
          category?: string
          created_at?: string
          currency?: string
          date?: string
          description?: string
          entry_type?: Database["public"]["Enums"]["entry_type"] | null
          frequency?: Database["public"]["Enums"]["frequency_type"] | null
          id?: string
          installments?: number | null
          is_percentage?: boolean | null
          percentage?: number | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      user_financial_preferences: {
        Row: {
          category: string | null
          created_at: string
          id: string
          preference: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          preference: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          preference?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_id: string
          device_name: string | null
          id: string
          ip_address: string | null
          last_active_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          device_name?: string | null
          id?: string
          ip_address?: string | null
          last_active_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          device_name?: string | null
          id?: string
          ip_address?: string | null
          last_active_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          address: string | null
          address_complement: string | null
          address_number: string | null
          bank_account: string | null
          bank_agency: string | null
          bank_name: string | null
          city: string | null
          city_registration: string | null
          company_name: string | null
          created_at: string
          document_number: string | null
          document_type: string | null
          evolution_api_key: string | null
          evolution_api_url: string | null
          evolution_instance: string | null
          full_name: string | null
          id: string
          n8n_webhook_url: string | null
          neighborhood: string | null
          notification_time: string | null
          notify_due_dates: boolean | null
          notify_due_days_before: number | null
          notify_email: boolean | null
          notify_whatsapp: boolean | null
          phone: string | null
          pix_key: string | null
          pix_key_type: string | null
          state: string | null
          state_registration: string | null
          tax_regime: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          city?: string | null
          city_registration?: string | null
          company_name?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: string | null
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          evolution_instance?: string | null
          full_name?: string | null
          id?: string
          n8n_webhook_url?: string | null
          neighborhood?: string | null
          notification_time?: string | null
          notify_due_dates?: boolean | null
          notify_due_days_before?: number | null
          notify_email?: boolean | null
          notify_whatsapp?: boolean | null
          phone?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          state?: string | null
          state_registration?: string | null
          tax_regime?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          city?: string | null
          city_registration?: string | null
          company_name?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: string | null
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          evolution_instance?: string | null
          full_name?: string | null
          id?: string
          n8n_webhook_url?: string | null
          neighborhood?: string | null
          notification_time?: string | null
          notify_due_dates?: boolean | null
          notify_due_days_before?: number | null
          notify_email?: boolean | null
          notify_whatsapp?: boolean | null
          phone?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          state?: string | null
          state_registration?: string | null
          tax_regime?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_referral: {
        Args: { new_user_id: string; referrer_code: string }
        Returns: boolean
      }
      cleanup_stale_sessions: { Args: never; Returns: undefined }
      count_active_sessions: { Args: { _user_id: string }; Returns: number }
      generate_referral_code: { Args: never; Returns: string }
      get_partner_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_premium_shared: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      account_type: "personal" | "business"
      app_role: "admin" | "moderator" | "user"
      entry_type: "single" | "installment" | "recurring"
      frequency_type: "monthly" | "yearly"
      subscription_tier: "free" | "premium"
      transaction_status: "paid" | "pending"
      transaction_type: "income" | "expense"
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
      account_type: ["personal", "business"],
      app_role: ["admin", "moderator", "user"],
      entry_type: ["single", "installment", "recurring"],
      frequency_type: ["monthly", "yearly"],
      subscription_tier: ["free", "premium"],
      transaction_status: ["paid", "pending"],
      transaction_type: ["income", "expense"],
    },
  },
} as const
