import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { AuthAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { playPopSound } from "../utils/audio";
export default function VerifyOtp() {
  const [params] = useSearchParams();
  const phone = params.get("phone") || "";
  const flow = params.get("flow") || "login";
  const batchId = params.get("batchId");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const handleVerify = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await AuthAPI.verifyOtp(phone, code);
      login(data);
      if (data.requiresPasswordSetup) {
        const next =
          flow === "checkout" && batchId
            ? `/payment-success/${batchId}`
            : "/dashboard";
        navigate(`/set-password?next=${encodeURIComponent(next)}`);
        return;
      }
      if (flow === "checkout" && batchId) {
        toast.success("Verified! Payment prompt is on its way.");
        navigate(`/payment-success/${batchId}`);
      } else {
        toast.success("Welcome in!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleResend = async () => {
    setResending(true);
    try {
      await AuthAPI.requestOtp(phone);
      playPopSound(520);
      toast.success("Verification code re-sent via SMS!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };
  return (
    <div className="max-w-md mx-auto px-5 py-16 sm:py-24">
      <div className="glass-card p-8 sm:p-10 text-center">
        <div className="w-14 h-14 rounded-3xl bg-marigold-100 flex items-center justify-center mx-auto mb-4 text-marigold-700 shadow-md">
          <ShieldCheck size={28} />
        </div>

        <span className="label-eyebrow text-[10px] block mb-1">
          Security Check
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-2">
          Enter 6-Digit Code
        </h1>
        <p className="text-xs text-ink/65 mb-6">
          We sent a verification code via SMS to{" "}
          <strong className="text-ink">{phone}</strong>.
        </p>

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <input
            className="clay-input text-center tracking-[0.4em] font-mono text-xl font-bold"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="••••••"
            inputMode="numeric"
            maxLength={6}
            required
          />

          <motion.button
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.96,
            }}
            type="submit"
            disabled={submitting || code.length < 4}
            className="clay-btn-primary !w-full !py-3 text-xs font-bold mt-2"
          >
            {submitting ? "Verifying..." : "Verify & Continue"}
          </motion.button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-xs font-bold text-marigold-700 hover:text-marigold mt-5"
        >
          {resending ? "Sending..." : "Didn't get code? Resend SMS"}
        </button>

        <p className="text-[11px] text-ink/40 mt-5">
          Wrong number?{" "}
          <Link to="/login" className="underline font-semibold">
            Start over
          </Link>
        </p>
      </div>
    </div>
  );
}
