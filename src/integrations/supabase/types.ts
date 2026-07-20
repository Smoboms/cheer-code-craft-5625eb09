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
      additional_cards: {
        Row: {
          card_number: string
          created_at: string
          holder_name: string
          id: string
          is_active: boolean
          owner_user_id: string
          relationship: string | null
          updated_at: string
        }
        Insert: {
          card_number: string
          created_at?: string
          holder_name: string
          id?: string
          is_active?: boolean
          owner_user_id: string
          relationship?: string | null
          updated_at?: string
        }
        Update: {
          card_number?: string
          created_at?: string
          holder_name?: string
          id?: string
          is_active?: boolean
          owner_user_id?: string
          relationship?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          target_id: string | null
          target_label: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          target_id?: string | null
          target_label?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          target_id?: string | null
          target_label?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      article_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      atalhos_da_casa: {
        Row: {
          ativo: boolean
          categoria: string | null
          created_at: string
          icone: string | null
          id: string
          link: string
          ordem: number
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          icone?: string | null
          id?: string
          link: string
          ordem?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          icone?: string | null
          id?: string
          link?: string
          ordem?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          uf: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          uf: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          uf?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_cashback_balances: {
        Row: {
          balance: number
          created_at: string
          id: string
          partner_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          partner_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          partner_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_cashback_balances_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          cashback_amount: number
          code: string
          created_at: string
          discount_percent: number
          id: string
          partner_id: string
          purchase_amount: number
          savings: number
          user_id: string
        }
        Insert: {
          cashback_amount?: number
          code: string
          created_at?: string
          discount_percent?: number
          id?: string
          partner_id: string
          purchase_amount?: number
          savings?: number
          user_id: string
        }
        Update: {
          cashback_amount?: number
          code?: string
          created_at?: string
          discount_percent?: number
          id?: string
          partner_id?: string
          purchase_amount?: number
          savings?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
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
      home_carousel_slides: {
        Row: {
          active: boolean
          city_id: string | null
          created_at: string
          icon: string | null
          id: string
          link: string | null
          sort_order: number
          text: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          city_id?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          link?: string | null
          sort_order?: number
          text?: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          city_id?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          link?: string | null
          sort_order?: number
          text?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_carousel_slides_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_articles: {
        Row: {
          body: string
          category: string
          city_id: string | null
          cover_url: string | null
          created_at: string
          excerpt: string
          featured: boolean
          id: string
          published_at: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          category: string
          city_id?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string
          featured?: boolean
          id?: string
          published_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string
          city_id?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string
          featured?: boolean
          id?: string
          published_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_articles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      lugares: {
        Row: {
          ativo: boolean
          categoria: string | null
          city_id: string | null
          created_at: string
          descricao: string | null
          endereco: string | null
          foto: string | null
          google_maps_url: string | null
          horario_funcionamento: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          site: string | null
          slug: string
          telefone: string | null
          tipo: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          city_id?: string | null
          created_at?: string
          descricao?: string | null
          endereco?: string | null
          foto?: string | null
          google_maps_url?: string | null
          horario_funcionamento?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          site?: string | null
          slug: string
          telefone?: string | null
          tipo: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          city_id?: string | null
          created_at?: string
          descricao?: string | null
          endereco?: string | null
          foto?: string | null
          google_maps_url?: string | null
          horario_funcionamento?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          site?: string | null
          slug?: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lugares_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      market_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      market_subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "market_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_products: {
        Row: {
          category: string | null
          city_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          images: string[]
          is_active: boolean
          is_featured: boolean
          market_category_id: string | null
          market_subcategory_id: string | null
          name: string
          partner_id: string
          price: number | null
          rejection_reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          is_featured?: boolean
          market_category_id?: string | null
          market_subcategory_id?: string | null
          name: string
          partner_id: string
          price?: number | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          is_featured?: boolean
          market_category_id?: string | null
          market_subcategory_id?: string | null
          name?: string
          partner_id?: string
          price?: number | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_products_market_category_id_fkey"
            columns: ["market_category_id"]
            isOneToOne: false
            referencedRelation: "market_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_products_market_subcategory_id_fkey"
            columns: ["market_subcategory_id"]
            isOneToOne: false
            referencedRelation: "market_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_products_partner_id_fkey"
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
      partner_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
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
          cashback_enabled: boolean
          cashback_feature_unlocked: boolean
          cashback_percent: number
          category: string
          city: string | null
          city_id: string | null
          cnpj: string | null
          created_at: string
          created_by: string | null
          description: string | null
          discount: string | null
          discount_percent: number | null
          display_order: number
          distance: string | null
          email: string | null
          id: string
          instagram: string | null
          is_active: boolean | null
          is_member: boolean
          legal_name: string | null
          logo_url: string | null
          maps_link: string | null
          name: string
          opening_hours: string | null
          phone: string | null
          products_feature_unlocked: boolean
          profile_image_url: string | null
          rating: number | null
          rejection_reason: string | null
          responsible: string | null
          status: string
          trade_name: string | null
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          cashback_enabled?: boolean
          cashback_feature_unlocked?: boolean
          cashback_percent?: number
          category: string
          city?: string | null
          city_id?: string | null
          cnpj?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount?: string | null
          discount_percent?: number | null
          display_order?: number
          distance?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          is_member?: boolean
          legal_name?: string | null
          logo_url?: string | null
          maps_link?: string | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          products_feature_unlocked?: boolean
          profile_image_url?: string | null
          rating?: number | null
          rejection_reason?: string | null
          responsible?: string | null
          status?: string
          trade_name?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          cashback_enabled?: boolean
          cashback_feature_unlocked?: boolean
          cashback_percent?: number
          category?: string
          city?: string | null
          city_id?: string | null
          cnpj?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount?: string | null
          discount_percent?: number | null
          display_order?: number
          distance?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          is_member?: boolean
          legal_name?: string | null
          logo_url?: string | null
          maps_link?: string | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          products_feature_unlocked?: boolean
          profile_image_url?: string | null
          rating?: number | null
          rejection_reason?: string | null
          responsible?: string | null
          status?: string
          trade_name?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          next_due_date: string | null
          notes: string | null
          partner_id: string | null
          payer_user_id: string | null
          payment_date: string
          revenue_stream_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          partner_id?: string | null
          payer_user_id?: string | null
          payment_date: string
          revenue_stream_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          partner_id?: string | null
          payer_user_id?: string | null
          payment_date?: string
          revenue_stream_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_revenue_stream_id_fkey"
            columns: ["revenue_stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      pilar_conteudos: {
        Row: {
          ativo: boolean
          banner_url: string | null
          city_id: string | null
          created_at: string
          data_evento: string | null
          descricao: string | null
          id: string
          imagem_url: string | null
          link: string | null
          local: string | null
          ordem: number
          pilar: Database["public"]["Enums"]["pilar_kind"]
          publicado: boolean
          subtitulo: string | null
          tipo: Database["public"]["Enums"]["pilar_tipo"]
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          banner_url?: string | null
          city_id?: string | null
          created_at?: string
          data_evento?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          link?: string | null
          local?: string | null
          ordem?: number
          pilar: Database["public"]["Enums"]["pilar_kind"]
          publicado?: boolean
          subtitulo?: string | null
          tipo: Database["public"]["Enums"]["pilar_tipo"]
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          banner_url?: string | null
          city_id?: string | null
          created_at?: string
          data_evento?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          link?: string | null
          local?: string | null
          ordem?: number
          pilar?: Database["public"]["Enums"]["pilar_kind"]
          publicado?: boolean
          subtitulo?: string | null
          tipo?: Database["public"]["Enums"]["pilar_tipo"]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pilar_conteudos_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      pilar_cronograma: {
        Row: {
          created_at: string
          descricao: string | null
          horario: string
          id: string
          ordem: number
          pilar_conteudo_id: string
          titulo: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          horario: string
          id?: string
          ordem?: number
          pilar_conteudo_id: string
          titulo: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          horario?: string
          id?: string
          ordem?: number
          pilar_conteudo_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "pilar_cronograma_pilar_conteudo_id_fkey"
            columns: ["pilar_conteudo_id"]
            isOneToOne: false
            referencedRelation: "pilar_conteudos"
            referencedColumns: ["id"]
          },
        ]
      }
      pilar_empresas: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          nome: string
          ordem: number
          partner_id: string | null
          pilar_conteudo_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          nome: string
          ordem?: number
          partner_id?: string | null
          pilar_conteudo_id: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          nome?: string
          ordem?: number
          partner_id?: string | null
          pilar_conteudo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pilar_empresas_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilar_empresas_pilar_conteudo_id_fkey"
            columns: ["pilar_conteudo_id"]
            isOneToOne: false
            referencedRelation: "pilar_conteudos"
            referencedColumns: ["id"]
          },
        ]
      }
      pilar_galeria: {
        Row: {
          created_at: string
          id: string
          imagem_url: string
          legenda: string | null
          ordem: number
          pilar_conteudo_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          imagem_url: string
          legenda?: string | null
          ordem?: number
          pilar_conteudo_id: string
        }
        Update: {
          created_at?: string
          id?: string
          imagem_url?: string
          legenda?: string | null
          ordem?: number
          pilar_conteudo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pilar_galeria_pilar_conteudo_id_fkey"
            columns: ["pilar_conteudo_id"]
            isOneToOne: false
            referencedRelation: "pilar_conteudos"
            referencedColumns: ["id"]
          },
        ]
      }
      pilar_palestrantes: {
        Row: {
          bio: string | null
          cargo: string | null
          created_at: string
          foto_url: string | null
          id: string
          nome: string
          ordem: number
          pilar_conteudo_id: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          cargo?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          nome: string
          ordem?: number
          pilar_conteudo_id: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          cargo?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          nome?: string
          ordem?: number
          pilar_conteudo_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pilar_palestrantes_pilar_conteudo_id_fkey"
            columns: ["pilar_conteudo_id"]
            isOneToOne: false
            referencedRelation: "pilar_conteudos"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_goals: {
        Row: {
          created_at: string
          id: string
          key: string
          label: string
          sort_order: number
          target: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          label: string
          sort_order?: number
          target?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          label?: string
          sort_order?: number
          target?: number
          updated_at?: string
        }
        Relationships: []
      }
      professional_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      professionals: {
        Row: {
          category: string
          category_slug: string | null
          city: string | null
          city_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          neighborhood: string | null
          photo_url: string | null
          status: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          category: string
          category_slug?: string | null
          city?: string | null
          city_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          neighborhood?: string | null
          photo_url?: string | null
          status?: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          category?: string
          category_slug?: string | null
          city?: string | null
          city_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          neighborhood?: string | null
          photo_url?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "professionals_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          bio: string | null
          card_code: string | null
          card_number: string
          card_tier: string
          company: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          is_founding: boolean | null
          is_public: boolean | null
          name: string
          phone: string | null
          segment: string | null
          total_savings: number
          updated_at: string
          user_id: string
          what_i_offer: string | null
          what_i_seek: string | null
        }
        Insert: {
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          card_code?: string | null
          card_number: string
          card_tier?: string
          company?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_founding?: boolean | null
          is_public?: boolean | null
          name?: string
          phone?: string | null
          segment?: string | null
          total_savings?: number
          updated_at?: string
          user_id: string
          what_i_offer?: string | null
          what_i_seek?: string | null
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          card_code?: string | null
          card_number?: string
          card_tier?: string
          company?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_founding?: boolean | null
          is_public?: boolean | null
          name?: string
          phone?: string | null
          segment?: string | null
          total_savings?: number
          updated_at?: string
          user_id?: string
          what_i_offer?: string | null
          what_i_seek?: string | null
        }
        Relationships: []
      }
      public_home_banner: {
        Row: {
          active: boolean
          city_id: string | null
          cta_href: string
          cta_label: string
          id: number
          image_url: string
          slides: Json
          text: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          city_id?: string | null
          cta_href?: string
          cta_label?: string
          id?: number
          image_url?: string
          slides?: Json
          text?: string
          title?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          city_id?: string | null
          cta_href?: string
          cta_label?: string
          id?: number
          image_url?: string
          slides?: Json
          text?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_home_banner_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
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
      revenue_streams: {
        Row: {
          billing_type: string
          created_at: string
          default_amount: number | null
          id: string
          name: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          billing_type?: string
          created_at?: string
          default_amount?: number | null
          id?: string
          name: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          billing_type?: string
          created_at?: string
          default_amount?: number | null
          id?: string
          name?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
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
      create_secondary_profile: {
        Args: { _account_type: string }
        Returns: {
          account_type: string
          avatar_url: string | null
          bio: string | null
          card_code: string | null
          card_number: string
          card_tier: string
          company: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          is_founding: boolean | null
          is_public: boolean | null
          name: string
          phone: string | null
          segment: string | null
          total_savings: number
          updated_at: string
          user_id: string
          what_i_offer: string | null
          what_i_seek: string | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_unique_card_code: { Args: never; Returns: string }
      generate_unique_card_number: { Args: never; Returns: string }
      get_public_card_by_code: {
        Args: { _code: string }
        Returns: {
          avatar_url: string
          card_code: string
          card_number: string
          card_tier: string
          is_active: boolean
          name: string
          user_id: string
        }[]
      }
      has_company_profile: { Args: { _user_id: string }; Returns: boolean }
      issue_coupon: {
        Args: {
          _cashback_amount: number
          _client_user_id: string
          _code: string
          _discount_amount: number
          _partner_id: string
          _purchase_amount: number
        }
        Returns: string
      }
      lookup_client_for_partner: {
        Args: { _query: string }
        Returns: {
          card_number: string
          cpf: string
          email: string
          is_active: boolean
          name: string
          user_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      pilar_kind: "nexus" | "elas" | "magna"
      pilar_tipo: "evento" | "premiacao" | "conteudo"
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
      pilar_kind: ["nexus", "elas", "magna"],
      pilar_tipo: ["evento", "premiacao", "conteudo"],
    },
  },
} as const
