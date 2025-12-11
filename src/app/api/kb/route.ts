import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { KBEntry } from "@/lib/types";

interface KBFile {
  category: string;
  entries: Omit<KBEntry, "category">[];
}

const KB_PATH = join(process.cwd(), "src/kb");

const FILES_MAP: Record<string, string> = {
  access: "global/access.json",
  technical: "global/technical.json",
  payments: "global/payments.json",
};

function loadAllEntries(): KBEntry[] {
  const entries: KBEntry[] = [];

  Object.entries(FILES_MAP).forEach(([category, filePath]) => {
    try {
      const content = readFileSync(join(KB_PATH, filePath), "utf-8");
      const kbFile: KBFile = JSON.parse(content);
      entries.push(
        ...kbFile.entries.map((entry) => ({ ...entry, category }))
      );
    } catch (error) {
      console.error(`Failed to load ${filePath}:`, error);
    }
  });

  return entries;
}

function saveEntry(entry: KBEntry) {
  const filePath = FILES_MAP[entry.category];
  if (!filePath) {
    throw new Error(`Unknown category: ${entry.category}`);
  }

  const fullPath = join(KB_PATH, filePath);
  const content = readFileSync(fullPath, "utf-8");
  const kbFile: KBFile = JSON.parse(content);

  const existingIndex = kbFile.entries.findIndex((e) => e.id === entry.id);

  const entryWithoutCategory: Omit<KBEntry, "category"> = {
    id: entry.id,
    triggers: entry.triggers,
    answer: entry.answer,
    ...(entry.followup && { followup: entry.followup }),
    ...(entry.escalate && { escalate: entry.escalate }),
  };

  if (existingIndex >= 0) {
    kbFile.entries[existingIndex] = entryWithoutCategory;
  } else {
    kbFile.entries.push(entryWithoutCategory);
  }

  writeFileSync(fullPath, JSON.stringify(kbFile, null, 2));
}

function deleteEntry(id: string) {
  Object.entries(FILES_MAP).forEach(([category, filePath]) => {
    const fullPath = join(KB_PATH, filePath);
    try {
      const content = readFileSync(fullPath, "utf-8");
      const kbFile: KBFile = JSON.parse(content);

      const filteredEntries = kbFile.entries.filter((e) => e.id !== id);

      if (filteredEntries.length !== kbFile.entries.length) {
        kbFile.entries = filteredEntries;
        writeFileSync(fullPath, JSON.stringify(kbFile, null, 2));
      }
    } catch (error) {
      console.error(`Failed to process ${filePath}:`, error);
    }
  });
}

export async function GET() {
  try {
    const entries = loadAllEntries();
    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load entries" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const entry: KBEntry = await req.json();
    saveEntry(entry);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save entry" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const entry: KBEntry = await req.json();
    saveEntry(entry);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    deleteEntry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
