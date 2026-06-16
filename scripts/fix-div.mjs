import fs from "fs";
const bad = "mo" + "tion.div";
const good = "di" + "v";
const files = process.argv.slice(2);
for (const file of files) {
  let s = fs.readFileSync(file, "utf8");
  const re = new RegExp("</?" + bad, "g");
  s = s.replace(re, (m) => m.replace(bad, good));
  fs.writeFileSync(file, s);
  console.log("fixed", file);
}
