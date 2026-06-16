import fs from "fs";

const p = "c:/Users/hp/OneDrive/Desktop/mr-software/components/landing/landing-ui.tsx";
let s = fs.readFileSync(p, "utf8");

s = s.replace(
  "    <motion.div className={`browser-frame overflow-hidden ${className}`}>",
  "    <DIV className={`browser-frame overflow-hidden ${className}`}>",
);
s = s.replace(
  '      <motion.div className="browser-frame-bar flex items-center gap-2 px-4 py-3">',
  '      <DIV className="browser-frame-bar flex items-center gap-2 px-4 py-3">',
);
s = s.replace("      </motion.div>\n      {children}", "      </DIV>\n      {children}");
s = s.replace(
  "    </motion.div>\n  );\n}\n\nexport function FadeIn",
  "    </DIV>\n  );\n}\n\nexport function FadeIn",
);
s = s.replace(/DIV/g, "div");

fs.writeFileSync(p, s);
console.log("fixed");
