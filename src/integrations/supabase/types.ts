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
      admin_emails: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      construction_bookings: {
        Row: {
          bedrooms: number | null
          budget_range: string | null
          created_at: string
          email: string
          id: string
          land_size: number | null
          name: string
          notes: string | null
          phone: string | null
          style: string | null
          user_id: string | null
        }
        Insert: {
          bedrooms?: number | null
          budget_range?: string | null
          created_at?: string
          email: string
          id?: string
          land_size?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          style?: string | null
          user_id?: string | null
        }
        Update: {
          bedrooms?: number | null
          budget_range?: string | null
          created_at?: string
          email?: string
          id?: string
          land_size?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          style?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      construction_project_updates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          project_id: string
          stage: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          project_id: string
          stage: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          project_id?: string
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "construction_project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "construction_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_projects: {
        Row: {
          booking_id: string | null
          created_at: string
          current_stage: string
          eta: string | null
          id: string
          name: string
          notes: string | null
          progress_percent: number
          started_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          current_stage?: string
          eta?: string | null
          id?: string
          name: string
          notes?: string | null
          progress_percent?: number
          started_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          current_stage?: string
          eta?: string | null
          id?: string
          name?: string
          notes?: string | null
          progress_percent?: number
          started_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "construction_projects_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "construction_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_requests: {
        Row: {
          budget: string | null
          created_at: string
          email: string
          id: string
          land_size: number | null
          location: string | null
          message: string | null
          name: string
          phone: string | null
          style: string | null
          user_id: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string
          email: string
          id?: string
          land_size?: number | null
          location?: string | null
          message?: string | null
          name: string
          phone?: string | null
          style?: string | null
          user_id?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string
          email?: string
          id?: string
          land_size?: number | null
          location?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          style?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      doors_windows_quotes: {
        Row: {
          address: string | null
          category: string
          created_at: string
          design_name: string
          design_slug: string
          estimated_high: number
          estimated_low: number
          full_name: string | null
          height_in: number
          id: string
          kind: string
          material: string
          notes: string | null
          phone: string | null
          quantity: number
          status: string
          updated_at: string
          user_id: string
          width_in: number
        }
        Insert: {
          address?: string | null
          category: string
          created_at?: string
          design_name: string
          design_slug: string
          estimated_high?: number
          estimated_low?: number
          full_name?: string | null
          height_in: number
          id?: string
          kind: string
          material: string
          notes?: string | null
          phone?: string | null
          quantity?: number
          status?: string
          updated_at?: string
          user_id: string
          width_in: number
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string
          design_name?: string
          design_slug?: string
          estimated_high?: number
          estimated_low?: number
          full_name?: string | null
          height_in?: number
          id?: string
          kind?: string
          material?: string
          notes?: string | null
          phone?: string | null
          quantity?: number
          status?: string
          updated_at?: string
          user_id?: string
          width_in?: number
        }
        Relationships: []
      }
      material_orders: {
        Row: {
          city: string | null
          created_at: string
          delivery_address: string
          full_name: string
          id: string
          items: Json
          notes: string | null
          payment_id: string | null
          payment_status: string
          phone: string
          pincode: string | null
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          delivery_address: string
          full_name: string
          id?: string
          items: Json
          notes?: string | null
          payment_id?: string | null
          payment_status?: string
          phone: string
          pincode?: string | null
          status?: string
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          delivery_address?: string
          full_name?: string
          id?: string
          items?: Json
          notes?: string | null
          payment_id?: string | null
          payment_status?: string
          phone?: string
          pincode?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_orders_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          stock: number
          unit: string
          vendor_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock?: number
          unit: string
          vendor_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock?: number
          unit?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: string
          method: string
          reference_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kind: string
          method?: string
          reference_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: string
          method?: string
          reference_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_line: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string
          id: string
          land_size: number | null
          location: string | null
          name: string
          status: string
          style: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          id?: string
          land_size?: number | null
          location?: string | null
          name: string
          status?: string
          style?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          id?: string
          land_size?: number | null
          location?: string | null
          name?: string
          status?: string
          style?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_services: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          service_slug: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          service_slug: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          service_slug?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          address: string
          category: string
          city: string | null
          created_at: string
          estimated_price: number
          full_name: string
          id: string
          phone: string
          pincode: string | null
          problem: string | null
          scheduled_date: string
          status: string
          time_slot: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          category: string
          city?: string | null
          created_at?: string
          estimated_price?: number
          full_name: string
          id?: string
          phone: string
          pincode?: string | null
          problem?: string | null
          scheduled_date: string
          status?: string
          time_slot: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          category?: string
          city?: string | null
          created_at?: string
          estimated_price?: number
          full_name?: string
          id?: string
          phone?: string
          pincode?: string | null
          problem?: string | null
          scheduled_date?: string
          status?: string
          time_slot?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_quotations: {
        Row: {
          booking_id: string
          created_at: string
          created_by: string | null
          decided_at: string | null
          id: string
          labor_cost: number
          material_cost: number
          notes: string | null
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          created_by?: string | null
          decided_at?: string | null
          id?: string
          labor_cost?: number
          material_cost?: number
          notes?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          created_by?: string | null
          decided_at?: string | null
          id?: string
          labor_cost?: number
          material_cost?: number
          notes?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_quotations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          business_name: string
          city: string | null
          contact_name: string | null
          created_at: string
          id: string
          notes: string | null
          phone: string | null
          pincode: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_name: string
          city?: string | null
          contact_name?: string | null
          created_at?: string
          id: string
          notes?: string | null
          phone?: string | null
          pincode?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_name?: string
          city?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          phone?: string | null
          pincode?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_vendor: { Args: { _uid: string }; Returns: boolean }
      vendor_status: { Args: { _uid: string }; Returns: string }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
