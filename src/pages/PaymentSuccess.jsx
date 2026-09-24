import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PartyPopper, ArrowRight, QrCode } from "lucide-react";
import { motion } from "motion/react";
import { InvitationAPI } from "../api/api";
import Loader from "../components/Loader";
import { fireCelebrationConfetti } from "../utils/confetti";
import { playPopSound } from "../utils/audio";
export default function PaymentSuccess() {
  const { batchId } = useParams();
  const [batch, setBatch] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fireCelebrationConfetti(0.5, 0.4);
    if (!batchId) return;
    InvitationAPI.getBatch(batchId)
      .then(setBatch)
      .catch((e) => setError(e.message));
  }, [batchId]);
  if (error) return <p className="text-center text-red-500 py-24">{error}</p>;
  if (!batch) return <Loader label="Confirming your transaction…" full />;
  return (
    <div className="max-w-lg mx-auto px-5 py-14 sm:py-20 text-center">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.9,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        className="glass-card p-8 sm:p-10"
      >
        <motion.div
          animate={{
            rotate: [0, -15, 15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 2,
          }}
          className="w-18 h-18 rounded-3xl bg-sage-100 border border-white flex items-center justify-center mx-auto mb-6 shadow-md text-sage-700"
        >
          <PartyPopper size={34} />
        </motion.div>

        <span className="label-eyebrow text-xs mb-1 block">
          Hongera! Confirmation
        </span>
        <h1 className="font-display text-3xl font-bold text-ink mb-2">
          Payment Initiated!
        </h1>
        <p className="text-xs sm:text-sm text-ink/70 mb-7 leading-relaxed">
          A Mobile Money prompt has been sent to{" "}
          <strong>{batch.payerPhone}</strong>. Enter your PIN to finish. Once
          confirmed, each guest receives their card via WhatsApp!
        </p>

        {/* Transaction Summary pill */}
        <div className="bg-sand-100/90 rounded-2xl p-4 mb-8 border border-white flex items-center justify-between text-left text-xs font-semibold">
          <div>
            <p className="text-[10px] text-ink/45 uppercase tracking-wider">
              Event Reference
            </p>
            <p className="font-mono text-sm font-bold text-marigold-700">
              {batch.reference}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-ink/45 uppercase tracking-wider">
              Total Paid
            </p>
            <p className="text-sm font-bold text-ink">
              {Number(batch.totalAmount).toLocaleString()} {batch.currency}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/dashboard" onClick={() => playPopSound(540)}>
            <motion.button
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.96,
              }}
              className="clay-btn-primary !w-full !py-3 text-xs font-bold flex items-center justify-center gap-2"
            >
              <span>Go to My Events Dashboard</span>
              <ArrowRight size={15} />
            </motion.button>
          </Link>

          <Link to="/scan" onClick={() => playPopSound(480)}>
            <button className="clay-btn-secondary !w-full !py-2.5 text-xs font-semibold flex items-center justify-center gap-2">
              <QrCode size={15} className="text-sage" />
              <span>Test Door Scanner</span>
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
