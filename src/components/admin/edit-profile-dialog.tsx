"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SaveValues = { fullName?: string; phone?: string; password?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (values: SaveValues) => void | Promise<void>;
  initial: { fullName?: string | null; phone?: string | null };
  loading?: boolean;
  title?: string;
  /** Show a "Reset password" section (employees only, gated by employees.reset_password). */
  showPasswordReset?: boolean;
};

function passwordError(pw: string, confirm: string): string | null {
  if (!pw) return null;
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pw)) return "Password must contain an uppercase letter";
  if (!/[0-9]/.test(pw)) return "Password must contain a number";
  if (pw !== confirm) return "Passwords do not match";
  return null;
}

export function EditProfileDialog({
  open,
  onClose,
  onSave,
  initial,
  loading = false,
  title = "Edit profile",
  showPasswordReset = false,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (open) {
      setFullName(initial.fullName ?? "");
      setPhone(initial.phone ?? "");
      setPassword("");
      setConfirm("");
      setShowPw(false);
    }
  }, [open, initial.fullName, initial.phone]);

  const pwErr = showPasswordReset ? passwordError(password, confirm) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pwErr) return;
    // Only send fields that actually changed — lets a reset-password-only user
    // (no employees.edit) submit without tripping the name/phone permission gate.
    const nameChanged = fullName.trim() && fullName.trim() !== (initial.fullName ?? "").trim();
    const phoneChanged = phone.trim() !== (initial.phone ?? "").trim();
    void onSave({
      fullName: nameChanged ? fullName.trim() : undefined,
      phone: phoneChanged ? phone.trim() || undefined : undefined,
      password: showPasswordReset && password ? password : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="edit-profile-name">Full name</Label>
            <Input
              id="edit-profile-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-lg"
              autoFocus
              minLength={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-profile-phone">Phone</Label>
            <Input
              id="edit-profile-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg"
              placeholder="Optional"
            />
          </div>

          {showPasswordReset && (
            <div className="space-y-2 rounded-xl border border-card-border bg-background/60 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <KeyRound className="h-3.5 w-3.5 text-muted" />
                Reset password
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="edit-profile-pw" className="text-xs text-muted">New password</Label>
                <div className="relative">
                  <Input
                    id="edit-profile-pw"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-lg pr-9"
                    placeholder="Leave blank to keep current"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {password.length > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="edit-profile-pw2" className="text-xs text-muted">Confirm new password</Label>
                  <Input
                    id="edit-profile-pw2"
                    type={showPw ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="rounded-lg"
                    autoComplete="new-password"
                  />
                </div>
              )}
              {pwErr && <p className="text-xs text-red-600">{pwErr}</p>}
              <p className="text-[11px] text-muted">
                Min 8 characters, with an uppercase letter and a number. The employee should
                change it after signing in.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-lg"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-lg bg-primary text-sidebar hover:bg-primary/85"
              disabled={loading || !!pwErr}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
