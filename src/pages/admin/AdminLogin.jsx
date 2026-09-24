import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Lock } from "lucide-react";
import { motion } from "motion/react";
import { AuthAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
export default function AdminLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await AuthAPI.adminLogin(phone, password);
      login(data);
      toast.success("Welcome, administrator!");
      navigate("/admin");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-5 py-12">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.94,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="w-full max-w-sm bg-white/95 rounded-[2.5rem] shadow-2xl p-8 backdrop-blur-xl border border-white"
      >
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-3xl bg-marigold-100 border border-marigold/30 flex items-center justify-center mx-auto mb-3 shadow-md text-marigold-700">
            <ShieldCheck size={28} />
          </div>
          <span className="label-eyebrow text-[10px] block mb-1">
            Administrative Access
          </span>
          <h1 className="font-display text-2xl font-bold text-ink">
            Admin Console
          </h1>
          <p className="text-xs text-ink/50 mt-1">
            Jipate Events Catalog &amp; Scanner Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
              Admin Phone / User
            </label>
            <input
              className="clay-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              className="clay-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="clay-btn-primary !w-full !py-3 text-xs font-bold mt-2 flex items-center justify-center gap-2"
          >
            <Lock size={15} />
            <span>{submitting ? "Verifying..." : "Enter Console"}</span>
          </button>
        </form>

        <p className="text-center text-xs text-ink/40 mt-6">
          <Link to="/" className="hover:underline">
            ← Return to Public Website
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
