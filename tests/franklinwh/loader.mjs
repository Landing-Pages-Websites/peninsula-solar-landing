// Test-only module hooks: resolve "@/..." and extensionless imports, and compile TS/TSX with
// the SWC build that ships inside Next, so tests need no extra dependency.
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const swc = require("next/dist/build/swc");
const SRC_DIR = fileURLToPath(new URL("../../src/", import.meta.url));
const EXTENSIONS = [".ts", ".tsx"];
let bindings;

export async function resolve(specifier, context, nextResolve) {
  const spec = specifier.startsWith("@/") ? pathToFileURL(path.join(SRC_DIR, specifier.slice(2))).href : specifier;
  try {
    return await nextResolve(spec, context);
  } catch (error) {
    if (!/^(\.|\/|file:)/.test(spec) || path.extname(spec)) throw error;
    for (const ext of EXTENSIONS) {
      try {
        return await nextResolve(spec + ext, context);
      } catch {
        // try the next extension
      }
    }
    throw error;
  }
}

export async function load(url, context, nextLoad) {
  if (!/\.tsx?$/.test(url)) return nextLoad(url, context);
  bindings ??= swc.loadBindings();
  await bindings;
  const filename = fileURLToPath(url);
  const { code } = await swc.transform(await readFile(filename, "utf8"), {
    filename,
    sourceMaps: "inline",
    jsc: { parser: { syntax: "typescript", tsx: url.endsWith(".tsx") }, transform: { react: { runtime: "automatic" } }, target: "es2022" },
    module: { type: "es6" },
  });
  return { format: "module", source: code, shortCircuit: true };
}
