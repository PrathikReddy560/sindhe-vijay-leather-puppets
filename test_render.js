import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Start the dev server in the background
  console.log("Starting build...");
  execSync("npm run build", { stdio: "inherit" });
  console.log("Build finished successfully. No syntax errors.");
} catch (e) {
  console.error("Build failed!", e);
}
