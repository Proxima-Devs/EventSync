"use client";

import { useInput, InputProps } from "react-admin";
import { Box, Typography, Button } from "@mui/material";
import { useRef, useState } from "react";

interface ImageUploadInputProps extends Omit<InputProps, "source"> {
  source: string;
  label?: string;
}

export default function ImageUploadInput({ source, label }: ImageUploadInputProps) {
  const { field, fieldState } = useInput({ source });
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      field.onChange(data.url);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const currentUrl = field.value;

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography variant="caption" sx={{ color: "#3a4a5a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11, display: "block", mb: 1 }}>
          {label}
        </Typography>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {currentUrl ? (
          <Box
            component="img"
            src={currentUrl}
            alt="Preview"
            sx={{ width: 80, height: 80, borderRadius: 2, objectFit: "cover", border: "1px solid #1e2530", bgcolor: "#060a0f" }}
          />
        ) : (
          <Box sx={{ width: 80, height: 80, borderRadius: 2, border: "1px dashed #1e2530", bgcolor: "#060a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="caption" sx={{ color: "#3a4a5a" }}>
              Aucune
            </Typography>
          </Box>
        )}
        <Box>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          <Button
            variant="outlined"
            size="small"
            onClick={handleClick}
            disabled={uploading}
            sx={{ borderColor: "#1e2530", color: "#ccc", "&:hover": { borderColor: "#00E5FF44", bgcolor: "transparent" } }}
          >
            {uploading ? "Upload..." : "Choisir une image"}
          </Button>
          {currentUrl && (
            <Button size="small" onClick={() => field.onChange("")} sx={{ ml: 1, color: "#ff4d6d", minWidth: "auto" }}>
              Supprimer
            </Button>
          )}
        </Box>
      </Box>
      {fieldState?.error && (
        <Typography variant="caption" sx={{ color: "#ff4d6d", mt: 0.5, display: "block" }}>
          {fieldState.error.message}
        </Typography>
      )}
    </Box>
  );
}
