"use client";

import { UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/admin-api";

// Cloudinary's free plan takes images up to 10 MB.
const MAX_BYTES = 10 * 1024 * 1024;
// HEIC isn't listed, so iPhones convert their photos to JPEG when picking one.
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";

/** Uploads an image to Cloudinary and hands its web address to `onUploaded`, usually to fill an image URL field. */
export function ImageUploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error("That image is over 10 MB. Please choose a smaller one.");
      return;
    }
    setUploading(true);
    try {
      onUploaded(await adminApi.uploadImage(file));
      toast.success("Image uploaded. Save to keep it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The upload didn't go through. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        className="hidden"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void upload(file);
        }}
      />
      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => input.current?.click()}>
        <UploadIcon data-icon="inline-start" />
        {uploading ? "Uploading…" : "Upload image"}
      </Button>
    </>
  );
}

/** The upload button with a small preview of the current image, for under an image URL field. */
export function ImageUploadRow({ url, onUploaded }: { url: string; onUploaded: (url: string) => void }) {
  const preview = /^https:\/\/\S+$/.test(url.trim()) ? url.trim() : null;
  return (
    <div className="flex items-center gap-3">
      <ImageUploadButton onUploaded={onUploaded} />
      {preview && (
        // A preview of whatever the field holds, which may be on any host.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-10 max-w-24 rounded-md border object-cover" />
      )}
    </div>
  );
}
