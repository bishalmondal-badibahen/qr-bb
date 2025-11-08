"use client";

import LiveForm from "@/components/LiveForm";

export default function Page() {
  // This page is intentionally minimal and mobile-first: only the form is shown.
  // On mobile the form will take the viewport; on larger screens it stays centered.
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-bg)' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: 16 }}>
        <LiveForm />
      </div>
    </div>
  );
}
