"use client";

import { useRef, useState } from "react";
import { getToken } from "@/lib/admin/client-auth";

/**
 * Admin body-editor. Wraps a plain textarea with a small toolbar
 * that inserts markdown / MDX snippets at the caret:
 *
 *   - Quote — prefixes every selected line with "> ".
 *   - Image — opens a file picker, uploads via /api/admin/upload-image,
 *             inserts `![alt](url)` at the caret.
 *   - Carousel — accepts multiple files, uploads each, inserts a
 *                `<Carousel images={["url1","url2"]} />` block.
 *   - YouTube — prompts for a YouTube URL, inserts
 *                `<YouTube url="…" />` so the article renders the
 *               existing branded VideoPlayer inline.
 *
 * The output is still plain text in the body — what gets saved to
 * the JSON store and rendered by MDX on the article page. The
 * front-end mdxComponents map (src/app/insights/[slug]/page.tsx)
 * picks up `<Carousel>` and `<YouTube>` and renders the matching
 * React components.
 *
 * Why not a rich-text WYSIWYG: the body is markdown for a reason
 * (clean diffs, predictable PDF output, no editor-state leakage).
 * The toolbar is purely a typing shortcut — every snippet it
 * inserts is hand-editable in the textarea afterward.
 */

type Props = {
  value: string;
  onChange: (v: string) => void;
  /** Slug to name uploaded files under. The form derives it from
   *  the title; if it's empty the upload buttons report an error
   *  via onError instead of starting an upload. */
  slug: string | null;
  /** Surface errors to the parent form (which shows them inline). */
  onError: (msg: string) => void;
  /** Pass-through styling so the textarea matches the rest of the form. */
  className?: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
};

export function BodyEditor({
  value,
  onChange,
  slug,
  onError,
  className,
  rows = 20,
  placeholder,
  required,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState<null | "image" | "carousel">(null);

  /**
   * Replace [selectionStart, selectionEnd) with `insert`. The
   * resulting caret lands at the END of the inserted text. The
   * before-/after-text split is recomputed from the live textarea
   * value rather than `value` (the React state) because the caret
   * positions index the live element, and during fast typing the
   * two can briefly diverge.
   */
  const replaceSelection = (insert: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = el.value;
    const next = current.slice(0, start) + insert + current.slice(end);
    onChange(next);
    // Restore caret position AFTER React rerenders. Using
    // requestAnimationFrame avoids the React-state-not-yet-applied
    // race that breaks setSelectionRange when called synchronously.
    requestAnimationFrame(() => {
      const e2 = textareaRef.current;
      if (!e2) return;
      const caret = start + insert.length;
      e2.focus();
      e2.setSelectionRange(caret, caret);
    });
  };

  /**
   * Wrap each line touched by the selection with a "> " prefix. If
   * nothing is selected, inserts a fresh quote block at the caret.
   * Expands the selection to whole lines so partial-line selections
   * don't split a paragraph mid-word.
   */
  const insertQuote = () => {
    const el = textareaRef.current;
    if (!el) return;
    const current = el.value;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start === end) {
      // No selection — drop a fresh quote stub at the caret on its
      // own line. Surround with blank lines so it parses as a block
      // even if the caret was mid-paragraph.
      const before = current.slice(0, start);
      const after = current.slice(end);
      const needsLeading = before.length > 0 && !before.endsWith("\n\n");
      const needsTrailing = after.length > 0 && !after.startsWith("\n\n");
      const insert =
        (needsLeading ? "\n\n" : "") +
        "> Your quote here" +
        (needsTrailing ? "\n\n" : "");
      const next = before + insert + after;
      onChange(next);
      requestAnimationFrame(() => {
        const e2 = textareaRef.current;
        if (!e2) return;
        // Select "Your quote here" so the visitor types over it.
        const placeholderStart =
          before.length + (needsLeading ? 2 : 0) + "> ".length;
        const placeholderEnd = placeholderStart + "Your quote here".length;
        e2.focus();
        e2.setSelectionRange(placeholderStart, placeholderEnd);
      });
      return;
    }

    // Expand to full lines so "> " prefixes the whole line, not
    // mid-word. Find the start-of-line before `start` and the
    // end-of-line after `end`.
    const lineStart = current.lastIndexOf("\n", start - 1) + 1;
    const lineEndRaw = current.indexOf("\n", end);
    const lineEnd = lineEndRaw === -1 ? current.length : lineEndRaw;
    const block = current.slice(lineStart, lineEnd);
    const quoted = block
      .split("\n")
      .map((line) => (line.length > 0 ? `> ${line}` : ">"))
      .join("\n");
    const next = current.slice(0, lineStart) + quoted + current.slice(lineEnd);
    onChange(next);
    requestAnimationFrame(() => {
      const e2 = textareaRef.current;
      if (!e2) return;
      e2.focus();
      e2.setSelectionRange(lineStart, lineStart + quoted.length);
    });
  };

  /**
   * POST one file to the upload-image endpoint and return the
   * resulting public URL. Throws on auth/size/MIME failures —
   * the caller surfaces those via onError.
   */
  const uploadOne = async (file: File): Promise<string> => {
    if (!slug) {
      throw new Error("Set the title before uploading media");
    }
    const form = new FormData();
    form.append("file", file);
    form.append("slug", slug);
    const token = getToken();
    const res = await fetch("/api/admin/upload-image", {
      method: "POST",
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `Upload failed (${res.status})`);
    }
    const data = (await res.json()) as { url: string };
    return data.url;
  };

  const onSingleImage = async (file: File) => {
    setUploading("image");
    try {
      const url = await uploadOne(file);
      const alt = file.name.replace(/\.[^.]+$/, "");
      replaceSelection(`\n\n![${alt}](${url})\n\n`);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploading(null);
    }
  };

  const onCarouselImages = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setUploading("carousel");
    try {
      // Upload sequentially rather than in parallel. Vercel Blob
      // can handle parallel writes but sequencing means we name
      // uploads predictably (no race for the same `{slug}.jpg`
      // filename — though our saveImageFile uses the slug alone
      // so multiple uploads for one post overwrite each other).
      // Workaround: append an index suffix to the form's `slug`
      // field per file so each lands at a unique Blob path.
      const urls: string[] = [];
      for (let i = 0; i < arr.length; i++) {
        const file = arr[i];
        const suffix = `${slug}-${i + 1}`;
        const form = new FormData();
        form.append("file", file);
        form.append("slug", suffix);
        const token = getToken();
        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: form,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? `Upload failed (${res.status})`);
        }
        const data = (await res.json()) as { url: string };
        urls.push(data.url);
      }
      const literal = urls.map((u) => `"${u}"`).join(", ");
      replaceSelection(`\n\n<Carousel images={[${literal}]} />\n\n`);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Carousel upload failed");
    } finally {
      setUploading(null);
    }
  };

  const insertYouTube = () => {
    const url = window.prompt(
      "Paste the YouTube URL (youtube.com/watch?v=… or youtu.be/…):",
    );
    if (!url) return;
    const trimmed = url.trim();
    if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(trimmed)) {
      onError("That doesn't look like a YouTube URL");
      return;
    }
    replaceSelection(`\n\n<YouTube url="${trimmed}" />\n\n`);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar — four primary actions. Pill-styled to match the
          brand language used elsewhere in the admin. */}
      <div className="flex flex-wrap items-center gap-2">
        <ToolbarButton onClick={insertQuote} label="Quote" hint="Wrap selected lines as a quote" />
        <ToolbarButton
          onClick={() => document.getElementById("body-image-input")?.click()}
          label={uploading === "image" ? "Uploading…" : "Image"}
          hint="Upload an image"
          disabled={!!uploading}
        />
        <ToolbarButton
          onClick={() => document.getElementById("body-carousel-input")?.click()}
          label={uploading === "carousel" ? "Uploading…" : "Carousel"}
          hint="Upload multiple images as a carousel"
          disabled={!!uploading}
        />
        <ToolbarButton
          onClick={insertYouTube}
          label="YouTube"
          hint="Embed a YouTube video"
        />
        <span className="ml-auto font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-600">
          Markdown + MDX
        </span>
      </div>

      {/* Hidden file inputs driven by the toolbar buttons */}
      <input
        id="body-image-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSingleImage(f);
          e.target.value = "";
        }}
      />
      <input
        id="body-carousel-input"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const fs = e.target.files;
          if (fs && fs.length > 0) onCarouselImages(fs);
          e.target.value = "";
        }}
      />

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className={className}
      />
    </div>
  );
}

function ToolbarButton({
  label,
  hint,
  onClick,
  disabled,
}: {
  label: string;
  hint: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={hint}
      data-cursor-hint={hint}
      className="hover-target inline-flex items-center gap-2 rounded-full border border-white/15 hover:border-[#0f62fe]/50 bg-white/[0.04] hover:bg-[#0f62fe]/10 disabled:opacity-50 disabled:cursor-wait px-4 py-2 font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-300 hover:text-white transition-colors"
    >
      <span aria-hidden className="w-1 h-1 rounded-full bg-[#0f62fe] shadow-[0_0_6px_rgba(15,98,254,0.6)]" />
      {label}
    </button>
  );
}
