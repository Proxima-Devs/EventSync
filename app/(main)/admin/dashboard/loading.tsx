export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0e1114",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: "2px solid #1e2530",
          borderTopColor: "#00E5FF",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "#3a4a5a", fontSize: 13, fontFamily: "sans-serif" }}>
          Chargement...
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
