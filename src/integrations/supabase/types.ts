export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      booking_players: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          padel_rental: boolean
          player_id: string
          player_share: number
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          padel_rental?: boolean
          player_id: string
          player_share: number
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          padel_rental?: boolean
          player_id?: string
          player_share?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_players_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          court_id: string
          court_price: number
          created_at: string
          created_by: string | null
          date: string
          end_time: string
          id: string
          notes: string | null
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          type: Database["public"]["Enums"]["booking_type"]
          updated_at: string
        }
        Insert: {
          court_id: string
          court_price: number
          created_at?: string
          created_by?: string | null
          date: string
          end_time: string
          id?: string
          notes?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          type?: Database["public"]["Enums"]["booking_type"]
          updated_at?: string
        }
        Update: {
          court_id?: string
          court_price?: number
          created_at?: string
          created_by?: string | null
          date?: string
          end_time?: string
          id?: string
          notes?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          type?: Database["public"]["Enums"]["booking_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
        ]
      }
      courts: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_balances: {
        Row: {
          calculated_amount: number
          cash_in_register: number
          closed_at: string
          closed_by: string | null
          date: string
          difference: number
          id: string
          notes: string | null
          starting_amount: number
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          calculated_amount: number
          cash_in_register: number
          closed_at?: string
          closed_by?: string | null
          date: string
          difference: number
          id?: string
          notes?: string | null
          starting_amount: number
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          calculated_amount?: number
          cash_in_register?: number
          closed_at?: string
          closed_by?: string | null
          date?: string
          difference?: number
          id?: string
          notes?: string | null
          starting_amount?: number
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          receipt: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          receipt?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          receipt?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          special_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          special_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          special_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      product_inventory: {
        Row: {
          created_at: string
          id: string
          new_stock: number
          product_id: string
          product_name: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_stock?: number
          product_id: string
          product_name: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          new_stock?: number
          product_id?: string
          product_name?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          cost: number
          created_at: string
          id: string
          min_stock: number | null
          name: string
          price: number
          stock: number
          updated_at: string
        }
        Insert: {
          category: string
          cost: number
          created_at?: string
          id?: string
          min_stock?: number | null
          name: string
          price: number
          stock: number
          updated_at?: string
        }
        Update: {
          category?: string
          cost?: number
          created_at?: string
          id?: string
          min_stock?: number | null
          name?: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          price: number
          product_id: string
          quantity: number
          sale_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          product_id: string
          quantity: number
          sale_id: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          product_id?: string
          quantity?: number
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          payment_method: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_method: string
          total_amount: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          total_amount?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_product_stock: {
        Args: {
          product_id_param: string
          quantity_param: number
          is_addition: boolean
        }
        Returns: undefined
      }
      initialize_product_inventory: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_product_stock: {
        Args: { p_id: string; p_stock: number }
        Returns: undefined
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      booking_type: "regular" | "tournament" | "coaching" | "americano"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      booking_type: ["regular", "tournament", "coaching", "americano"],
    },
  },
} as const
