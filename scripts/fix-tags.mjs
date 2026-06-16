import fs from "fs";

function fix(path, replacements) {
  let s = fs.readFileSync(path, "utf8");
  for (const [from, to] of replacements) {
    if (!s.includes(from)) console.warn("missing:", from.slice(0, 40), "in", path);
    else s = s.replace(from, to);
  }
  fs.writeFileSync(path, s);
  console.log("ok", path);
}

fix("c:/Users/hp/OneDrive/Desktop/mr-software/components/site-footer.tsx", [
  ["            </ul>\n          </motion.div>\n\n          <motion.div>", "            </ul>\n          </motion.div>\n\n          <motion.div>"],
]);

// manual fixes with unique context
const footer = fs.readFileSync(
  "c:/Users/hp/OneDrive/Desktop/mr-software/components/site-footer.tsx",
  "utf8",
);
fs.writeFileSync(
  "c:/Users/hp/OneDrive/Desktop/mr-software/components/site-footer.tsx",
  footer.replace(
    `              ))}
            </ul>
          </motion.div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Developers`,
    `              ))}
            </ul>
          </motion.div>

          <motion.div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Developers`,
  ).replace(
    `          </motion.div>

          <motion.div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Developers`,
    `          </motion.div>

          <motion.div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Developers`,
  ),
);

// Actually the explore section closes with motion.div - replace that one only
let f = fs.readFileSync(
  "c:/Users/hp/OneDrive/Desktop/mr-software/components/site-footer.tsx",
  "utf8",
);
const exploreClose = `              ))}
            </ul>
          </motion.div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Developers`;
const exploreCloseFixed = exploreClose.replace("</motion.div>", "</motion.div>");
fs.writeFileSync(
  "c:/Users/hp/OneDrive/Desktop/mr-software/components/site-footer.tsx",
  f.replace(exploreClose, exploreCloseFixed),
);

const mp = fs.readFileSync(
  "c:/Users/hp/OneDrive/Desktop/mr-software/components/landing/landing-marketplace-spotlight.tsx",
  "utf8",
);
fs.writeFileSync(
  "c:/Users/hp/OneDrive/Desktop/mr-software/components/landing/landing-marketplace-spotlight.tsx",
  mp.replace(
    `            ))}
          </motion.div>
          <p className="mt-6 text-center sm:hidden">`,
    `            ))}
          </motion.div>
          <p className="mt-6 text-center sm:hidden">`,
  ).replace(
    `          </motion.div>
          <p className="mt-6`,
    `          </motion.div>
          <p className="mt-6`,
  ),
);

console.log("done");
