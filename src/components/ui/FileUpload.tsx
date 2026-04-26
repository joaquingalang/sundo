"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { cn } from "@/lib/cn";

type UploadState = "idle" | "uploading" | "success" | "error";

interface FileUploadProps {
  label: string;
  storagePath: string;
  onUploadComplete: (url: string) => void;
  error?: string;
  optional?: boolean;
  accept?: string;
  previewUrl?: string;
}

export function FileUpload({
  label,
  storagePath,
  onUploadComplete,
  error,
  optional = false,
  accept = "image/*,.pdf",
  previewUrl,
}: FileUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    console.log("[FileUpload] handleFile called:", { name: file.name, size: file.size, type: file.type, storagePath });
    console.log("[FileUpload] storage instance:", storage);
    console.log("[FileUpload] storage.app:", storage?.app);

    if (file.size > 10 * 1024 * 1024) {
      console.warn("[FileUpload] File too large:", file.size);
      setUploadError("File must be under 10 MB.");
      setState("error");
      return;
    }
    setFileName(file.name);
    setState("uploading");
    setProgress(0);
    setUploadError(null);

    let storageRef;
    let task;
    try {
      storageRef = ref(storage, storagePath);
      console.log("[FileUpload] storageRef created:", storageRef.fullPath);
      task = uploadBytesResumable(storageRef, file);
      console.log("[FileUpload] upload task created:", task);
    } catch (initErr) {
      console.error("[FileUpload] Failed to create upload task:", initErr);
      setState("error");
      setUploadError("Failed to start upload. See console.");
      return;
    }

    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        console.log("[FileUpload] progress:", pct, "%", snap.state);
        setProgress(pct);
      },
      (err) => {
        console.error("[FileUpload] Storage error:", err.code, err.message, err);
        setState("error");
        if (err.code === "storage/unauthorized") {
          setUploadError("Permission denied. Check Firebase Storage rules.");
        } else if (err.code === "storage/canceled") {
          setUploadError("Upload was cancelled.");
        } else {
          setUploadError(`Upload failed (${err.code}). Please try again.`);
        }
      },
      async () => {
        console.log("[FileUpload] Upload complete, getting download URL...");
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          console.log("[FileUpload] Download URL obtained:", url);
          onUploadComplete(url);
          setState("success");
        } catch (urlErr) {
          console.error("[FileUpload] getDownloadURL failed:", urlErr);
          setState("error");
          setUploadError("Upload finished but could not get URL. See console.");
        }
      }
    );
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    console.log("[FileUpload] handleChange fired, files:", e.target.files);
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    else console.warn("[FileUpload] No file selected in change event.");
    e.target.value = "";
  }

  function handleClick() {
    if (state === "uploading") return;
    inputRef.current?.click();
  }

  const displayError = error || uploadError;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground font-body">
          {label}
        </span>
        {optional && (
          <span className="text-xs text-sandstone font-body italic">
            Optional
          </span>
        )}
      </div>

      <div
        role="button"
        tabIndex={state === "uploading" ? -1 : 0}
        aria-label={`Upload ${label}`}
        onClick={handleClick}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          "relative flex flex-col items-center justify-center gap-1.5 h-24 rounded-lg border-2 border-dashed transition-all duration-150",
          state === "uploading" && "border-rhino/40 bg-rhino/5 cursor-default",
          state === "success" &&
            "border-green-400 bg-green-50/60 cursor-pointer hover:bg-green-50",
          state === "error" &&
            "border-red-300 bg-red-50/40 cursor-pointer hover:bg-red-50/60",
          state === "idle" && isDragging && "border-rhino bg-rhino/5 scale-[1.01]",
          state === "idle" &&
            !isDragging &&
            "border-akaroa bg-white cursor-pointer hover:border-rhino/50 hover:bg-rhino/5"
        )}
      >
        {state === "idle" && previewUrl && (
          <img src={previewUrl} alt="Preview" className="h-full w-full object-cover rounded-lg" />
        )}
        {state === "idle" && !previewUrl && (
          <>
            <UploadCloudIcon className="text-sandstone" />
            <p className="text-xs font-body text-center text-sandstone">
              <span className="text-rhino font-semibold">Click to upload</span>{" "}
              or drag & drop
            </p>
            <p className="text-[10px] text-sandstone/60 font-body">
              PDF, JPG, PNG · max 10 MB
            </p>
          </>
        )}

        {state === "uploading" && (
          <div className="w-full px-5 flex flex-col items-center gap-2">
            <p className="text-xs text-sandstone font-body truncate max-w-full">
              {fileName}
            </p>
            <div className="w-full h-1.5 bg-akaroa/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-rhino rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-sandstone font-body">{progress}%</p>
          </div>
        )}

        {state === "success" && (
          <div className="flex items-center gap-2 px-4">
            <CheckCircleIcon className="text-green-500 shrink-0" />
            <span className="text-xs font-body text-foreground truncate">
              {fileName}
            </span>
            <span className="text-[10px] text-sandstone font-body ml-auto shrink-0">
              Click to replace
            </span>
          </div>
        )}

        {state === "error" && (
          <>
            <UploadCloudIcon className="text-red-400" />
            <p className="text-xs text-red-500 font-body">
              {uploadError ?? "Upload failed"} · Click to retry
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />

      {displayError && state !== "error" && (
        <p className="text-xs text-red-500 font-body" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
}

function UploadCloudIcon({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
