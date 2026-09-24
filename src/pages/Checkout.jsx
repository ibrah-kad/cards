import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Smartphone, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { InvitationAPI } from "../api/api";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { playPopSound } from "../utils/audio";
import { fireCelebrationConfetti } from "../utils/confetti";
export default function Checkout() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [batch, setBatch] = useState(null);
  const [error, setError] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [usePayerForLogin, setUsePayerForLogin] = useState(true);
  const [loginPhone, setLoginPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [network, setNetwork] = useState("mpesa");
  useEffect(() => {
    if (!batchId) return;
    InvitationAPI.getBatch(batchId)
      .then((b) => {
        setBatch(b);
        setPayerPhone(b.ownerPhone || "");
      })
      .catch((e) => setError(e.message));
  }, [batchId]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batchId) return;
    const cleanPayerPhone = payerPhone.replace(/\s+/g, "");
    const cleanLoginPhone = usePayerForLogin
      ? cleanPayerPhone
      : loginPhone.replace(/\s+/g, "");
    setSubmitting(true);
    try {
      await InvitationAPI.checkout(batchId, {
        payerPhone: cleanPayerPhone,
        usePayerForLogin,
        loginPhone: cleanLoginPhone,
      });
      fireCelebrationConfetti(0.5, 0.5);
      toast.success("Payment prompt initiated! Check your phone.");
      setTimeout(() => {
        navigate(`/payment-success/${batchId}`);
      }, 800);
    } catch (err) {
      toast.error(err.message || "Payment initiation failed.");
    } finally {
      setSubmitting(false);
    }
  };
  if (error) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/events" className="clay-btn-secondary">
          Back to Occasions
        </Link>
      </div>
    );
  }
  if (!batch) return <Loader label="Loading your event checkout…" full />;
  return (
    <div className="max-w-lg mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <Link
        to="/events"
        onClick={() => playPopSound(420)}
        className="inline-flex items-center gap-2 text-xs font-bold text-ink/60 hover:text-ink mb-6"
      >
        <ArrowLeft size={15} /> Back to Occasions
      </Link>

      <div className="glass-card p-7 sm:p-9">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="label-eyebrow text-[10px]">
            Reference #{batch.reference}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-sage/15 text-sage-700 font-bold text-[10px]">
            Ready to Dispatach
          </span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-1">
          {batch.eventName}
        </h1>
        <p className="text-xs sm:text-sm text-ink/60 mb-6">
          {batch.bundleName}
        </p>

        {/* Total Price Card */}
        <div className="bg-sand-100/90 rounded-2xl p-5 mb-7 flex items-center justify-between border border-white">
          <div>
            <span className="text-xs font-bold text-ink/50 uppercase tracking-wider block">
              Total Amount
            </span>
            <span className="text-xs text-ink/40">Secure Mobile Money</span>
          </div>
          <span className="font-display text-2xl sm:text-3xl font-bold text-marigold-700">
            {Number(batch.totalAmount || 0).toLocaleString()} {batch.currency}
          </span>
        </div>

        {/* Network Selector Tabs */}
        <div className="mb-6">
          <label className="text-xs font-bold text-ink/70 block mb-2 uppercase tracking-wider">
            Mobile Money Provider
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                id: "mpesa",
                name: "M-Pesa",
                color: "text-red-600",
              },
              {
                id: "tigopesa",
                name: "Tigo Pesa",
                color: "text-blue-600",
              },
              {
                id: "airtel",
                name: "Airtel",
                color: "text-red-500",
              },
              {
                id: "halo",
                name: "Halopesa",
                color: "text-orange-500",
              },
            ].map((prov) => (
              <button
                key={prov.id}
                type="button"
                onClick={() => {
                  playPopSound(480);
                  setNetwork(prov.id);
                }}
                className={`p-2.5 rounded-xl text-center text-xs font-bold border transition-all ${network === prov.id ? "border-marigold bg-marigold-50 shadow-sm ring-2 ring-marigold/20 text-marigold-800" : "border-ink/10 bg-white/60 text-ink/70 hover:bg-white"}`}
              >
                {prov.name}
              </button>
            ))}
          </div>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-ink/75 mb-1.5 block uppercase tracking-wider">
              Phone Number to Pay From *
            </label>
            <div className="relative">
              <input
                className="clay-input pl-10"
                value={payerPhone}
                onChange={(e) => setPayerPhone(e.target.value)}
                placeholder="0712 345 678"
                required
              />
              <Smartphone
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
              />
            </div>
            <p className="text-[11px] text-ink/45 mt-1">
              You will receive an instant push prompt on your mobile screen to
              enter your PIN.
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-ink/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={usePayerForLogin}
              onChange={(e) => setUsePayerForLogin(e.target.checked)}
              className="accent-marigold w-4 h-4 rounded"
            />
            <span>Use this number to log into my Jipate Dashboard</span>
          </label>

          {!usePayerForLogin && (
            <div>
              <label className="text-xs font-bold text-ink/75 mb-1.5 block uppercase tracking-wider">
                Dashboard Mobile Number
              </label>
              <input
                className="clay-input"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="0712 345 678"
                required
              />
            </div>
          )}

          <motion.button
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.97,
            }}
            type="submit"
            disabled={submitting}
            className="clay-btn-primary !w-full !py-3.5 text-sm font-bold mt-3 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Requesting Push Prompt...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>
                  Pay {Number(batch.totalAmount || 0).toLocaleString()}{" "}
                  {batch.currency}
                </span>
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
