import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "speaker-photos";

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Validation type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 400 });
    }

    // Validation taille (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 2MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nom de fichier unique
    const ext = file.name.split(".").pop();
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filePath = `speakers/${filename}`;

    // Upload vers Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[POST /api/upload] Supabase upload error:", uploadError);
      return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
    }

    // URL publique
    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);

    return NextResponse.json({ url: data.publicUrl }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}