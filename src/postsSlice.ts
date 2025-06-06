import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from './supabaseClient';
import { Post, PostFormData, PostUpdateData, PostsState } from './types';

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
  selectedPost: null,
};

// Fetch all posts
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!user_id (
            id,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Post[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch a single post
export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Post;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: PostFormData, { rejectWithValue }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be authenticated to create a post');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          user_id: user.id,
        })
        .select(`
          *,
          profiles!user_id (
            id,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data as Post;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update an existing post
export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, title, content }: PostUpdateData, { rejectWithValue }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be authenticated to update a post');

      const { data, error } = await supabase
        .from('posts')
        .update({ title, content })
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          profiles!user_id (
            id,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Post not found or unauthorized');
      
      return data as Post;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete a post
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be authenticated to delete a post');

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user owns the post

      if (error) throw error;
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearSelectedPost: (state) => {
      state.selectedPost = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Single Post
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.posts.findIndex((post: Post) => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        state.selectedPost = action.payload;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter((post: Post) => post.id !== action.payload);
        if (state.selectedPost?.id === action.payload) {
          state.selectedPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedPost, clearError } = postsSlice.actions;
export default postsSlice.reducer;
