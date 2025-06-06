import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
  clearError,
  clearSelectedPost,
} from '../postsSlice';
import { Post, PostFormData } from '../types';

const PostManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { posts, loading, error, selectedPost } = useAppSelector((state) => state.posts);
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch posts only once when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchPosts()).unwrap();
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (selectedPost && isEditing) {
      setFormData({
        title: selectedPost.title,
        content: selectedPost.content,
      });
    }
  }, [selectedPost, isEditing]);

  // Clear error after 5 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (error) {
      timeoutId = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [error, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      if (isEditing && selectedPost) {
        await dispatch(updatePost({
          id: selectedPost.id,
          ...formData,
        })).unwrap();
        setIsEditing(false);
      } else {
        await dispatch(createPost(formData)).unwrap();
      }
      setFormData({ title: '', content: '' });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEdit = (post: Post) => {
    setIsEditing(true);
    setFormData({
      title: post.title,
      content: post.content,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await dispatch(deletePost(id)).unwrap();
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ title: '', content: '' });
    dispatch(clearSelectedPost());
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">
          {isEditing ? 'Edit your post' : 'Create a post'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Processing...' : isEditing ? 'Update Post' : 'Create Post'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {error && (
          <div className="mt-4 text-red-600 text-sm">{error}</div>
        )}
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {loading && posts.length === 0 ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-600">No posts yet. Create your first post!</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white shadow-sm rounded-lg p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p className="text-gray-600 mt-2">{post.content}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span>Posted by: {post.profiles?.username}</span>
                    <span className="ml-4">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {user?.id === post.user_id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(post)}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PostManager; 