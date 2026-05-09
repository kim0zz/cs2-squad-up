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
      events: {
        Row: {
          activity_type: string
          created_at: string
          cs_mode: string
          description: string | null
          discord_info: string
          id: string
          max_players: number
          public_slug: string
          starts_at: string
          status: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          activity_type?: string
          created_at?: string
          cs_mode: string
          description?: string | null
          discord_info: string
          id?: string
          max_players: number
          public_slug: string
          starts_at: string
          status?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          cs_mode?: string
          description?: string | null
          discord_info?: string
          id?: string
          max_players?: number
          public_slug?: string
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          created_at: string
          event_id: string
          id: string
          nickname: string
          response_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          nickname: string
          response_status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          nickname?: string
          response_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      padel_gatherings: {
        Row: {
          id: string
          public_slug: string
          title: string
          description: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          public_slug: string
          title: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          public_slug?: string
          title?: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      padel_options: {
        Row: {
          id: string
          gathering_id: string
          venue_name: string
          starts_at: string
          duration_minutes: number | null
          price_per_person: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gathering_id: string
          venue_name: string
          starts_at: string
          duration_minutes?: number | null
          price_per_person?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gathering_id?: string
          venue_name?: string
          starts_at?: string
          duration_minutes?: number | null
          price_per_person?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "padel_options_gathering_id_fkey"
            columns: ["gathering_id"]
            isOneToOne: false
            referencedRelation: "padel_gatherings"
            referencedColumns: ["id"]
          },
        ]
      }
      padel_votes: {
        Row: {
          id: string
          option_id: string
          nickname: string
          vote_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          option_id: string
          nickname: string
          vote_status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          option_id?: string
          nickname?: string
          vote_status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "padel_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "padel_options"
            referencedColumns: ["id"]
          },
        ]
      }
      football_series: {
        Row: {
          id: string
          public_slug: string
          admin_token: string
          title: string
          location: string
          weekday: number
          start_time: string
          max_players: number
          regular_deadline_hours_before: number
          description: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          public_slug: string
          admin_token: string
          title: string
          location: string
          weekday: number
          start_time: string
          max_players: number
          regular_deadline_hours_before?: number
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          public_slug?: string
          admin_token?: string
          title?: string
          location?: string
          weekday?: number
          start_time?: string
          max_players?: number
          regular_deadline_hours_before?: number
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      football_occurrences: {
        Row: {
          id: string
          series_id: string
          public_slug: string
          starts_at: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          series_id: string
          public_slug: string
          starts_at: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          series_id?: string
          starts_at?: string
          status?: string
          public_slug?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "football_occurrences_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "football_series"
            referencedColumns: ["id"]
          },
        ]
      }
      football_regular_players: {
        Row: {
          id: string
          series_id: string
          nickname: string
          created_at: string
        }
        Insert: {
          id?: string
          series_id: string
          nickname: string
          created_at?: string
        }
        Update: {
          id?: string
          series_id?: string
          nickname?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "football_regular_players_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "football_series"
            referencedColumns: ["id"]
          },
        ]
      }
      football_signups: {
        Row: {
          id: string
          occurrence_id: string
          nickname: string
          is_regular: boolean
          response_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          occurrence_id: string
          nickname: string
          is_regular?: boolean
          response_status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          occurrence_id?: string
          nickname?: string
          is_regular?: boolean
          response_status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "football_signups_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "football_occurrences"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
