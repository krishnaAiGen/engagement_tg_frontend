// File: frontend/app/page.tsx
'use client';

import { useAuth } from "@/lib/AuthContext";
import LoginForm from "@/components/auth/LoginForm";
import Dashboard from "@/components/dashboard/Dashboard";

export default function Home() {
  // Get the token from our global memory
  const { token } = useAuth();

  // This is the conditional rendering logic:
  // If a token exists, the user is logged in, so show the Dashboard.
  // Otherwise, show the LoginForm.
  return (
    <main>
      {token ? <Dashboard /> : <LoginForm />}
    </main>
  );
}