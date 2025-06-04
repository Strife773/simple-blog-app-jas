import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { fetchPosts, addPost } from "./postsSlice";
import "./App.css";

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { posts, loading, error } = useAppSelector((state) => state.posts);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    if (!title.trim() || !content.trim()) return;
    dispatch(addPost({ title, content }));
    setTitle("");
    setContent("");
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 font-sans">
      <h1 className="text-3xl font-bold text-center mb-6">Simple Blog</h1>

      {/* Form Card */}
      <div className="bg-white shadow-md rounded-md p-6 mb-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            placeholder="Post Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? "Posting..." : "Add Post"}
          </button>
        </form>

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white shadow-sm border border-gray-200 rounded-md p-5"
          >
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-700 mb-3">{post.content}</p>
            <p className="text-sm text-gray-500">
              Posted: {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
