'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface User {
  role: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => void;
}

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { isAuthenticated, user, logout, loading } = useAuth();

  if (loading) {
    return (
      <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
        <div className="animate-pulse h-4 w-20 bg-gray-200 rounded"></div>
      </nav>
    );
  }

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Home
      </Link>
      <Link
        href="/gallery"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/gallery" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Gallery
      </Link>
      
      {!isAuthenticated ? (
        <Link
          href="/auth/login"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/auth/login" ? "text-primary" : "text-muted-foreground"
          )}
        >
          Login
        </Link>
      ) : (
        <>
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/admin" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Admin
            </Link>
          )}
          <button
            onClick={() => {
              try {
                logout();
              } catch (error) {
                console.error('Logout failed:', error);
              }
            }}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
}