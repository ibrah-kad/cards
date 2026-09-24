import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { AuthAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import PlayfulBlobs from "../components/PlayfulBlobs";
import { playPopSound } from "../utils/audio";
export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await AuthAPI.login(phone, password);
      login(data);
      toast.success(`Welcome back${data.role === "ADMIN" ? ", Admin" : ""}!`);
      if (from) {
        navigate(from, {
          replace: true,
        });
      } else if (data.role === "ADMIN") {
        navigate("/admin", {
          replace: true,
        });
      } else {
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-5 py-14">
      <PlayfulBlobs variant="subtle" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div
            whileHover={{
              scale: 1.1,
              rotate: [0, -10, 10, 0],
            }}
            className="w-14 h-14 rounded-3xl bg-marigold-100 flex items-center justify-center mx-auto mb-3 shadow-md text-marigold-700"
          >
            <Sparkles size={24} />
          </motion.div>
          <span className="label-eyebrow text-[10px] block mb-1">
            Welcome Back
          </span>
          <h1 className="font-display text-3xl font-bold text-ink">
            Log in to Jipate
          </h1>
          <p className="text-xs text-ink/60 mt-1">
            Access your event guest lists, dispatch reports &amp; check-in
            passes.
          </p>
        </div>

        <div className="glass-card p-7 sm:p-9 shadow-xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                Mobile Phone Number
              </label>
              <input
                className="clay-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="clay-input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    playPopSound(420);
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
              className="clay-btn-primary !w-full !py-3 text-xs font-bold mt-2 flex items-center justify-center gap-2"
            >
              <span>{submitting ? "Signing in..." : "Log in"}</span>
              <ArrowRight size={15} />
            </motion.button>
          </form>

          <div className="mt-5 pt-4 border-t border-ink/8 text-center text-xs text-ink/50">
            <span>
              Demo tip: Login with any phone to test client portal, or password
              "admin123" for Admin.
            </span>
          </div>
        </div>

        <p className="text-center text-xs font-semibold text-ink/60 mt-6">
          Planning a celebration?{" "}
          <Link to="/events" className="text-marigold-700 hover:underline">
            Create an invitation
          </Link>
        </p>
      </div>
    </div>
  );
}
