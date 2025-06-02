import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { fetchPosts, addPost } from "./postsSlice";

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
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Simple Blog</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          className="w-full p-2 mb-2"
        />
        <textarea
          placeholder="Post Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          className="w-full p-2 mb-2"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Add Post"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        {posts.map((post) => (
          <article
            key={post.id}
            style={{ borderBottom: "1px solid #ccc", marginBottom: "1rem" }}
          >
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <small>{new Date(post.created_at).toLocaleString()}</small>
          </article>
        ))}
      </div>
    </div>
  );
};

export default App;
