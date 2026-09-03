import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Cpu,
  FileText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

type IngestState = "idle" | "dragging" | "scanning" | "staged";

export interface UploadedFileMeta {
  name: string;
  sizeFormatted: string;
  type: string;
  rawFile: File;
}

export function IngestionZone({ onIngest }: { onIngest: (file: File) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<IngestState>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [currentFile, setCurrentFile] = useState<UploadedFileMeta | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [14, -14]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), { stiffness: 200, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const resetTilt = () => {
    mx.set(0);
    my.set(0);
    setIsHovered(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateAndProcessFile = (file: File) => {
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    const isAllowedExt = /\.(pdf|png|jpe?g)$/i.test(file.name);

    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      toast.error("Invalid file format", {
        description: "Please upload a valid PDF, PNG, or JPEG medical document.",
      });
      setState("idle");
      return;
    }

    const maxSizeBytes = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSizeBytes) {
      toast.error("File size limit exceeded", {
        description: `Selected file is ${formatFileSize(file.size)}. Maximum size is 25MB.`,
      });
      setState("idle");
      return;
    }

    const meta: UploadedFileMeta = {
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
      type: file.type || "Document",
      rawFile: file,
    };

    setCurrentFile(meta);
    setState("scanning");
    setScanProgress(0);
    toast.success("File staged for audit", {
      description: `${file.name} (${meta.sizeFormatted}) ready for parsing.`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    } else {
      setState("idle");
    }
  };

  const openFilePicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    if (state !== "scanning" || !currentFile) return;
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setState("staged");
            onIngest(currentFile.rawFile);
            setTimeout(() => {
              setState("idle");
            }, 3000);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [state, currentFile, onIngest]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 24, delay: 0.05 }}
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
      onDragOver={(e) => {
        e.preventDefault();
        if (state !== "scanning") setState("dragging");
      }}
      onDragLeave={() => {
        if (state === "dragging") setState("idle");
      }}
      onDrop={handleDrop}
      className={`relative overflow-hidden rounded-2xl border bg-card/60 p-8 backdrop-blur-2xl transition-all duration-300 sm:p-10 ${
        state === "dragging"
          ? "border-cyan shadow-glow-cyan bg-cyan/10"
          : state === "scanning"
            ? "border-violet/50 shadow-glow-violet bg-violet/5"
            : state === "staged"
              ? "border-emerald/50 shadow-glow-emerald bg-emerald/5"
              : "border-border hover:border-cyan/40"
      }`}
      style={{ perspective: 1200 }}
    >
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf,image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Background Micro Grid */}
      <div className="pointer-events-none absolute inset-0 opacity-40 micro-grid" />
      <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-cyan/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-violet/15 blur-3xl" />

      <div className="relative flex flex-col items-center gap-8">
        {/* 3D Tactile Document Card */}
        <motion.div
          style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
          className="relative cursor-pointer"
          onClick={openFilePicker}
        >
          <div className="relative h-60 w-44 rounded-2xl border border-white/15 bg-gradient-to-b from-white/12 via-white/5 to-transparent p-5 shadow-panel backdrop-blur-xl transition-shadow sm:h-64 sm:w-48 group-hover:shadow-glow-cyan">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="size-4 shrink-0 text-cyan" />
                <span className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {currentFile ? currentFile.name.split(".").pop() : "837P / EOB"}
                </span>
              </div>
              <span className="shrink-0 rounded bg-cyan/15 px-1.5 py-0.5 font-mono text-[9px] text-cyan">
                v30.1
              </span>
            </div>

            {/* Real Filename Display */}
            {currentFile ? (
              <div className="mt-4 rounded-xl border border-cyan/30 bg-cyan/10 p-2.5">
                <p className="truncate font-mono text-xs font-semibold text-cyan">
                  {currentFile.name}
                </p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {currentFile.sizeFormatted}
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {[88, 64, 76, 52, 82, 45].map((w, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full bg-white/15"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            )}

            {/* Flagged Item Highlight */}
            <div className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-2 text-[10px] font-mono flex items-center justify-between">
              <span className="text-foreground">CPT 99285</span>
              <span className="text-danger font-semibold">$2,450</span>
            </div>

            {/* Document Footer */}
            <div className="absolute inset-x-5 bottom-4 flex items-center justify-between font-mono text-[9px] text-muted-foreground">
              <span>{currentFile ? "FILE LOADED" : "NPI 1092837"}</span>
              <span className="text-emerald">VERIFIED</span>
            </div>

            {/* Vertical Laser Scanline Animation */}
            {(isHovered || state === "dragging" || state === "scanning") && (
              <motion.div
                aria-hidden
                initial={{ top: "0%" }}
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{
                  duration: state === "scanning" ? 0.9 : 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute inset-x-0 h-14 bg-gradient-to-b from-transparent via-cyan/40 to-transparent"
              >
                <div className="h-0.5 w-full bg-cyan shadow-glow-cyan" />
              </motion.div>
            )}
          </div>

          {/* Under-Card Ambient Shadow Depth */}
          <div
            className="absolute -bottom-8 left-1/2 h-10 w-36 -translate-x-1/2 rounded-full bg-cyan/30 blur-2xl transition-opacity group-hover:opacity-100"
            style={{ transform: "translateZ(-40px) translateX(-50%)" }}
          />
        </motion.div>

        {/* Central State & Drop Controls */}
        <div className="max-w-md text-center">
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <h2 className="text-pretty text-xl font-semibold tracking-tight sm:text-2xl">
                  <span className="text-gradient-cyan">
                    {currentFile ? "Ready for next claim" : "Drop claims to begin audit"}
                  </span>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {currentFile
                    ? `Last uploaded: ${currentFile.name} (${currentFile.sizeFormatted}). Drop another file or click below to select.`
                    : "Drag & drop medical invoices, EOBs or 837P files (PDF, PNG, JPEG up to 25MB). Agent parses CPT codes line by line."}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={openFilePicker}
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan/40 bg-cyan-soft px-5 py-2.5 text-sm font-semibold text-foreground shadow-glow-cyan transition-all hover:scale-105"
                  >
                    <UploadCloud className="size-4 text-cyan" />
                    {currentFile ? "Choose Another File" : "Select & Ingest Files"}
                  </button>
                </div>
              </motion.div>
            )}

            {state === "dragging" && (
              <motion.div
                key="dragging"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-2"
              >
                <h2 className="text-xl font-semibold text-cyan">Release file to scan</h2>
                <p className="text-sm text-cyan/80 font-mono">
                  Agent ready to extract metadata & parse CPT codes...
                </p>
              </motion.div>
            )}

            {state === "scanning" && currentFile && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex flex-col items-center"
              >
                {/* SVG Progress Ring */}
                <div className="relative size-16 grid place-items-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-border"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-cyan transition-all duration-150 ease-out"
                      strokeDasharray={`${scanProgress}, 100`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute font-mono text-xs font-bold text-cyan">
                    {scanProgress}%
                  </span>
                </div>

                <h2 className="mt-3 text-lg font-semibold text-foreground">
                  Scanning {currentFile.name}
                </h2>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {currentFile.sizeFormatted} · {currentFile.type || "Document"}
                </p>
                <p className="mt-2 font-mono text-xs text-cyan animate-pulse">
                  {scanProgress < 40
                    ? "Parsing PDF/Image document structure..."
                    : scanProgress < 80
                      ? "Extracting CPT codes & NPI headers..."
                      : "Cross-referencing CMS NCCI rulebook..."}
                </p>
              </motion.div>
            )}

            {state === "staged" && currentFile && (
              <motion.div
                key="staged"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="grid size-12 place-items-center rounded-full bg-emerald/20 border border-emerald/40 text-emerald shadow-glow-emerald">
                  <CheckCircle2 className="size-6" />
                </div>
                <h2 className="mt-3 text-lg font-semibold text-emerald">
                  {currentFile.name} Ingested
                </h2>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Staged to Live Feed table — checking upcoding violations.
                </p>
                <button
                  onClick={openFilePicker}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-mono text-foreground hover:bg-white/5 transition-colors"
                >
                  <RefreshCw className="size-3.5 text-cyan" />
                  Choose another file
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Compliance Badges Footer */}
        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border/80 pt-6 w-full">
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-mono text-muted-foreground">
            <ShieldCheck className="size-3.5 text-cyan" />
            <span>HIPAA Compliant</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-mono text-muted-foreground">
            <Cpu className="size-3.5 text-violet" />
            <span>CMS NCCI v30.1 Active</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-mono text-muted-foreground">
            <Sparkles className="size-3.5 text-emerald" />
            <span>Bedrock AgentCore</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
