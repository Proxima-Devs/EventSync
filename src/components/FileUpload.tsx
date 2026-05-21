"use client";

import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export default function FileUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'envoi");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Erreur réseau");
    } finally {
      setUploading(false);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setError("");
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Circular avatar button */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          disabled={uploading}
          className="relative w-24 h-24 rounded-full border-2 overflow-hidden transition-all duration-300 focus:outline-none"
          style={{
            borderColor: dragOver
              ? "#00E5FF"
              : value
              ? "#00E5FF44"
              : "#1e2530",
            background: value ? "transparent" : "#060a0f",
            boxShadow: dragOver
              ? "0 0 0 4px #00E5FF22, 0 0 20px #00E5FF30"
              : value
              ? "0 0 0 3px #00E5FF18"
              : "none",
          }}
          aria-label="Choisir une photo"
        >
          {/* Photo preview */}
          {value && !uploading && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Aperçu"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Uploading spinner */}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#060a0f]">
              <Loader2
                size={22}
                className="text-[#00E5FF] animate-spin"
              />
            </div>
          )}

          {/* Default / hover overlay */}
          {!uploading && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 transition-all duration-200"
              style={{
                background: value
                  ? "rgba(0,0,0,0)"
                  : "transparent",
                opacity: value ? 0 : 1,
              }}
            >
              {!value && (
                <>
                  <Camera size={22} className="text-[#2a3a4a]" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#2a3a4a]">
                    Photo
                  </span>
                </>
              )}
            </div>
          )}

          {/* Hover overlay on top of photo */}
          {value && !uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera size={18} className="text-white" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white">
                Changer
              </span>
            </div>
          )}
        </button>

        {/* Remove button */}
        {value && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0a0e14] border border-[#1e2530] flex items-center justify-center text-[#4a5568] hover:text-red-400 hover:border-red-900/50 transition-all duration-200"
            title="Supprimer la photo"
          >
            <X size={10} />
          </button>
        )}

        {/* Neon ring pulse on dragover */}
        {dragOver && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none animate-ping"
            style={{ border: "2px solid #00E5FF40" }}
          />
        )}
      </div>

      {/* Click / drag hint */}
      {!uploading && (
        <p className="text-[10px] text-[#2a3a4a] text-center leading-relaxed">
          {value ? "Cliquez pour changer · Glissez une image" : "Cliquez pour choisir · Glissez une image"}
          <br />
          <span className="text-[#1e2838]">JPG, PNG, WebP · max 2 Mo</span>
        </p>
      )}

      {uploading && (
        <p className="text-[10px] text-[#00E5FF80]">Envoi en cours…</p>
      )}

      {error && (
        <p className="text-[11px] text-red-400 text-center max-w-45 leading-tight">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}