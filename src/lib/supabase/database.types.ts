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
      atualizacoes: {
        Row: {
          created_at: string
          created_by: string | null
          data_hora: string
          id: number
          numero_patch: string
          versao_atual: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_hora: string
          id?: never
          numero_patch: string
          versao_atual?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_hora?: string
          id?: never
          numero_patch?: string
          versao_atual?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "atualizacoes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      atualizacoes_itens: {
        Row: {
          atualizacao_id: number
          created_at: string
          descricao: string
          id: number
          local: string
          numero_chamado: string | null
          tipo: string
        }
        Insert: {
          atualizacao_id: number
          created_at?: string
          descricao: string
          id?: never
          local: string
          numero_chamado?: string | null
          tipo: string
        }
        Update: {
          atualizacao_id?: number
          created_at?: string
          descricao?: string
          id?: never
          local?: string
          numero_chamado?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "atualizacoes_itens_atualizacao_id_fkey"
            columns: ["atualizacao_id"]
            isOneToOne: false
            referencedRelation: "atualizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      atualizacoes_vistas: {
        Row: {
          atualizacao_id: number
          user_id: string
          vista_em: string
        }
        Insert: {
          atualizacao_id: number
          user_id: string
          vista_em?: string
        }
        Update: {
          atualizacao_id?: number
          user_id?: string
          vista_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "atualizacoes_vistas_atualizacao_id_fkey"
            columns: ["atualizacao_id"]
            isOneToOne: false
            referencedRelation: "atualizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atualizacoes_vistas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      captacoes: {
        Row: {
          created_at: string
          created_by: string | null
          empresa_id: number
          id: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          empresa_id: number
          id?: never
        }
        Update: {
          created_at?: string
          created_by?: string | null
          empresa_id?: number
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "captacoes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "captacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      compromisso_google_events: {
        Row: {
          compromisso_id: number
          created_at: string
          email: string
          google_event_id: string
        }
        Insert: {
          compromisso_id: number
          created_at?: string
          email: string
          google_event_id: string
        }
        Update: {
          compromisso_id?: number
          created_at?: string
          email?: string
          google_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compromisso_google_events_compromisso_id_fkey"
            columns: ["compromisso_id"]
            isOneToOne: false
            referencedRelation: "compromissos"
            referencedColumns: ["id"]
          },
        ]
      }
      compromissos: {
        Row: {
          created_at: string
          criado_por: string | null
          descricao: string | null
          empresa_id: number | null
          fim: string | null
          id: number
          inicio: string
          proposta_id: number | null
          tipo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          empresa_id?: number | null
          fim?: string | null
          id?: never
          inicio: string
          proposta_id?: number | null
          tipo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          empresa_id?: number | null
          fim?: string | null
          id?: never
          inicio?: string
          proposta_id?: number | null
          tipo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compromissos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromissos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromissos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos_empresa: {
        Row: {
          cargo: string | null
          created_at: string
          email: string | null
          empresa_id: number
          id: number
          nome: string
          principal: boolean
          telefone: string | null
          telefone_tipo: string | null
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          email?: string | null
          empresa_id: number
          id?: never
          nome: string
          principal?: boolean
          telefone?: string | null
          telefone_tipo?: string | null
        }
        Update: {
          cargo?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: number
          id?: never
          nome?: string
          principal?: boolean
          telefone?: string | null
          telefone_tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contatos_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cep: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string
          created_by: string | null
          endereco: string | null
          id: number
          nome: string
          numero: string | null
          observacoes: string | null
          origem_lead: string | null
          setor: string | null
          site: string | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          created_by?: string | null
          endereco?: string | null
          id?: never
          nome: string
          numero?: string | null
          observacoes?: string | null
          origem_lead?: string | null
          setor?: string | null
          site?: string | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          created_by?: string | null
          endereco?: string | null
          id?: never
          nome?: string
          numero?: string | null
          observacoes?: string | null
          origem_lead?: string | null
          setor?: string | null
          site?: string | null
          uf?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interacoes_empresa: {
        Row: {
          autor_id: string | null
          created_at: string
          data_interacao: string
          descricao: string
          empresa_id: number
          id: number
          tipo: string | null
        }
        Insert: {
          autor_id?: string | null
          created_at?: string
          data_interacao?: string
          descricao: string
          empresa_id: number
          id?: never
          tipo?: string | null
        }
        Update: {
          autor_id?: string | null
          created_at?: string
          data_interacao?: string
          descricao?: string
          empresa_id?: number
          id?: never
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interacoes_empresa_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interacoes_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_number_counters: {
        Row: {
          ano: number
          ultimo_numero: number
        }
        Insert: {
          ano: number
          ultimo_numero?: number
        }
        Update: {
          ano?: number
          ultimo_numero?: number
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          autor_id: string | null
          compromisso_id: number | null
          created_at: string
          dias: number | null
          empresa_id: number | null
          evento_dia: string | null
          id: number
          mensagem: string
          proposta_id: number | null
          status_anterior_label: string | null
          status_novo_label: string | null
          tipo: string
        }
        Insert: {
          autor_id?: string | null
          compromisso_id?: number | null
          created_at?: string
          dias?: number | null
          empresa_id?: number | null
          evento_dia?: string | null
          id?: never
          mensagem: string
          proposta_id?: number | null
          status_anterior_label?: string | null
          status_novo_label?: string | null
          tipo: string
        }
        Update: {
          autor_id?: string | null
          compromisso_id?: number | null
          created_at?: string
          dias?: number | null
          empresa_id?: number | null
          evento_dia?: string | null
          id?: never
          mensagem?: string
          proposta_id?: number | null
          status_anterior_label?: string | null
          status_novo_label?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_compromisso_id_fkey"
            columns: ["compromisso_id"]
            isOneToOne: false
            referencedRelation: "compromissos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes_lidas: {
        Row: {
          lida_em: string
          notificacao_id: number
          user_id: string
        }
        Insert: {
          lida_em?: string
          notificacao_id: number
          user_id: string
        }
        Update: {
          lida_em?: string
          notificacao_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_lidas_notificacao_id_fkey"
            columns: ["notificacao_id"]
            isOneToOne: false
            referencedRelation: "notificacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_lidas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parametros_email: {
        Row: {
          ativo: boolean
          email_teste: string | null
          id: number
          modo_teste: boolean
          nome_remetente: string
          tipos_habilitados: string[]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean
          email_teste?: string | null
          id?: number
          modo_teste?: boolean
          nome_remetente?: string
          tipos_habilitados?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean
          email_teste?: string | null
          id?: number
          modo_teste?: boolean
          nome_remetente?: string
          tipos_habilitados?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parametros_email_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parametros_google_calendar: {
        Row: {
          ativo: boolean
          id: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parametros_google_calendar_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parametros_notificacao: {
        Row: {
          dias_empresa_sem_contato: number
          dias_lead_sem_acao: number
          dias_lead_sem_movimentacao: number
          dias_proposta_sem_acao: number
          dias_proposta_sem_movimentacao: number
          id: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          dias_empresa_sem_contato?: number
          dias_lead_sem_acao?: number
          dias_lead_sem_movimentacao?: number
          dias_proposta_sem_acao?: number
          dias_proposta_sem_movimentacao?: number
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          dias_empresa_sem_contato?: number
          dias_lead_sem_acao?: number
          dias_lead_sem_movimentacao?: number
          dias_proposta_sem_acao?: number
          dias_proposta_sem_movimentacao?: number
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parametros_notificacao_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parametros_retomada_lead_arquivado: {
        Row: {
          categoria: string
          dias: number
          id: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          categoria?: string
          dias?: number
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          categoria?: string
          dias?: number
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parametros_retomada_lead_arquivado_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          email_notifications: boolean
          full_name: string
          google_calendar_sync: boolean
          id: string
          is_active: boolean
          must_change_password: boolean
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_notifications?: boolean
          full_name: string
          google_calendar_sync?: boolean
          id: string
          is_active?: boolean
          must_change_password?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_notifications?: boolean
          full_name?: string
          google_calendar_sync?: boolean
          id?: string
          is_active?: boolean
          must_change_password?: boolean
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
      proposta_number_counters: {
        Row: {
          ano: number
          ultimo_numero: number
        }
        Insert: {
          ano: number
          ultimo_numero?: number
        }
        Update: {
          ano?: number
          ultimo_numero?: number
        }
        Relationships: []
      }
      propostas: {
        Row: {
          created_at: string
          created_by: string | null
          data_envio: string
          data_inicio_lead: string
          descricao: string | null
          empresa_id: number
          gerado_de_lead: boolean
          id: number
          motivo_reprovacao: string | null
          motivo_reprovacao_detalhe: string | null
          numero_lead: string | null
          numero_proposta: string | null
          responsavel_id: string | null
          resultado: string | null
          segmentos: string[]
          servico: string | null
          status_anterior_id: number | null
          status_id: number
          termometro: string | null
          tipo_servico: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_envio?: string
          data_inicio_lead?: string
          descricao?: string | null
          empresa_id: number
          gerado_de_lead?: boolean
          id?: never
          motivo_reprovacao?: string | null
          motivo_reprovacao_detalhe?: string | null
          numero_lead?: string | null
          numero_proposta?: string | null
          responsavel_id?: string | null
          resultado?: string | null
          segmentos?: string[]
          servico?: string | null
          status_anterior_id?: number | null
          status_id: number
          termometro?: string | null
          tipo_servico?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_envio?: string
          data_inicio_lead?: string
          descricao?: string | null
          empresa_id?: number
          gerado_de_lead?: boolean
          id?: never
          motivo_reprovacao?: string | null
          motivo_reprovacao_detalhe?: string | null
          numero_lead?: string | null
          numero_proposta?: string | null
          responsavel_id?: string | null
          resultado?: string | null
          segmentos?: string[]
          servico?: string | null
          status_anterior_id?: number | null
          status_id?: number
          termometro?: string | null
          tipo_servico?: string | null
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
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
            foreignKeyName: "propostas_status_anterior_id_fkey"
            columns: ["status_anterior_id"]
            isOneToOne: false
            referencedRelation: "proposal_statuses"
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
          tipo: string
        }
        Insert: {
          autor_id?: string | null
          created_at?: string
          id?: never
          proposta_id: number
          texto: string
          tipo?: string
        }
        Update: {
          autor_id?: string | null
          created_at?: string
          id?: never
          proposta_id?: number
          texto?: string
          tipo?: string
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
      propostas_status_historico: {
        Row: {
          entrou_em: string
          id: number
          proposta_id: number
          status_id: number
        }
        Insert: {
          entrou_em?: string
          id?: never
          proposta_id: number
          status_id: number
        }
        Update: {
          entrou_em?: string
          id?: never
          proposta_id?: number
          status_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "propostas_status_historico_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_status_historico_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "proposal_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      retomada_lead_arquivado_gerada: {
        Row: {
          created_at: string
          status_historico_id: number
        }
        Insert: {
          created_at?: string
          status_historico_id: number
        }
        Update: {
          created_at?: string
          status_historico_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "retomada_lead_arquivado_gerada_status_historico_id_fkey"
            columns: ["status_historico_id"]
            isOneToOne: true
            referencedRelation: "propostas_status_historico"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gerar_acoes_retomada_lead_arquivado: { Args: never; Returns: number }
      gerar_notificacoes_diarias: { Args: never; Returns: number }
      gerar_numero_proposta: { Args: never; Returns: string }
      get_unread_notificacoes: {
        Args: never
        Returns: {
          autor_id: string | null
          compromisso_id: number | null
          created_at: string
          dias: number | null
          empresa_id: number | null
          evento_dia: string | null
          id: number
          mensagem: string
          proposta_id: number | null
          status_anterior_label: string | null
          status_novo_label: string | null
          tipo: string
        }[]
        SetofOptions: {
          from: "*"
          to: "notificacoes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_unseen_atualizacoes_ids: { Args: never; Returns: number[] }
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
