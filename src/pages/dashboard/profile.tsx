// src/pages/ProfilePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";

const API_BASE = "https://dorpay.in/api";

type CurrentUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  userType?: string;
  roleId?: string;
  status?: string;
  createdAt?: string;
};

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string; // read-only
  mobileNumber: string;
};

type PasswordForm = {
  newPassword: string;
  confirmPassword: string;
};

/* --------------------------- helpers --------------------------- */

function getAuth() {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  let cachedUser: any = null;
  try { cachedUser = userRaw ? JSON.parse(userRaw) : null; } catch { cachedUser = null; }
  return { token, cachedUser };
}

function decodeJwt(token?: string): any | null {
  if (!token) return null;
  try {
    const b64 = token.split(".")[1];
    const b64pad = b64.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64.length + 3) % 4);
    const json = atob(b64pad);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function pick(...vals: Array<unknown>): string {
  for (const v of vals) if (typeof v === "string" && v.trim() !== "") return v.trim();
  return "";
}
function splitName(full?: string) {
  if (!full || typeof full !== "string") return { first: "", last: "" };
  const parts = full.trim().split(/\s+/);
  const first = parts[0] || "";
  const last = parts.slice(1).join(" ");
  return { first, last };
}
function extractFrom(obj: any) {
  if (!obj || typeof obj !== "object") return { first: "", last: "", email: "", mobile: "" };
  const { first: nameFirst, last: nameLast } = splitName(obj?.name);
  return {
    first: pick(obj?.firstName, obj?.first_name, obj?.firstname, obj?.given_name, nameFirst),
    last: pick(obj?.lastName, obj?.last_name, obj?.lastname, obj?.family_name, nameLast),
    email: pick(obj?.email, obj?.mail, obj?.user_email),
    mobile: pick(obj?.mobileNumber, obj?.mobile_number, obj?.phoneNumber, obj?.phone, obj?.contactNumber),
  };
}
function normalizeUser(data: any, claims?: any): CurrentUser {
  const u = data?.user ?? data?.data ?? data;
  const fromPayload = extractFrom(u);
  const fromClaims = extractFrom(claims);
  return {
    id: pick(u?.id, u?.userId, u?._id, claims?.userId, claims?.sub),
    firstName: pick(fromPayload.first, fromClaims.first),
    lastName: pick(fromPayload.last, fromClaims.last),
    email: pick(fromPayload.email, fromClaims.email),
    mobileNumber: pick(fromPayload.mobile, fromClaims.mobile),
    userType: pick(u?.userType, claims?.userType),
    roleId: u?.roleId,
    status: u?.status,
    createdAt: u?.createdAt,
  };
}

/**
 * Fetch the logged-in user:
 *  - admin  -> GET /admin/users/:id
 *  - others -> GET /users/profile (fallback to GET /users/:id if needed)
 */
async function fetchLoggedInUser(): Promise<CurrentUser> {
  const { token, cachedUser } = getAuth();
  if (!token) {
    window.location.href = "/auth/login";
    throw new Error("No auth token");
  }

  const claims = decodeJwt(token);
  const id =
    cachedUser?.id || cachedUser?.userId || cachedUser?._id || claims?.userId || claims?.sub;
  const userType = String(cachedUser?.userType || claims?.userType || "").toLowerCase();

  if (!id) {
    throw new Error("Missing user id (required for /users/:id)");
  }

  try {
    if (userType === "admin") {
      const { data } = await axios.get(`${API_BASE}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return normalizeUser(data, claims);
    } else {
      // ✅ non-admin path uses /users/:id
      const { data } = await axios.get(`${API_BASE}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return normalizeUser(data, claims);
    }
  } catch (err: any) {
    console.warn("[Profile] fetchLoggedInUser failed", {
      status: err?.response?.status, body: err?.response?.data,
    });
    const fromCache = extractFrom(cachedUser);
    const fromClaims = extractFrom(claims);
    return {
      id: String(id || ""),
      email: pick(fromCache.email, fromClaims.email),
      userType,
      firstName: pick(fromCache.first, fromClaims.first),
      lastName: pick(fromCache.last, fromClaims.last),
      mobileNumber: pick(fromCache.mobile, fromClaims.mobile),
    };
  }
}


/** PUT to the correct endpoint based on userType + id. Send only changed fields. */
async function updateMyProfileWithRoleAwarePUT(
  id: string,
  userType: string,
  payload: Partial<{ firstName: string; lastName: string; mobileNumber: string; }>
) {
  const { token } = getAuth();
  if (!token) {
    window.location.href = "/auth/login";
    throw new Error("No auth token");
  }
  if (!id) throw new Error("No user id available for update");

  const url =
    userType?.toLowerCase() === "admin"
      ? `${API_BASE}/admin/users/${id}`
      : `${API_BASE}/users/${id}`;

  const body: Record<string, string> = {};
  if (payload.firstName !== undefined) body.firstName = payload.firstName;
  if (payload.lastName !== undefined) body.lastName = payload.lastName;
  if (payload.mobileNumber !== undefined) body.mobileNumber = payload.mobileNumber;

  const { data } = await axios.put(url, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

/** Validate password strength */
function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Include at least one uppercase letter.";
  if (!/[a-z]/.test(pw)) return "Include at least one lowercase letter.";
  if (!/[0-9]/.test(pw)) return "Include at least one number.";
  return null;
}

/**
 * Change password (no current password field).
 * 1) POST /users/reset-password { newPassword }
 * 2) If that fails and user is admin: POST /admin/users/:id/reset-password { newPassword }
 */
async function resetMyPassword(newPassword: string) {
  const { token, cachedUser } = getAuth();
  if (!token) {
    window.location.href = "/auth/login";
    throw new Error("No auth token");
  }

  const claims = decodeJwt(token);
  const id =
    cachedUser?.id || cachedUser?.userId || cachedUser?._id || claims?.userId || claims?.sub;
  const userType = String(cachedUser?.userType || claims?.userType || "").toLowerCase();

  try {
    await axios.post(
      `${API_BASE}/users/reset-password`,
      { newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return "users/reset-password";
  } catch (err1: any) {
    if (userType === "admin" && id) {
      await axios.post(
        `${API_BASE}/admin/users/${id}/reset-password`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return "admin/users/:id/reset-password";
    }
    throw err1;
  }
}

/* ------------------------- component --------------------------- */

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [me, setMe] = useState<CurrentUser | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    firstName: "", lastName: "", email: "", mobileNumber: "",
  });
  const [pwd, setPwd] = useState<PasswordForm>({
    newPassword: "",
    confirmPassword: "",
  });

  // 👁️ visibility toggles
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Track changes vs original data
  const profileChanged = useMemo(() => {
    if (!me) return false;
    return (
      (form.firstName ?? "") !== (me.firstName ?? "") ||
      (form.lastName ?? "") !== (me.lastName ?? "") ||
      (form.mobileNumber ?? "") !== (me.mobileNumber ?? "")
    );
  }, [form, me]);

  // Only validate mobile if you changed it and left it non-empty
  const mobileChangedAndInvalid = useMemo(() => {
    if (!me) return false;
    const changed = (form.mobileNumber ?? "") !== (me.mobileNumber ?? "");
    const val = form.mobileNumber.trim();
    if (!changed) return false;
    if (val === "") return false; // allow clearing
    return !/^\d{10}$/.test(val);
  }, [form.mobileNumber, me]);

  const wantsPwChange = useMemo(
    () => pwd.newPassword.trim().length > 0 || pwd.confirmPassword.trim().length > 0,
    [pwd]
  );

  const pwdMismatch = useMemo(
    () =>
      pwd.confirmPassword.trim().length > 0 &&
      pwd.newPassword.trim().length > 0 &&
      pwd.newPassword !== pwd.confirmPassword,
    [pwd.newPassword, pwd.confirmPassword]
  );

  // Save is allowed if there’s any change (profile or password) and no blocking errors
  const canSubmit = useMemo(() => {
    const somethingChanged = profileChanged || wantsPwChange;
    const noErrors = !pwdMismatch && !mobileChangedAndInvalid;
    return somethingChanged && noErrors;
  }, [profileChanged, wantsPwChange, pwdMismatch, mobileChangedAndInvalid]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const user = await fetchLoggedInUser();
        setMe(user);
        setForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          mobileNumber: user.mobileNumber || "",
        });
      } catch (err: any) {
        const apiMsg = err?.response?.data?.message || err?.message || "Unknown error";
        console.error("Error fetching user:", err?.response?.data || err);
        toast({ title: "Error", description: `Error fetching user: ${apiMsg}`, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSaveAll(e?: React.FormEvent) {
    e?.preventDefault?.();

    if (!me) {
      toast({ title: "Error", description: "Missing user context.", variant: "destructive" });
      return;
    }

    if (wantsPwChange) {
      if (pwdMismatch) {
        toast({
          title: "Passwords do not match",
          description: "Please confirm the same password.",
          variant: "destructive",
        });
        return;
      }
      const strengthErr = validatePassword(pwd.newPassword);
      if (strengthErr) {
        toast({ title: "Weak password", description: strengthErr, variant: "destructive" });
        return;
      }
    }

    if (mobileChangedAndInvalid) {
      toast({
        title: "Invalid mobile number",
        description: "If you edit mobile, enter a valid 10-digit number or leave it blank.",
        variant: "destructive",
      });
      return;
    }

    if (!wantsPwChange && !profileChanged) {
      toast({ title: "Nothing to save", description: "No changes detected." });
      return;
    }

    try {
      setSaving(true);

      // 1) Password first (if requested)
      if (wantsPwChange) {
        await resetMyPassword(pwd.newPassword);
        toast({ title: "Password updated", description: "Your password has been changed." });
      }

      // 2) Profile update via role-aware PUT to /admin/users/:id or /users/:id
      if (profileChanged) {
        const diff: Partial<ProfileForm> = {};
        if ((form.firstName ?? "") !== (me.firstName ?? "")) diff.firstName = form.firstName;
        if ((form.lastName ?? "") !== (me.lastName ?? "")) diff.lastName = form.lastName;
        if ((form.mobileNumber ?? "") !== (me.mobileNumber ?? "")) diff.mobileNumber = form.mobileNumber;

        if (Object.keys(diff).length > 0) {
          await updateMyProfileWithRoleAwarePUT(me.id, me.userType || "", diff);
          toast({ title: "Profile saved", description: "Your details have been updated." });
        }
      }

      // Refresh + clear password fields
      const fresh = await fetchLoggedInUser();
      setMe(fresh);
      setForm({
        firstName: fresh.firstName || "",
        lastName: fresh.lastName || "",
        email: fresh.email || "",
        mobileNumber: fresh.mobileNumber || "",
      });
      if (wantsPwChange) {
        setPwd({ newPassword: "", confirmPassword: "" });
        setShowNew(false);
        setShowConfirm(false);
      }
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message || err?.message || "Failed to save changes";
      console.error("Save error:", err?.response?.data || err);
      toast({ title: "Error", description: apiMsg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white dark:bg-zinc-800">
          <CardHeader className="space-y-1 text-center sm:text-left">
            <CardTitle className="text-lg sm:text-xl md:text-2xl text-balance">
              My Profile
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm md:text-base leading-tight sm:leading-normal">
              Update your personal details and password.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading your profile…
              </div>
            ) : (
              <form className="grid gap-4 sm:gap-6" onSubmit={onSaveAll}>
                {/* Basic info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="grid gap-1.5 sm:gap-2 min-w-0">
                    <Label htmlFor="firstName" className="text-xs sm:text-sm">First Name</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                      className="h-9 sm:h-10 text-sm sm:text-base w-full"
                    />
                  </div>

                  <div className="grid gap-1.5 sm:gap-2 min-w-0">
                    <Label htmlFor="lastName" className="text-xs sm:text-sm">Last Name</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="h-9 sm:h-10 text-sm sm:text-base w-full"
                    />
                  </div>
                </div>

                <div className="grid gap-1.5 sm:gap-2 min-w-0">
                  <Label htmlFor="email" className="text-xs sm:text-sm">Email (read-only)</Label>
                  <Input
                    id="email"
                    value={form.email}
                    readOnly
                    className="h-9 sm:h-10 text-sm sm:text-base w-full"
                  />
                </div>

                <div className="grid gap-1.5 sm:gap-2 min-w-0">
                  <Label htmlFor="mobileNumber" className="text-xs sm:text-sm">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    value={form.mobileNumber}
                    onChange={(e) => setForm((f) => ({ ...f, mobileNumber: e.target.value }))}
                    className={`h-9 sm:h-10 text-sm sm:text-base w-full ${mobileChangedAndInvalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-invalid={mobileChangedAndInvalid}
                  />
                  {mobileChangedAndInvalid && (
                    <p className="text-[11px] sm:text-xs text-red-600 mt-1">
                      Enter a valid 10-digit number or leave it blank.
                    </p>
                  )}
                </div>

                {/* Password fields */}
                <div className="grid gap-1.5 sm:gap-2 min-w-0">
                  <Label htmlFor="newPassword" className="text-xs sm:text-sm">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      value={pwd.newPassword}
                      onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
                      placeholder="At least 8 chars, A-Z, a-z, 0-9"
                      autoComplete="new-password"
                      className={`pr-10 h-9 sm:h-10 text-sm sm:text-base w-full ${pwdMismatch ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      aria-invalid={pwdMismatch}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute inset-y-0 right-2 flex items-center"
                      aria-label={showNew ? "Hide new password" : "Show new password"}
                      title={showNew ? "Hide password" : "Show password"}
                    >
                      {showNew ? <Eye className="h-4 w-4 sm:h-5 sm:w-5" /> : <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-1.5 sm:gap-2 min-w-0">
                  <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={pwd.confirmPassword}
                      onChange={(e) => setPwd((p) => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      className={`pr-10 h-9 sm:h-10 text-sm sm:text-base w-full ${pwdMismatch ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      aria-invalid={pwdMismatch}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute inset-y-0 right-2 flex items-center"
                      aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                      title={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <Eye className="h-4 w-4 sm:h-5 sm:w-5" /> : <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                  </div>
                  {pwdMismatch && (
                    <p className="text-[11px] sm:text-xs text-red-600 mt-1">Passwords do not match</p>
                  )}
                </div>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col-reverse items-stretch gap-2 p-4 sm:p-6 sm:flex-row sm:justify-end sm:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!me) return;
                setForm({
                  firstName: me.firstName || "",
                  lastName: me.lastName || "",
                  email: me.email || "",
                  mobileNumber: me.mobileNumber || "",
                });
                setPwd({ newPassword: "", confirmPassword: "" });
                setShowNew(false);
                setShowConfirm(false);
              }}
              disabled={loading || saving}
              className="h-9 sm:h-10 text-sm sm:text-base w-full sm:w-auto"
            >
              Reset
            </Button>

            <Button
              onClick={onSaveAll}
              disabled={loading || saving || !canSubmit}
              className="h-9 sm:h-10 text-sm sm:text-base w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

      </main>
    </div>
  );
};

export default ProfilePage;
