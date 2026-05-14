"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, type Category } from "@/lib/insights/schema";
import { adminFetch, getToken } from "@/lib/admin/client-auth";

/**
 * Insight editor form. Reused for both "new" and "edit" modes:
 *   - "new"  : oldSlug undefined, fields default-empty, action POST.
 *   - "edit" : oldSlug = current slug, fields pre-filled, action PUT.
 *
 * Hits /api/admin/insights (POST) or /api/admin/insights/[slug]
 * (PUT) depending on mode.
 *
 * Audio upload uses a separate POST /api/admin/upload-audio call
 * BEFORE save — once the upload returns the public URL, the
 * audio field is populated and the form save proceeds normally.
 */

type Props = {
  mode: "new" | "edit";
  /** For edit mode, the original slug — used in the PUT URL. */
  oldSlug?: string;
  initial?: {
    title?: string;
    date?: string;
    category?: Category;
    excerpt?: string;
    readTime?: string;
    image?: string;
    featured?: boolean;
    video?: string;
    audio?: string;
    body?: string;
  };
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function InsightEditor({ mode, oldSlug, initial }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [category, setCategory] = useState<Category>(
    initial?.category ?? "Leadership",
  );
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [readTime, setReadTime] = useState(initial?.readTime ?? "5 min read");
  const [image, setImage] = useState(initial?.image ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [video, setVideo] = useState(initial?.video ?? "");
  const [audio, setAudio] = useState(initial?.audio ?? "");
  const [body, setBody] = useState(initial?.body ?? "");

  const [saving, setSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        fm: {
          title: title.trim(),
          date,
          category,
          excerpt: excerpt.trim(),
          readTime: readTime.trim(),
          image: image.trim() || undefined,
          featured,
          video: video.trim() || undefined,
          audio: audio.trim() || undefined,
        },
        body,
      };
      const url =
        mode === "new"
          ? "/api/admin/insights"
          : `/api/admin/insights/${oldSlug}`;
      const method = mode === "new" ? "POST" : "PUT";
      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `${method} failed (${res.status})`);
        setSaving(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setSaving(false);
    }
  };

  const onUploadAudio = async (file: File) => {
    setError(null);
    setUploadingAudio(true);
    try {
      // We need a slug to name the audio file. If the post is new,
      // derive it from the title; for edits, use the existing slug.
      const slug =
        mode === "edit" && oldSlug
          ? oldSlug
          : title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (!slug) {
        setError("Set the title before uploading audio");
        setUploadingAudio(false);
        return;
      }
      const form = new FormData();
      form.append("file", file);
      form.append("slug", slug);
      const token = getToken();
      const res = await fetch("/api/admin/upload-audio", {
        method: "POST",
        body: form,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Audio upload failed");
        setUploadingAudio(false);
        return;
      }
      const data = await res.json();
      setAudio(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setUploadingAudio(false);
    }
  };

  const onDelete = async () => {
    if (mode !== "edit" || !oldSlug) return;
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    setError(null);
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/insights/${oldSlug}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Delete failed (${res.status})`);
        setDeleting(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-8 max-w-4xl">
      {/* Frontmatter fields, two-column on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Title" full>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputCls}
          />
        </Field>

        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={inputCls}
          />
        </Field>

        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#0a0a0c]">
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label={`Excerpt (${excerpt.length}/280)`} full>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            maxLength={280}
            rows={2}
            className={`${inputCls} resize-y`}
          />
        </Field>

        <Field label='Read time (e.g. "8 min read")'>
          <input
            type="text"
            value={readTime}
            onChange={(e) => setReadTime(e.target.value)}
            required
            className={inputCls}
          />
        </Field>

        <Field label="Hero image path (optional)">
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="/images/about.jpg"
            className={inputCls}
          />
        </Field>

        <Field label="Video URL (optional, YouTube)" full>
          <input
            type="text"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className={inputCls}
          />
        </Field>

        <Field label="Audio file (optional)" full>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={audio}
              onChange={(e) => setAudio(e.target.value)}
              placeholder="/audio/slug.mp3"
              className={`${inputCls} flex-1`}
            />
            <label
              className={`shrink-0 rounded-full border border-white/15 hover:border-[#0f62fe]/50 bg-white/[0.04] hover:bg-[#0f62fe]/10 px-5 py-3 font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-300 hover:text-white cursor-pointer transition-colors flex items-center justify-center ${
                uploadingAudio ? "opacity-60 cursor-wait" : ""
              }`}
            >
              <input
                type="file"
                accept="audio/*"
                disabled={uploadingAudio}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUploadAudio(f);
                  e.target.value = "";
                }}
                className="hidden"
              />
              {uploadingAudio ? "Uploading…" : "Upload MP3"}
            </label>
          </div>
        </Field>

        <Field label="" full>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-[#0f62fe]"
            />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-zinc-300">
              Featured (homepage hero card)
            </span>
          </label>
        </Field>
      </div>

      {/* Body */}
      <Field label="Body (Markdown)" full>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={20}
          className={`${inputCls} font-mono text-sm leading-relaxed resize-y`}
          placeholder={`## A heading\n\nYour paragraph here.\n\n- A bullet\n- Another bullet\n\n> A blockquote.\n`}
        />
      </Field>

      {error && (
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 sticky bottom-4 z-10 bg-[#0a0a0c]/85 backdrop-blur border border-white/8 rounded-full px-4 py-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#0f62fe] hover:bg-[#4589ff] disabled:bg-white/10 disabled:text-zinc-500 px-6 py-2.5 font-mono text-[11px] tracking-[0.22em] uppercase text-white transition-colors"
        >
          {saving ? "Saving…" : mode === "new" ? "Create insight" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.replace("/admin")}
          className="rounded-full border border-white/15 hover:border-white/30 px-5 py-2.5 font-mono text-[11px] tracking-[0.22em] uppercase text-zinc-300 hover:text-white transition-colors"
        >
          Cancel
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="ml-auto rounded-full border border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10 px-5 py-2.5 font-mono text-[11px] tracking-[0.22em] uppercase text-red-400 hover:text-red-200 transition-colors"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}

const inputCls =
  "w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/10 focus:border-[#0f62fe]/60 rounded-xl px-4 py-3 text-base text-white outline-none transition-colors";

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-2 ${full ? "md:col-span-2" : ""}`}>
      {label && (
        <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-zinc-500">
          {label}
        </span>
      )}
      {children}
    </label>
  );
}
