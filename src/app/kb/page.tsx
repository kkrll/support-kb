"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KBEntry } from "@/lib/types";

export default function KBEditor() {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<KBEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KBEntry | null>(null);
  const [formData, setFormData] = useState<Partial<KBEntry>>({
    id: "",
    category: "access",
    triggers: [],
    answer: "",
    followup: "",
    escalate: false,
  });
  const [triggersText, setTriggersText] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredEntries(entries);
    } else {
      setFilteredEntries(entries.filter((e) => e.category === selectedCategory));
    }
  }, [entries, selectedCategory]);

  async function loadEntries() {
    try {
      const response = await fetch("/api/kb");
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error("Failed to load KB entries:", error);
    }
  }

  function handleEdit(entry: KBEntry) {
    setEditingEntry(entry);
    setFormData(entry);
    setTriggersText(entry.triggers.join(", "));
    setIsDialogOpen(true);
  }

  function handleAddNew() {
    setEditingEntry(null);
    setFormData({
      id: `entry-${Date.now()}`,
      category: "access",
      triggers: [],
      answer: "",
      followup: "",
      escalate: false,
    });
    setTriggersText("");
    setIsDialogOpen(true);
  }

  async function handleSave() {
    const triggers = triggersText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const entryToSave: KBEntry = {
      id: formData.id!,
      category: formData.category!,
      triggers,
      answer: formData.answer!,
      followup: formData.followup || undefined,
      escalate: formData.escalate || undefined,
    };

    try {
      const response = await fetch("/api/kb", {
        method: editingEntry ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryToSave),
      });

      if (response.ok) {
        await loadEntries();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to save entry:", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;

    try {
      const response = await fetch(`/api/kb?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadEntries();
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  }

  const categories = ["all", "access", "technical", "payments"];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">KB Editor</h1>
        <Button onClick={handleAddNew}>Add Entry</Button>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Triggers</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.category}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {entry.triggers.join(", ")}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {entry.answer}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit Entry" : "Add New Entry"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">ID</label>
              <Input
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={!!editingEntry}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="w-full border rounded-md p-2"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="access">Access</option>
                <option value="technical">Technical</option>
                <option value="payments">Payments</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Triggers (comma-separated)
              </label>
              <Input
                value={triggersText}
                onChange={(e) => setTriggersText(e.target.value)}
                placeholder="пароль, где пароль, не могу найти пароль"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Answer</label>
              <Textarea
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Follow-up (optional)</label>
              <Textarea
                value={formData.followup || ""}
                onChange={(e) =>
                  setFormData({ ...formData, followup: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.escalate || false}
                onChange={(e) =>
                  setFormData({ ...formData, escalate: e.target.checked })
                }
              />
              <label className="text-sm font-medium">Escalate to support</label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
