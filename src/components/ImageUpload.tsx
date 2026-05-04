"use client";
import Image from "next/image";
import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? "Erreur upload"); return; }
      onChange(data.url);
    } catch {
      setError("Erreur réseau");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>

      {/* Prévisualisation */}
      {value && (
        <Image
          src={value}
          alt="Aperçu"
          width={80}
          height={80}
          style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e7eb" }}
        />
      )}

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Envoi..." : "📁 Choisir un fichier"}
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      {error && <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
    </div>
  );
}