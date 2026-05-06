import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Suspense fallback={<p>Loading…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
