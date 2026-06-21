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
      fertilizer_schedules: {
        Row: {
          created_at: string
          fertilizer_name: string
          frequency: Database["public"]["Enums"]["frequency"]
          id: string
          plant_id: string
          quantity: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["task_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          fertilizer_name: string
          frequency?: Database["public"]["Enums"]["frequency"]
          id?: string
          plant_id: string
          quantity?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["task_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          fertilizer_name?: string
          frequency?: Database["public"]["Enums"]["frequency"]
          id?: string
          plant_id?: string
          quantity?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["task_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fertilizer_schedules_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_logs: {
        Row: {
          created_at: string
          health: Database["public"]["Enums"]["health_rating"]
          height_cm: number | null
          id: string
          image_url: string | null
          leaf_count: number | null
          observation: string | null
          plant_id: string
          recorded_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          health?: Database["public"]["Enums"]["health_rating"]
          height_cm?: number | null
          id?: string
          image_url?: string | null
          leaf_count?: number | null
          observation?: string | null
          plant_id: string
          recorded_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          health?: Database["public"]["Enums"]["health_rating"]
          height_cm?: number | null
          id?: string
          image_url?: string | null
          leaf_count?: number | null
          observation?: string | null
          plant_id?: string
          recorded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_logs_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      harvests: {
        Row: {
          created_at: string
          grade: Database["public"]["Enums"]["quality_grade"]
          harvest_date: string
          id: string
          notes: string | null
          plant_id: string
          quantity: number
          unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          grade?: Database["public"]["Enums"]["quality_grade"]
          harvest_date?: string
          id?: string
          notes?: string | null
          plant_id: string
          quantity: number
          unit?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          grade?: Database["public"]["Enums"]["quality_grade"]
          harvest_date?: string
          id?: string
          notes?: string | null
          plant_id?: string
          quantity?: number
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "harvests_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      pesticide_schedules: {
        Row: {
          created_at: string
          frequency: Database["public"]["Enums"]["frequency"]
          id: string
          instructions: string | null
          pesticide_name: string
          plant_id: string
          quantity: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["task_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency?: Database["public"]["Enums"]["frequency"]
          id?: string
          instructions?: string | null
          pesticide_name: string
          plant_id: string
          quantity?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["task_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: Database["public"]["Enums"]["frequency"]
          id?: string
          instructions?: string | null
          pesticide_name?: string
          plant_id?: string
          quantity?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["task_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pesticide_schedules_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plants: {
        Row: {
          created_at: string
          crop_type: string
          estimated_harvest_date: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          planting_date: string
          quantity: number
          status: Database["public"]["Enums"]["crop_status"]
          updated_at: string
          user_id: string
          variety: string | null
        }
        Insert: {
          created_at?: string
          crop_type: string
          estimated_harvest_date?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          planting_date: string
          quantity?: number
          status?: Database["public"]["Enums"]["crop_status"]
          updated_at?: string
          user_id: string
          variety?: string | null
        }
        Update: {
          created_at?: string
          crop_type?: string
          estimated_harvest_date?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          planting_date?: string
          quantity?: number
          status?: Database["public"]["Enums"]["crop_status"]
          updated_at?: string
          user_id?: string
          variety?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
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
      watering_schedules: {
        Row: {
          amount: string | null
          created_at: string
          frequency: Database["public"]["Enums"]["frequency"]
          id: string
          notes: string | null
          plant_id: string
          scheduled_at: string
          status: Database["public"]["Enums"]["task_status"]
          user_id: string
        }
        Insert: {
          amount?: string | null
          created_at?: string
          frequency?: Database["public"]["Enums"]["frequency"]
          id?: string
          notes?: string | null
          plant_id: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["task_status"]
          user_id: string
        }
        Update: {
          amount?: string | null
          created_at?: string
          frequency?: Database["public"]["Enums"]["frequency"]
          id?: string
          notes?: string | null
          plant_id?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["task_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watering_schedules_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "farmer" | "viewer"
      crop_status: "seeded" | "growing" | "nearly_ready" | "ready" | "harvested"
      frequency:
        | "daily"
        | "alternate"
        | "weekly"
        | "biweekly"
        | "monthly"
        | "custom"
      health_rating: "excellent" | "good" | "average" | "poor"
      quality_grade: "A" | "B" | "C"
      task_status: "pending" | "completed" | "missed"
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
      app_role: ["admin", "farmer", "viewer"],
      crop_status: ["seeded", "growing", "nearly_ready", "ready", "harvested"],
      frequency: [
        "daily",
        "alternate",
        "weekly",
        "biweekly",
        "monthly",
        "custom",
      ],
      health_rating: ["excellent", "good", "average", "poor"],
      quality_grade: ["A", "B", "C"],
      task_status: ["pending", "completed", "missed"],
    },
  },
} as const
