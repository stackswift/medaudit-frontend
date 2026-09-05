import React, { useState } from "react";
import { Copy, Check, FileCheck } from "lucide-react";
import { toast } from "sonner";

interface LegalLetterViewerProps {
  markdown: string;
}

function parseInline(text: string): React.ReactNode[] {
  // Regex to match **bold** or *italic*
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={match.index} className="italic text-foreground/80">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts.length > 0 ? parts : [text];
}

interface TableData {
  headers: string[];
  rows: string[][];
}

function parseTable(lines: string[]): TableData | null {
  if (lines.length < 2) return null;
  const cleanCells = (line: string) =>
    line
      .trim()
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim());

  const headers = cleanCells(lines[0]);
  // Line 1 is the separator: |---|---|...
  const rows: string[][] = [];

  for (let i = 2; i < lines.length; i++) {
    if (!lines[i].trim().startsWith("|")) continue;
    rows.push(cleanCells(lines[i]));
  }

  return { headers, rows };
}

export function LegalLetterViewer({ markdown }: LegalLetterViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success("Dispute letter copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Group lines into blocks
  const rawLines = markdown.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i].trim();

    // Empty line
    if (!line) {
      i++;
      continue;
    }

    // Divider
    if (line === "---" || line === "***" || line === "___") {
      blocks.push(<hr key={`hr-${i}`} className="my-4 border-border/60" />);
      i++;
      continue;
    }

    // Heading 1
    if (line.startsWith("# ")) {
      blocks.push(
        <div key={`h1-${i}`} className="mb-4 border-b border-border/80 pb-3 pt-1">
          <div className="flex items-center gap-2 text-cyan">
            <FileCheck className="size-4 shrink-0" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Official Legal Dispatch</span>
          </div>
          <h1 className="mt-1 text-base font-bold tracking-tight text-foreground sm:text-lg">
            {line.replace(/^#\s+/, "")}
          </h1>
        </div>
      );
      i++;
      continue;
    }

    // Heading 2 or 3
    if (line.startsWith("## ") || line.startsWith("### ")) {
      const headingText = line.replace(/^#{2,3}\s+/, "");
      blocks.push(
        <h2
          key={`h-${i}`}
          className="mb-2 mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan"
        >
          {headingText}
        </h2>
      );
      i++;
      continue;
    }

    // Markdown Table
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith("|")) {
        tableLines.push(rawLines[i]);
        i++;
      }
      const tableData = parseTable(tableLines);
      if (tableData) {
        blocks.push(
          <div
            key={`table-${i}`}
            className="my-3 overflow-x-auto rounded-xl border border-border/80 bg-surface/80"
          >
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-strong/60 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  {tableData.headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-3.5 py-2.5 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono text-[11px]">
                {tableData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.02]">
                    {row.map((cell, cIdx) => {
                      const isIssue =
                        cell === "UPCODING" ||
                        cell === "PRICE_DISPARITY" ||
                        cell === "UNBUNDLING" ||
                        cell.includes("UNBUNDLED");
                      const isCpt = /^[0-9]{4,5}[A-Z]?$/i.test(cell);
                      const isMoney = cell.startsWith("$");

                      return (
                        <td key={cIdx} className="px-3.5 py-2 text-foreground/90">
                          {isIssue ? (
                            <span className="inline-flex rounded border border-danger/40 bg-danger/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-danger">
                              {cell}
                            </span>
                          ) : isCpt ? (
                            <span className="font-semibold text-cyan">{cell}</span>
                          ) : isMoney ? (
                            <span className="tabular-nums font-medium">{cell}</span>
                          ) : (
                            parseInline(cell)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Key-Value Metadata lines (e.g. **To:** ..., **From:** ...)
    if (line.startsWith("**") && line.includes(":**")) {
      const metaLines: string[] = [];
      while (
        i < rawLines.length &&
        rawLines[i].trim().startsWith("**") &&
        rawLines[i].includes(":**")
      ) {
        metaLines.push(rawLines[i].trim());
        i++;
      }

      blocks.push(
        <div
          key={`meta-${i}`}
          className="my-3 grid gap-2 rounded-xl border border-border/70 bg-white/[0.02] p-3.5 sm:grid-cols-2"
        >
          {metaLines.map((ml, mIdx) => {
            const parts = ml.split(":**");
            const label = parts[0].replace(/^\*\*/, "");
            const val = parts.slice(1).join(":**").trim();
            return (
              <div key={mIdx} className="text-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {label}:
                </span>{" "}
                <span className="font-medium text-foreground">{val}</span>
              </div>
            );
          })}
        </div>
      );
      continue;
    }

    // Bullet or numbered list items
    if (/^(\*|-|\d+\.)\s+/.test(line)) {
      const listItems: string[] = [];
      const isOrdered = /^\d+\.\s+/.test(line);
      while (i < rawLines.length && /^(\*|-|\d+\.)\s+/.test(rawLines[i].trim())) {
        listItems.push(rawLines[i].trim().replace(/^(\*|-|\d+\.)\s+/, ""));
        i++;
      }

      blocks.push(
        isOrdered ? (
          <ol key={`ol-${i}`} className="my-2.5 list-decimal space-y-1.5 pl-5 text-xs text-muted-foreground">
            {listItems.map((item, lIdx) => (
              <li key={lIdx} className="leading-relaxed">
                {parseInline(item)}
              </li>
            ))}
          </ol>
        ) : (
          <ul key={`ul-${i}`} className="my-2.5 list-disc space-y-1.5 pl-5 text-xs text-muted-foreground">
            {listItems.map((item, lIdx) => (
              <li key={lIdx} className="leading-relaxed">
                {parseInline(item)}
              </li>
            ))}
          </ul>
        )
      );
      continue;
    }

    // Regular paragraph
    blocks.push(
      <p key={`p-${i}`} className="my-2 text-xs leading-relaxed text-muted-foreground">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between border-b border-border/50 pb-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Formal Dispute Notice Document
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-cyan/40 hover:text-foreground"
        >
          {copied ? <Check className="size-3.5 text-emerald" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy Markdown"}
        </button>
      </div>

      <div className="rounded-xl border border-border/60 bg-surface/50 p-5 shadow-inner">
        {blocks}
      </div>
    </div>
  );
}
