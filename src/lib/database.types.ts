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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      games: {
        Row: {
          created_at: string
          id: number
          pelada_id: number
          score_a: number | null
          score_b: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["game_status"]
          team_a_id: number
          team_b_id: number
        }
        Insert: {
          created_at?: string
          id?: never
          pelada_id: number
          score_a?: number | null
          score_b?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          team_a_id: number
          team_b_id: number
        }
        Update: {
          created_at?: string
          id?: never
          pelada_id?: number
          score_a?: number | null
          score_b?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          team_a_id?: number
          team_b_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "games_pelada_id_fkey"
            columns: ["pelada_id"]
            isOneToOne: false
            referencedRelation: "peladas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_events: {
        Row: {
          created_at: string
          game_id: number
          id: number
          player_id: number
          sec: number
          type: Database["public"]["Enums"]["event_type"]
        }
        Insert: {
          created_at?: string
          game_id: number
          id?: never
          player_id: number
          sec: number
          type: Database["public"]["Enums"]["event_type"]
        }
        Update: {
          created_at?: string
          game_id?: number
          id?: never
          player_id?: number
          sec?: number
          type?: Database["public"]["Enums"]["event_type"]
        }
        Relationships: [
          {
            foreignKeyName: "match_events_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      pelada_presence: {
        Row: {
          pelada_id: number
          player_id: number
        }
        Insert: {
          pelada_id: number
          player_id: number
        }
        Update: {
          pelada_id?: number
          player_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "pelada_presence_pelada_id_fkey"
            columns: ["pelada_id"]
            isOneToOne: false
            referencedRelation: "peladas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pelada_presence_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      peladas: {
        Row: {
          created_at: string
          date: string
          duration_minutes: number
          format: Database["public"]["Enums"]["pelada_format"]
          id: number
          num_teams: number
        }
        Insert: {
          created_at?: string
          date: string
          duration_minutes?: number
          format?: Database["public"]["Enums"]["pelada_format"]
          id?: never
          num_teams?: number
        }
        Update: {
          created_at?: string
          date?: string
          duration_minutes?: number
          format?: Database["public"]["Enums"]["pelada_format"]
          id?: never
          num_teams?: number
        }
        Relationships: []
      }
      players: {
        Row: {
          assists: number
          created_at: string
          games: number
          goals: number
          id: number
          is_admin: boolean
          name: string
          photo_url: string | null
          position: Database["public"]["Enums"]["position_type"]
          star_origin: Database["public"]["Enums"]["star_origin"]
          stars: number
          user_id: string | null
          wins: number
        }
        Insert: {
          assists?: number
          created_at?: string
          games?: number
          goals?: number
          id?: never
          is_admin?: boolean
          name: string
          photo_url?: string | null
          position?: Database["public"]["Enums"]["position_type"]
          star_origin?: Database["public"]["Enums"]["star_origin"]
          stars?: number
          user_id?: string | null
          wins?: number
        }
        Update: {
          assists?: number
          created_at?: string
          games?: number
          goals?: number
          id?: never
          is_admin?: boolean
          name?: string
          photo_url?: string | null
          position?: Database["public"]["Enums"]["position_type"]
          star_origin?: Database["public"]["Enums"]["star_origin"]
          stars?: number
          user_id?: string | null
          wins?: number
        }
        Relationships: []
      }
      star_suggestions: {
        Row: {
          created_at: string
          id: number
          player_id: number
          status: Database["public"]["Enums"]["star_suggestion_status"]
          suggested: number
        }
        Insert: {
          created_at?: string
          id?: never
          player_id: number
          status?: Database["public"]["Enums"]["star_suggestion_status"]
          suggested: number
        }
        Update: {
          created_at?: string
          id?: never
          player_id?: number
          status?: Database["public"]["Enums"]["star_suggestion_status"]
          suggested?: number
        }
        Relationships: [
          {
            foreignKeyName: "star_suggestions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      team_players: {
        Row: {
          player_id: number
          team_id: number
        }
        Insert: {
          player_id: number
          team_id: number
        }
        Update: {
          player_id?: number
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          hue: number
          id: number
          name: string
          pelada_id: number
          queue_order: number | null
        }
        Insert: {
          created_at?: string
          hue: number
          id?: never
          name: string
          pelada_id: number
          queue_order?: number | null
        }
        Update: {
          created_at?: string
          hue?: number
          id?: never
          name?: string
          pelada_id?: number
          queue_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_pelada_id_fkey"
            columns: ["pelada_id"]
            isOneToOne: false
            referencedRelation: "peladas"
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
      event_type: "gol" | "assistencia"
      game_status: "agendado" | "ao vivo" | "finalizado"
      pelada_format: "todos_contra_todos" | "vencedor_fica"
      position_type:
        | "Qualquer"
        | "Goleiro"
        | "Zagueiro"
        | "Meio-campo"
        | "Atacante"
      star_origin: "manual" | "ia"
      star_suggestion_status: "pendente" | "aprovada" | "ajustada" | "ignorada"
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
      event_type: ["gol", "assistencia"],
      game_status: ["agendado", "ao vivo", "finalizado"],
      pelada_format: ["todos_contra_todos", "vencedor_fica"],
      position_type: [
        "Qualquer",
        "Goleiro",
        "Zagueiro",
        "Meio-campo",
        "Atacante",
      ],
      star_origin: ["manual", "ia"],
      star_suggestion_status: ["pendente", "aprovada", "ajustada", "ignorada"],
    },
  },
} as const
