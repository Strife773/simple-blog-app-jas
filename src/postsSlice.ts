import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import { supabase } from './supabaseClient';


interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
};


export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const { data, error } = await supabase
    .from('Posts')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Post[]>(); 

  if (error) throw new Error(error.message);
  return data || [];
});


export const addPost = createAsyncThunk<
  Post,
  { title: string; content: string },
  { rejectValue: string }
>('posts/addPost', async (newPost, { rejectWithValue }) => {
  console.log('Inserting post:', newPost);
  const { data, error } = await supabase
    .from('Posts')
    .insert(newPost)
    .single()
    .returns<Post>();

  if (error) {
    console.error('Insert error:', error);
    return rejectWithValue(error.message);
  }

  if (!data) {
    return rejectWithValue('No data returned from insert');
  }

  return data;
});

const postsSlice = createSlice({
  name: 'Posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
        state.error = action.error.message || 'Failed to fetch posts';
      })
      .addCase(addPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(addPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add post';
      });
  },
});

export default postsSlice.reducer;
