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
          achievement_key: string
          created_at: string
          id: string
          progress_current: number | null
          progress_total: number | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_key: string
          created_at?: string
          id?: string
          progress_current?: number | null
          progress_total?: number | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_key?: string
          created_at?: string
          id?: string
          progress_current?: number | null
          progress_total?: number | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      diagnostic_results: {
        Row: {
          answers: Json | null
          classification: string
          created_at: string
          id: string
          main_problem: string | null
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          classification: string
          created_at?: string
          id?: string
          main_problem?: string | null
          score: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          classification?: string
          created_at?: string
          id?: string
          main_problem?: string | null
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          partner_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          partner_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          partner_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_benefits: {
        Row: {
          created_at: string
          description: string | null
          discount: string
          id: string
          partner_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount: string
          id?: string
          partner_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount?: string
          id?: string
          partner_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_benefits_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_photos: {
        Row: {
          created_at: string
          id: string
          partner_id: string
          photo_url: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          partner_id: string
          photo_url: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          partner_id?: string
          photo_url?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_photos_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          address: string | null
          banner_url: string | null
          category: string
          city: string | null
          created_at: string
          created_by: string | null
          description: string | null
          discount: string
          distance: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          maps_link: string | null
          name: string
          phone: string | null
          profile_image_url: string | null
          rating: number | null
          responsible: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          category: string
          city?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount: string
          distance?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          maps_link?: string | null
          name: string
          phone?: string | null
          profile_image_url?: string | null
          rating?: number | null
          responsible?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          category?: string
          city?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount?: string
          distance?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          maps_link?: string | null
          name?: string
          phone?: string | null
          profile_image_url?: string | null
          rating?: number | null
          responsible?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          card_number: string
          company: string | null
          created_at: string
          email: string | null
          id: string
          is_founding: boolean | null
          is_public: boolean | null
          name: string
          phone: string | null
          segment: string | null
          updated_at: string
          user_id: string
          what_i_offer: string | null
          what_i_seek: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          card_number: string
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_founding?: boolean | null
          is_public?: boolean | null
          name?: string
          phone?: string | null
          segment?: string | null
          updated_at?: string
          user_id: string
          what_i_offer?: string | null
          what_i_seek?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          card_number?: string
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_founding?: boolean | null
          is_public?: boolean | null
          name?: string
          phone?: string | null
          segment?: string | null
          updated_at?: string
          user_id?: string
          what_i_offer?: string | null
          what_i_seek?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          benefit_id: string | null
          benefit_used: string | null
          coupon_code: string | null
          created_at: string
          discount_amount: number
          id: string
          partner_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          benefit_id?: string | null
          benefit_used?: string | null
          coupon_code?: string | null
          created_at?: string
          discount_amount?: number
          id?: string
          partner_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          benefit_id?: string | null
          benefit_used?: string | null
          coupon_code?: string | null
          created_at?: string
          discount_amount?: number
          id?: string
          partner_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "partner_benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          alimentacao: number | null
          ambiente: number | null
          atendimento: number | null
          comment: string | null
          created_at: string
          id: string
          overall: number
          partner_id: string
          recepcao: number | null
          user_id: string
        }
        Insert: {
          alimentacao?: number | null
          ambiente?: number | null
          atendimento?: number | null
          comment?: string | null
          created_at?: string
          id?: string
          overall?: number
          partner_id: string
          recepcao?: number | null
          user_id: string
        }
        Update: {
          alimentacao?: number | null
          ambiente?: number | null
          atendimento?: number | null
          comment?: string | null
          created_at?: string
          id?: string
          overall?: number
          partner_id?: string
          recepcao?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          code: string
          created_at: string
          id: string
          referred_id: string | null
          referrer_id: string
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          referred_id?: string | null
          referrer_id: string
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          referred_id?: string | null
          referrer_id?: string
          used_at?: string | null
        }
        Relationships: []
      }
      talents: {
        Row: {
          age: number | null
          area: string
          availability: string | null
          committed: boolean | null
          created_at: string
          currently_working: boolean | null
          description: string | null
          desired_area: string | null
          experience: string | null
          id: string
          instagram: string | null
          is_active: boolean | null
          left_job_early: boolean | null
          left_job_reason: string | null
          location: string | null
          motivation: string | null
          name: string
          phone: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          area: string
          availability?: string | null
          committed?: boolean | null
          created_at?: string
          currently_working?: boolean | null
          description?: string | null
          desired_area?: string | null
          experience?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          left_job_early?: boolean | null
          left_job_reason?: string | null
          location?: string | null
          motivation?: string | null
          name: string
          phone?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          area?: string
          availability?: string | null
          committed?: boolean | null
          created_at?: string
          currently_working?: boolean | null
          description?: string | null
          desired_area?: string | null
          experience?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          left_job_early?: boolean | null
          left_job_reason?: string | null
          location?: string | null
          motivation?: string | null
          name?: string
          phone?: string | null
          tags?: string[] | null
          updated_at?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
