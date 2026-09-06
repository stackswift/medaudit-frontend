import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { FileText, UploadCloud, ShieldCheck, Cpu, Zap } from "lucide-react";
import type { Claim } from "./data";
import { generateClaimId, todayFormatted, formatFileSize } from "./data";

type UploadState = "idle" | "dragging" | "scanning" | "staged";

export function IngestionZone({
  onIngest,
}: {
  onIngest: (claim: Claim) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [stagedFile, setStagedFile] = useState<{ name: string; size: string } | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [14, -14]), {
    stiffness: 200,
    damping: 20,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), {
    stiffness: 200,
    damping: 20,
  });
  const glowX = useTransform(mx, [-0.5, 0.5], [20, 80]);
  const glowY = useTransform(my, [-0.5, 0.5], [20, 80]);

  const handleMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const processFile = useCallback(
    (file: File) => {
      const validTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];
      if (!validTypes.includes(file.type)) {
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        return;
      }

      setUploadState("scanning");
      setStagedFile({ name: file.name, size: formatFileSize(file.size) });
      setScanProgress(0);

      // Simulate OCR scanning progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadState("staged");

          // Derive provider name from filename
          const baseName = file.name
            .replace(/\.(pdf|png|jpe?g)$/i, "")
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          const newClaim: Claim = {
            id: generateClaimId(),
            provider: baseName || "Uploaded Document",
            facility: "Parsing document",
            date: todayFormatted(),
            savings: 0,
            status: "Parsing",
            fileName: file.name,
            fileSize: file.size,
          };
          onIngest(newClaim);

          // Reset after staging
          setTimeout(() => {
            setUploadState("idle");
            setStagedFile(null);
            setScanProgress(0);
          }, 2000);
        }
        setScanProgress(Math.min(progress, 100));
      }, 120);
    },
    [onIngest],
  );

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isDraggingOrActive = uploadState === "dragging" || uploadState === "scanning";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 24, delay: 0.05 }}
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onDragOver={(e) => {
        e.preventDefault();
        if (uploadState === "idle") setUploadState("dragging");
      }}
      onDragLeave={() => {
        if (uploadState === "dragging") setUploadState("idle");
      }}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
        else setUploadState("idle");
      }}
      className={`relative overflow-hidden rounded-2xl border bg-surface p-8 backdrop-blur-xl transition-all duration-300 sm:p-12 ${
        isDraggingOrActive
          ? "border-cyan/60 shadow-glow-cyan"
          : uploadState === "staged"
            ? "border-emerald/40"
            : "border-border"
      }`}
      style={{ perspective: 1200 }}
    >
      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf,image/png,image/jpeg"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-70 void-grid" />

      {/* Ambient cursor-tracked glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([x, y]: number[]) =>
              `radial-gradient(600px circle at ${x}% ${y}%, oklch(0.78 0.13 205 / 0.18), transparent 60%)`,
          ),
        }}
      />

      <div className="relative flex flex-col items-center gap-8">
        {/* 3D Tiltable Document Card */}
        <motion.div
          style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
          className="relative"
        >
          <div className="relative h-52 w-40 rounded-xl border border-border bg-gradient-to-b from-white/10 to-transparent p-4 shadow-panel backdrop-blur-md sm:h-60 sm:w-46">
            {/* Holographic edge shimmer */}
            <div
              className="pointer-events-none absolute inset-0 rounded-xl opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.78 0.13 205 / 0.15), transparent 40%, oklch(0.60 0.14 280 / 0.12), transparent 70%, oklch(0.79 0.17 163 / 0.10))",
              }}
            />

            <div className="flex items-center gap-2">
              <FileText className="size-4 text-cyan" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                EOB / 837P
              </span>
            </div>
            <div className="mt-5 space-y-2.5">
              {[92, 74, 84, 60, 88, 52, 70].map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: `${w}%`, opacity: 1 }}
                  transition={{ delay: 0.08 * i + 0.3, duration: 0.5, ease: "easeOut" }}
                  className="h-1.5 rounded-full bg-white/12"
                />
              ))}
            </div>
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
              <span>CPT</span>
              <span className="text-danger">99285</span>
            </div>

            {/* Scan line laser - active during drag/scan */}
            {isDraggingOrActive && (
              <motion.div
                aria-hidden
                initial={{ top: "0%" }}
                animate={{ top: ["0%", "100%"] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-cyan/35 to-transparent"
              >
                <div className="h-px w-full bg-cyan shadow-glow-cyan" />
              </motion.div>
            )}

            {/* Scanning progress ring overlay */}
            {uploadState === "scanning" && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
                <div className="relative flex flex-col items-center">
                  <svg className="size-16" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="oklch(0.78 0.13 205 / 0.2)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="oklch(0.78 0.13 205)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(scanProgress / 100) * 175.9} 175.9`}
                      transform="rotate(-90 32 32)"
                      style={{ transition: "stroke-dasharray 0.15s ease" }}
                    />
                  </svg>
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-cyan tabular-nums">
                    {Math.round(scanProgress)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Ambient floor glow */}
          <div
            className="absolute -bottom-8 left-1/2 h-8 w-32 -translate-x-1/2 rounded-full bg-cyan/25 blur-2xl"
            style={{ transform: "translateZ(-40px) translateX(-50%)" }}
          />
        </motion.div>

        {/* Content area */}
        <div className="max-w-md text-center">
          {uploadState === "staged" && stagedFile ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-semibold tracking-tight text-emerald">
                ✓ File staged for audit
              </h2>
              <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                {stagedFile.name} · {stagedFile.size}
              </p>
              <button
                onClick={handleSelectClick}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-shadow hover:shadow-glow-cyan"
              >
                <UploadCloud className="size-4 text-cyan" />
                Choose another file
              </button>
            </motion.div>
          ) : (
            <>
              <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
                <span className="text-gradient-cyan">
                  Drop claims to begin audit
                </span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The agent parses EOBs, 837P and itemized bills, then
                cross-references CMS coding rules line by line.
              </p>
              <button
                onClick={handleSelectClick}
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-cyan/30 bg-cyan-soft px-4 py-2 text-sm font-medium text-foreground transition-shadow hover:shadow-glow-cyan"
              >
                <UploadCloud className="size-4 text-cyan" />
                Select files
              </button>
            </>
          )}
        </div>

        {/* Compliance badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: ShieldCheck, label: "HIPAA Compliant" },
            { icon: Cpu, label: "CMS NCCI v30.1" },
            { icon: Zap, label: "Bedrock AgentCore" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground backdrop-blur-sm"
            >
              <Icon className="size-3 text-cyan/70" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
