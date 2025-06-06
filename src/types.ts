import { Database } from './supabase-types';

// Base types from database
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type DbPost = Database['public']['Tables']['posts']['Row'];

// Extended types for application use
export type Post = DbPost & {
  profiles: Profile | null;  // Changed from optional to required, but can be null
};

export interface PostFormData {
  title: string;
  content: string;
}

export interface PostUpdateData extends PostFormData {
  id: string;
}

export interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  selectedPost: Post | null;
}

export interface AuthState {
  user: Profile | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  posts: PostsState;
  auth: AuthState;
} 