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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          availability_id: string
          booking_date: string
          booking_time: string
          created_at: string | null
          guest_count: number
          id: string
          payment_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          tour_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability_id: string
          booking_date: string
          booking_time: string
          created_at?: string | null
          guest_count: number
          id?: string
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          tour_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability_id?: string
          booking_date?: string
          booking_time?: string
          created_at?: string | null
          guest_count?: number
          id?: string
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          tour_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "tour_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_availability: {
        Row: {
          available_date: string
          available_spots: number
          created_at: string | null
          id: string
          is_available: boolean | null
          time_slots: Json
          tour_id: string
          updated_at: string | null
        }
        Insert: {
          available_date: string
          available_spots: number
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          time_slots?: Json
          tour_id: string
          updated_at?: string | null
        }
        Update: {
          available_date?: string
          available_spots?: number
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          time_slots?: Json
          tour_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_availability_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tours: {
        Row: {
          cancellation_policy: string
          category: string | null
          city: string
          coordinates: Json | null
          created_at: string | null
          created_by: string | null
          description: string
          duration: string
          duration_days: number | null
          full_description: string | null
          highlights: Json | null
          id: string
          images: Json | null
          included: Json | null
          is_active: boolean | null
          is_featured: boolean | null
          location: string
          location_type: string | null
          max_group_size: number
          meeting_point: string
          original_price: number | null
          price: number
          rating: number | null
          review_count: number | null
          title: string
          tour_type: string | null
          updated_at: string | null
        }
        Insert: {
          cancellation_policy: string
          category?: string | null
          city: string
          coordinates?: Json | null
          created_at?: string | null
          created_by?: string | null
          description: string
          duration: string
          duration_days?: number | null
          full_description?: string | null
          highlights?: Json | null
          id?: string
          images?: Json | null
          included?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location: string
          location_type?: string | null
          max_group_size: number
          meeting_point: string
          original_price?: number | null
          price: number
          rating?: number | null
          review_count?: number | null
          title: string
          tour_type?: string | null
          updated_at?: string | null
        }
        Update: {
          cancellation_policy?: string
          category?: string | null
          city?: string
          coordinates?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          duration?: string
          duration_days?: number | null
          full_description?: string | null
          highlights?: Json | null
          id?: string
          images?: Json | null
          included?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string
          location_type?: string | null
          max_group_size?: number
          meeting_point?: string
          original_price?: number | null
          price?: number
          rating?: number | null
          review_count?: number | null
          title?: string
          tour_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tours_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          email_notifications: boolean | null
          full_name: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_login: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          sms_notifications: boolean | null
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          email_notifications?: boolean | null
          full_name: string
          id: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sms_notifications?: boolean | null
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          email_notifications?: boolean | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sms_notifications?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_booking_availability: {
        Args: { availability_id: string; requested_spots: number }
        Returns: boolean
      }
      create_booking_safe: {
        Args: {
          p_availability_id: string
          p_booking_date: string
          p_booking_time: string
          p_guest_count: number
          p_special_requests?: string
          p_total_amount: number
          p_tour_id: string
          p_user_id: string
        }
        Returns: string
      }
      get_available_tours: {
        Args: {
          filter_city?: string
          filter_search?: string
          limit_count?: number
          max_price?: number
          min_price?: number
          offset_count?: number
        }
        Returns: {
          city: string
          description: string
          duration: string
          id: string
          images: Json
          is_featured: boolean
          location: string
          original_price: number
          price: number
          rating: number
          review_count: number
          title: string
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      owns_resource: {
        Args: { resource_user_id: string }
        Returns: boolean
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      payment_status: "pending" | "paid" | "refunded" | "failed"
      user_role: "admin" | "user"
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
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      payment_status: ["pending", "paid", "refunded", "failed"],
      user_role: ["admin", "user"],
    },
  },
} as const

      bookings: {
        Row: {
          availability_id: string
          booking_date: string
          booking_time: string
          created_at: string | null
          guest_count: number
          id: string
          payment_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          tour_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability_id: string
          booking_date: string
          booking_time: string
          created_at?: string | null
          guest_count: number
          id?: string
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          tour_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability_id?: string
          booking_date?: string
          booking_time?: string
          created_at?: string | null
          guest_count?: number
          id?: string
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          tour_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "tour_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_availability: {
        Row: {
          available_date: string
          available_spots: number
          created_at: string | null
          id: string
          is_available: boolean | null
          time_slots: Json
          tour_id: string
          updated_at: string | null
        }
        Insert: {
          available_date: string
          available_spots: number
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          time_slots?: Json
          tour_id: string
          updated_at?: string | null
        }
        Update: {
          available_date?: string
          available_spots?: number
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          time_slots?: Json
          tour_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_availability_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tours: {
        Row: {
          cancellation_policy: string
          city: string
          created_at: string | null
          created_by: string | null
          description: string
          duration: string
          full_description: string | null
          highlights: Json | null
          id: string
          images: Json | null
          included: Json | null
          is_active: boolean | null
          is_featured: boolean | null
          location: string
          max_group_size: number
          meeting_point: string
          original_price: number | null
          price: number
          rating: number | null
          review_count: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cancellation_policy: string
          city: string
          created_at?: string | null
          created_by?: string | null
          description: string
          duration: string
          full_description?: string | null
          highlights?: Json | null
          id?: string
          images?: Json | null
          included?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location: string
          max_group_size: number
          meeting_point: string
          original_price?: number | null
          price: number
          rating?: number | null
          review_count?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cancellation_policy?: string
          city?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          duration?: string
          full_description?: string | null
          highlights?: Json | null
          id?: string
          images?: Json | null
          included?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string
          max_group_size?: number
          meeting_point?: string
          original_price?: number | null
          price?: number
          rating?: number | null
          review_count?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      payment_status: "pending" | "paid" | "failed" | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never