// Expo Router 57 uses query-string 7's CommonJS API. Its fixed decoder is ESM.
// Bridge only the default import; retain both upstream libraries unchanged otherwise.
// Remove when the supported Router uses a patched decoder natively.
const { createHash } = require("node:crypto");
const { readFileSync, writeFileSync } = require("node:fs");
const { dirname, join } = require("node:path");

const originalHash =
  "caa3f2c8b45dfe1e91db22ae10743af68de8d96f26515132bb52485ec0f037fa";
const patchedHash =
  "fc1ca6e1961ba005e554b1bc0de932d6454bf59bfaea03d02c7261dbdcafcdbd";

function patchQueryString(
  directory = dirname(require.resolve("query-string")),
) {
  const { version } = JSON.parse(
    readFileSync(join(directory, "package.json"), "utf8"),
  );
  if (version !== "7.1.3") {
    throw new Error(
      `Unexpected query-string version ${version}; review the decoder compatibility patch.`,
    );
  }
  const path = join(directory, "index.js");
  const source = readFileSync(path, "utf8");
  const digest = createHash("sha256").update(source).digest("hex");
  if (digest === patchedHash) return "already patched";
  if (digest !== originalHash) {
    throw new Error(
      "Unexpected query-string source; refusing to apply the decoder compatibility patch.",
    );
  }
  writeFileSync(
    path,
    source.replace(
      "const decodeComponent = require('decode-uri-component');",
      "const decodeComponent = require('decode-uri-component').default;",
    ),
  );
  return "patched";
}

module.exports = { patchQueryString };
if (require.main === module)
  console.log(`query-string decoder: ${patchQueryString()}`);
