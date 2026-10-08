// Modo demo de la app cliente:  node scripts/demo.js start | export
const { spawnSync } = require("child_process");

const mode = process.argv[2] === "export" ? "export" : "start";
const env = {
  ...process.env,
  EXPO_PUBLIC_DEMO_MODE: "true",
  ...(mode === "export" ? { EXPO_BASE_URL: process.env.EXPO_BASE_URL || "/ZaHub/cliente" } : {}),
};
const args = mode === "export" ? ["expo", "export", "-p", "web", "--output-dir", "dist"] : ["expo", "start", "--web"];
const r = spawnSync("npx", args, { stdio: "inherit", env, shell: true });
process.exit(r.status ?? 1);
