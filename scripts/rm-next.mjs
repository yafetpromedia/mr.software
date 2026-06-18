import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const targets = [
  join(process.cwd(), ".next"),
  join(process.cwd(), "node_modules", ".cache", "next-dev"),
  join(process.cwd(), "node_modules", ".cache", "webpack"),
];

for (const dir of targets) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
    console.log(`Removed ${dir}`);
  }
}
