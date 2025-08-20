import { Suspense, lazy, useEffect, useState, useCallback } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PageLoader from "./components/PageLoader";
import { useAuth } from "./hooks/useAuth";

const lazyWithPrefetch = (importFn) => {
  const component = lazy(importFn);
  component.preload = importFn;
  return component;
};

const WelcomePage = lazyWithPrefetch(() => import("./pages/WelcomePage"));
const SignUpPage = lazyWithPrefetch(() => import("./pages/SignUpPage"));
const LoginPage = lazyWithPrefetch(() => import("./pages/LoginPage"));
const CreatorInfoPage = lazyWithPrefetch(() => import("./pages/CreatorInfo"));
const CompleteEditProfile = lazyWithPrefetch(() =>
  import("./pages/CompleteEditProfile")
);
const AskClothifyAi = lazyWithPrefetch(() => import("./pages/AskClothifyAi"));
const VerifyOtp = lazyWithPrefetch(() => import("./pages/VerifyOtp"));
const ResetPasswordPage = lazyWithPrefetch(() =>
  import("./pages/ResetPasswordPage")
);
const SupportPage = lazyWithPrefetch(() => import("./pages/Support"));

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/clothify" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => children;

const App = () => {
  const { checkAuth, isAuthenticated, loading: authLoading } = useAuth();
  const [authInitialized, setAuthInitialized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const heartbeat = () => {
      fetch(`${import.meta.env.VITE_API_URL}/heartbeat`, {
        credentials: "include",
      }).catch(console.error);
    };

    const interval = setInterval(heartbeat, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        if (mounted) setAuthInitialized(true);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [checkAuth]);

  useEffect(() => {
    [AskClothifyAi, LoginPage, SignUpPage].forEach((component) => {
      if (component.preload) component.preload();
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return;
    const page = isAuthenticated ? AskClothifyAi : LoginPage;
    if (page.preload) page.preload();
  }, [isAuthenticated]);

  if (!authInitialized || authLoading) {
    return <PageLoader fullScreen />;
  }

  return (
    <Suspense fallback={<PageLoader fullScreen />}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PublicRoute>
              <WelcomePage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <SignUpPage />
            </AuthRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <AuthRoute>
              <VerifyOtp />
            </AuthRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthRoute>
              <ResetPasswordPage />
            </AuthRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <CompleteEditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/developer"
          element={
            <ProtectedRoute>
              <CreatorInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clothify"
          element={
            <ProtectedRoute>
              <AskClothifyAi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversation/:id"
          element={
            <ProtectedRoute>
              <AskClothifyAi />
            </ProtectedRoute>
          }
        />
        <Route path="/support" element={<SupportPage />} />
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/clothify" : "/login"}
              replace
              state={{ from: location }}
            />
          }
        />
      </Routes>
    </Suspense>
  );
};

export default App;
