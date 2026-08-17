"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogDescription,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoredMember } from "@/lib/role";

export type MemberRow = {
  id: string;
  name: string;
  division: string | null;
  nim: string | null;
};

type EditMemberDialogProps = {
  member: MemberRow | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export default function EditMemberDialog({
  member,
  onOpenChange,
  onSaved,
}: EditMemberDialogProps) {
  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const [nim, setNim] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setDivision(member.division ?? "");
      setNim(member.nim ?? "");
    }
    setError(null);
    setMessage(null);
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/update-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: getStoredMember()?.id,
          memberId: member.id,
          name,
          division,
          nim,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Gagal memperbarui data anggota.");
        return;
      }

      setMessage("Data anggota berhasil diperbarui.");
      onSaved();
    } catch {
      setError("Terjadi kesalahan, coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!member} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogPopup className="max-w-md">
        <DialogTitle>Edit Anggota</DialogTitle>
        <DialogDescription>
          {member
            ? `Ubah data ${member.name} (${member.id}).`
            : "Ubah data anggota."}
        </DialogDescription>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Lengkap</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap anggota"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-division">Devisi</Label>
              <Input
                id="edit-division"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                placeholder="cth: HUMAN RESOURCE"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nim">NIM</Label>
              <Input
                id="edit-nim"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="cth: 124140196"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-emerald-400">{message}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogPopup>
    </Dialog>
  );
}