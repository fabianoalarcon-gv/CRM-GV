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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          created_at: string
          created_by: string | null
          endereco: string | null
          id: number
          nome: string
          observacoes: string | null
          setor: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          endereco?: string | null
          id?: never
          nome: string
          observacoes?: string | null
          setor?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          endereco?: string | null
          id?: never
          nome?: string
          observacoes?: string | null
          setor?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compromissos: {
        Row: {
          cliente_id: number | null
          created_at: string
          criado_por: string
          descricao: string | null
          fim: string | null
          id: number
          inicio: string
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id?: number | null
          created_at?: string
          criado_por: string
          descricao?: string | null
          fim?: string | null
          id?: never
          inicio: string
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: number | null
          created_at?: string
          criado_por?: string
          descricao?: string | null
          fim?: string | null
          id?: never
          inicio?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compromissos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromissos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos_cliente: {
        Row: {
          cargo: string | null
          cliente_id: number
          created_at: string
          email: string | null
          id: number
          nome: string
          telefone: string | null
        }
        Insert: {
          cargo?: string | null
          cliente_id: number
          created_at?: string
          email?: string | null
          id?: never
          nome: string
          telefone?: string | null
        }
        Update: {
          cargo?: string | null
          cliente_id?: number
          created_at?: string
          email?: string | null
          id?: never
          nome?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contatos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      interacoes_cliente: {
        Row: {
          autor_id: string | null
          cliente_id: number
          created_at: string
          data_interacao: string
          descricao: string
          id: number
          tipo: string | null
        }
        Insert: {
          autor_id?: string | null
          cliente_id: number
          created_at?: string
          data_interacao?: string
          descricao: string
          id?: never
          tipo?: string | null
        }
        Update: {
          autor_id?: string | null
          cliente_id?: number
          created_at?: string
          data_interacao?: string
          descricao?: string
          id?: never
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interacoes_cliente_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interacoes_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      proposal_statuses: {
        Row: {
          color: string | null
          created_at: string
          id: number
          is_default: boolean
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: never
          is_default?: boolean
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: never
          is_default?: boolean
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      propostas: {
        Row: {
          cliente_id: number
          created_at: string
          created_by: string | null
          data_envio: string
          descricao: string | null
          id: number
          numero_proposta: string
          responsavel_id: string | null
          servico: string | null
          status_id: number
          termometro: string
          tipo_servico: string
          updated_at: string
          valor: number
        }
        Insert: {
          cliente_id: number
          created_at?: string
          created_by?: string | null
          data_envio?: string
          descricao?: string | null
          id?: never
          numero_proposta: string
          responsavel_id?: string | null
          servico?: string | null
          status_id: number
          termometro?: string
          tipo_servico: string
          updated_at?: string
          valor?: number
        }
        Update: {
          cliente_id?: number
          created_at?: string
          created_by?: string | null
          data_envio?: string
          descricao?: string | null
          id?: never
          numero_proposta?: string
          responsavel_id?: string | null
          servico?: string | null
          status_id?: number
          termometro?: string
          tipo_servico?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "proposal_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas_historico: {
        Row: {
          autor_id: string | null
          created_at: string
          id: number
          proposta_id: number
          texto: string
        }
        Insert: {
          autor_id?: string | null
          created_at?: string
          id?: never
          proposta_id: number
          texto: string
        }
        Update: {
          autor_id?: string | null
          created_at?: string
          id?: never
          proposta_id?: number
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "propostas_historico_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_historico_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
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
