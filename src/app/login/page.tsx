import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-lounge-accent" />
        <h1 className="mt-3 font-display text-2xl font-bold uppercase tracking-wide">
          Granero Dashboard
        </h1>
        <p className="mt-1 text-sm text-lounge-muted">Staff sign in</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
