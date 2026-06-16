import fs from "fs";

const p = process.argv[2];
const lineNum = Number(process.argv[3]);
const lines = fs.readFileSync(p, "utf8").split("\n");
lines[lineNum - 1] = "          </div>";
fs.writeFileSync(p, lines.join("\n"));
