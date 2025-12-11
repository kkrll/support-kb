import { readFileSync } from "fs";
import { join } from "path";
import { KBEntry } from "@/lib/types";

interface KBFile {
  category: string;
  entries: Omit<KBEntry, "category">[];
}

// Load all KB entries at build time
function loadKB(): KBEntry[] {
  const kbPath = join(process.cwd(), "src/kb");

  const files = [
    "global/access.json",
    "global/technical.json",
    "global/payments.json",
  ];

  return files.flatMap((file) => {
    try {
      const content = readFileSync(join(kbPath, file), "utf-8");
      const kbFile = JSON.parse(content) as KBFile;
      return kbFile.entries.map((entry) => ({
        ...entry,
        category: kbFile.category,
      }));
    } catch {
      return [];
    }
  });
}

function loadSystemPrompt(): string {
  try {
    return readFileSync(
      join(process.cwd(), "src/kb/system-prompt.md"),
      "utf-8"
    );
  } catch {
    return "Ты — бот поддержки курсов.";
  }
}

// Cache at module level (loaded once per cold start)
export const kbEntries = loadKB();
export const systemPrompt = loadSystemPrompt();

export function findMatch(message: string): KBEntry | null {
  const normalized = message.toLowerCase().trim();

  return (
    kbEntries.find((entry) =>
      entry.triggers.some((t) => normalized.includes(t.toLowerCase()))
    ) ?? null
  );
}
