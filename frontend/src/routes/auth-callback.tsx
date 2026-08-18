import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth-callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const search = useSearch({ from: "/auth-callback" }) as {
    token?: string;
    user?: string;
    error?: string;
  };

  useEffect(() => {
    if (search.error) {
      navigate({ to: "/auth", search: { error: search.error } });
      return;
    }

    if (search.token && search.user) {
      try {
        const user = JSON.parse(decodeURIComponent(search.user));
        setAuth(search.token, user);
        navigate({ to: "/dashboard" });
      } catch (error) {
        console.error("Failed to parse user data:", error);
        navigate({ to: "/auth", search: { error: "auth_failed" } });
      }
    } else {
      // No token, redirect to auth
      navigate({ to: "/auth" });
    }
  }, [search, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="size-12 animate-spin text-primary mx-auto" />
        <h2 className="mt-4 text-lg font-semibold">Completing sign in...</h2>
        <p className="text-muted-foreground text-sm">Please wait while we verify your account</p>
      </div>
    </div>
  );
}