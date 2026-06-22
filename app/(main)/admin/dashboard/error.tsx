"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0e1114",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          backgroundColor: "#ff4d6d12",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: 22,
        }}>
          ⚠️
        </div>
        <h2 style={{ color: "#eee", fontSize: 18, fontWeight: 700, marginBottom: 8, fontFamily: "sans-serif" }}>
          Erreur dans l&apos;administration
        </h2>
        <p style={{ color: "#4a5568", fontSize: 13, lineHeight: 1.6, marginBottom: 24, fontFamily: "sans-serif" }}>
          {error.message || "Une erreur inattendue s'est produite."}
        </p>
        <button
          onClick={reset}
          style={{
            padding: "8px 20px", borderRadius: 10,
            border: "1px solid #1e2530", background: "transparent",
            color: "#00E5FF", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "sans-serif",
          }}
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
