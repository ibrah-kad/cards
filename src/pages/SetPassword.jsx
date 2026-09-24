import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { motion } from "motion/react";
import { AuthAPI } from "../api/api";
import { useToast } from "../context/ToastContext";
export default function SetPassword() {
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await AuthAPI.setPassword(password, confirm);
      toast.success("Password set successfully! You're ready.");
      navigate(next);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="max-w-md mx-auto px-5 py-16 sm:py-24">
      <div className="glass-card p-8 sm:p-10 text-center">
        <div className="w-14 h-14 rounded-3xl bg-marigold-100 flex items-center justify-center mx-auto mb-4 text-marigold-700 shadow-md">
          <Lock size={26} />
        </div>

        <span className="label-eyebrow text-[10px] block mb-1">
          Account Security
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-2">
          Create a Password
        </h1>
        <p className="text-xs text-ink/60 mb-6">
          Set a secure password so you can return to manage your event
          invitations anytime.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
              New Password
            </label>
            <input
              type="password"
              className="clay-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              className="clay-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
              placeholder="••••••••"
              required
            />
          </div>

          <motion.button
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.96,
            }}
            type="submit"
            disabled={submitting}
            className="clay-btn-primary !w-full !py-3 text-xs font-bold mt-2"
          >
            {submitting ? "Saving..." : "Save Password & Proceed"}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
