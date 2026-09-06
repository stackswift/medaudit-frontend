import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { FileText, UploadCloud } from "lucide-react";

export function IngestionZone({ onIngest }: { onIngest: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-16, 16]), { stiffness: 180, damping: 18 });

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
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onIngest();
      }}
      className={`relative overflow-hidden rounded-2xl border bg-surface p-8 backdrop-blur-xl transition-colors sm:p-12 ${
        dragging ? "border-cyan/50" : "border-border"
      }`}
      style={{ perspective: 1200 }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 void-grid" />

      <div className="relative flex flex-col items-center gap-8">
        <motion.div
          style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
          className="relative"
        >
          <div className="relative h-52 w-40 rounded-xl border border-border bg-gradient-to-b from-white/10 to-transparent p-4 shadow-panel backdrop-blur-md sm:h-60 sm:w-46">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-cyan" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                EOB / 837P
              </span>
            </div>
            <div className="mt-5 space-y-2.5">
              {[92, 74, 84, 60, 88, 52, 70].map((w, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full bg-white/12"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
              <span>CPT</span>
              <span className="text-danger">99285</span>
            </div>

            {dragging && (
              <motion.div
                aria-hidden
                initial={{ top: "0%" }}
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-cyan/35 to-transparent"
              >
                <div className="h-px w-full bg-cyan shadow-glow-cyan" />
              </motion.div>
            )}
          </div>

          <div
            className="absolute -bottom-8 left-1/2 h-8 w-32 -translate-x-1/2 rounded-full bg-cyan/25 blur-2xl"
            style={{ transform: "translateZ(-40px) translateX(-50%)" }}
          />
        </motion.div>

        <div className="max-w-md text-center">
          <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            <span className="text-gradient-cyan">Drop claims to begin audit</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The agent parses EOBs, 837P and itemized bills, then cross-references CMS coding rules
            line by line.
          </p>
          <button
            onClick={onIngest}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-cyan/30 bg-cyan-soft px-4 py-2 text-sm font-medium text-foreground transition-shadow hover:shadow-glow-cyan"
          >
            <UploadCloud className="size-4 text-cyan" />
            Select files
          </button>
        </div>
      </div>
    </motion.div>
  );
}
