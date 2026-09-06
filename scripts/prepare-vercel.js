import fs from "node:fs";
import path from "node:path";

const clientDir = path.resolve("dist/client");
const assetsDir = path.join(clientDir, "assets");

if (!fs.existsSync(assetsDir)) {
  console.error("Assets directory not found:", assetsDir);
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);

const cssFile = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));
const indexJsFile = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const routesJsFile = files.find((f) => f.startsWith("routes-") && f.endsWith(".js"));

console.log("Found asset files:", { cssFile, indexJsFile, routesJsFile });

const cssLink = cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : "";
const indexScript = indexJsFile ? `<script type="module" src="/assets/${indexJsFile}"></script>` : "";
const routesScript = routesJsFile ? `<script type="module" src="/assets/${routesJsFile}"></script>` : "";

const htmlContent = `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MedAudit — Autonomous Medical Billing Auditor</title>
    <meta name="description" content="Autonomous auditing for medical claims: detect upcoding, recover savings." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
    ${cssLink}
  </head>
  <body class="bg-[#05070a] text-foreground font-sans antialiased">
    <div id="root"></div>
    ${routesScript}
    ${indexScript}
  </body>
</html>
`;

fs.writeFileSync(path.join(clientDir, "index.html"), htmlContent, "utf-8");
console.log("Successfully generated dist/client/index.html for Vercel deployment.");
