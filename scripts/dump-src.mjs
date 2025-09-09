import { promises as fs } from 'fs';
import path from 'path';

const root = process.cwd();
const srcDir = path.join(root, 'src');
const outFile = path.join(root, 'SRC_CODE_DUMP.txt');

const TEXT_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.html', '.scss', '.css', '.json', '.md', '.yml', '.yaml'
]);

const BINARY_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.bmp', '.pdf', '.woff', '.woff2', '.ttf', '.eot', '.map'
]);

async function isDirectory(p) {
  try {
    const st = await fs.stat(p);
    return st.isDirectory();
  } catch {
    return false;
  }
}

function shouldSkip(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTS.has(ext);
}

function isText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return TEXT_EXTS.has(ext) || ext === '';
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

async function main() {
  if (!(await isDirectory(srcDir))) {
    console.error(`Directory not found: ${srcDir}`);
    process.exit(1);
  }

  const lines = [];
  for await (const filePath of walk(srcDir)) {
    const rel = path.relative(root, filePath).replace(/\\/g, '/');
    if (shouldSkip(filePath)) {
      lines.push(`===== BEGIN FILE (skipped binary): ${rel} =====`);
      lines.push('[[binary file skipped]]');
      lines.push(`===== END FILE =====`);
      lines.push('');
      continue;
    }
    if (!isText(filePath)) {
      // default to skip unknown types
      lines.push(`===== BEGIN FILE (skipped): ${rel} =====`);
      lines.push('[[unknown or non-text file type skipped]]');
      lines.push(`===== END FILE =====`);
      lines.push('');
      continue;
    }
    try {
      const content = await fs.readFile(filePath, 'utf8');
      lines.push(`===== BEGIN FILE: ${rel} =====`);
      lines.push(content);
      if (!content.endsWith('\n')) lines.push('');
      lines.push(`===== END FILE =====`);
      lines.push('');
    } catch (e) {
      lines.push(`===== BEGIN FILE (error reading): ${rel} =====`);
      lines.push(String(e));
      lines.push(`===== END FILE =====`);
      lines.push('');
    }
  }

  await fs.writeFile(outFile, lines.join('\n'), 'utf8');
  console.log(`Written: ${outFile}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
