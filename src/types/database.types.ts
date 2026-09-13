export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LessonType = "interactive" | "markdown" | "quiz" | "code";

export type BlockType =
  | "text"
  | "markdown"
  | "flashcard_set"
  | "quiz_mcq"
  | "quiz_open"
  | "code_exercise"
  | "reference_list"
  | "callout"
  | "video"
  | "image";

export interface Database {
  public: {
    Tables: {
      modules: {
        Row: {
          id: string;
          title: string;
          slug: string;
          order_index: number;
          description: string | null;
          created_at: string;
          updated_at?: string;
          metadata?: Json;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          order_index: number;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          order_index?: number;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          metadata?: Json;
        };
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          slug: string;
          type: LessonType;
          order_index: number;
          scheduled_date: string | null;
          created_at: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          slug: string;
          type: LessonType;
          order_index: number;
          scheduled_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          slug?: string;
          type?: LessonType;
          order_index?: number;
          scheduled_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lesson_blocks: {
        Row: {
          id: string;
          lesson_id: string;
          type: BlockType;
          content_json: Json;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          type: BlockType;
          content_json: Json;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          type?: BlockType;
          content_json?: Json;
          order_index?: number;
          created_at?: string;
        };
      };
      knowledge_base: {
        Row: {
          id: string;
          source_title: string;
          source_type: string;
          source_url: string | null;
          raw_chunk: string;
          citation: string | null;
          summary: string | null;
          module_id: string | null;
          lesson_id: string | null;
          metadata: Json | null;
          embedding: number[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_title: string;
          source_type: string;
          source_url?: string | null;
          raw_chunk: string;
          citation?: string | null;
          summary?: string | null;
          module_id?: string | null;
          lesson_id?: string | null;
          metadata?: Json | null;
          embedding?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_title?: string;
          source_type?: string;
          source_url?: string | null;
          raw_chunk?: string;
          citation?: string | null;
          summary?: string | null;
          module_id?: string | null;
          lesson_id?: string | null;
          metadata?: Json | null;
          embedding?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: string;
          score: number | null;
          last_accessed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          status?: string;
          score?: number | null;
          last_accessed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          status?: string;
          score?: number | null;
          last_accessed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];
export type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];
export type LessonBlockRow = Database["public"]["Tables"]["lesson_blocks"]["Row"];
export type KnowledgeBaseRow = Database["public"]["Tables"]["knowledge_base"]["Row"];
export type UserProgressRow = Database["public"]["Tables"]["user_progress"]["Row"];
