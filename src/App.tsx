import React, { useEffect, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./hooks";
import { checkAuth, signOut, setupAuthListener } from "./authSlice";
import PostManager from "./components/PostManager";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

const App: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading, isInitialized } = useAppSelector((state) => state.auth);

  // Initialize auth state only once
  useEffect(() => {
    const initAuth = async () => {
      try {
        await dispatch(checkAuth()).unwrap();
        await dispatch(setupAuthListener()).unwrap();
      } catch (err) {
        console.error('Error initializing auth:', err);
      }
    };
    initAuth();
  }, [dispatch]);

  const handleSignOut = useCallback(async () => {
    try {
      await dispatch(signOut()).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, [dispatch, navigate]);

  // Show loading state while checking auth
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-xl font-semibold">My Assessment</h1>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  Welcome, {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="py-8">
          <PostManager />
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
