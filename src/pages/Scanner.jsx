import { useCallback, useEffect, useRef, useState } from "react";
import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Camera,
  CameraOff,
  Keyboard,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ScanAPI } from "../api/api";
import { playSuccessChime, playPopSound } from "../utils/audio";
import { fireCelebrationConfetti } from "../utils/confetti";
export default function Scanner() {
  const [mode, setMode] = useState("camera");
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const lockedRef = useRef(false);
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);
  const submitScan = useCallback(async (qrToken, checkInCode) => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await ScanAPI.scan(qrToken, checkInCode);
      setResult(res);
      playSuccessChime();
      fireCelebrationConfetti(0.5, 0.4);
    } catch (err) {
      setError(err.message);
      playPopSound(280);
    } finally {
      setLoading(false);
      setTimeout(() => {
        lockedRef.current = false;
      }, 2000);
    }
  }, []);
  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setCameraActive(false);
      const e = err;
      if (e?.name === "NotAllowedError") {
        setCameraError(
          "Camera permission denied. Allow camera access or use the Demo Scan button below.",
        );
      } else {
        setCameraError(
          "No webcam found on this device. You can test using the Demo Scan button below!",
        );
      }
    }
  }, []);
  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);
  const handleManualScan = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    lockedRef.current = false;
    const clean = code.trim().toUpperCase();
    await submitScan(null, clean);
    setCode("");
  };
  const handleSimulateDemoScan = () => {
    playPopSound(580);
    lockedRef.current = false;
    submitScan("JP7A9K", "JP7A9K");
  };
  return (
    <div className="max-w-md mx-auto px-5 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="w-16 h-16 rounded-3xl bg-marigold-100 border border-white flex items-center justify-center mx-auto mb-4 shadow-md text-marigold-700"
        >
          <ScanLine size={30} />
        </motion.div>
        <span className="label-eyebrow text-[10px] block mb-1">
          Live Door Usher Check-in
        </span>
        <h1 className="font-display text-3xl font-bold text-ink">
          Gate QR Scanner
        </h1>
        <p className="text-xs sm:text-sm text-ink/60 mt-1">
          Scan guest QR codes or enter 6-character backup passes.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-2 p-1.5 bg-sand-100/90 rounded-2xl border border-white mb-6">
        <button
          type="button"
          onClick={() => {
            playPopSound(460);
            setMode("camera");
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mode === "camera" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"}`}
        >
          <Camera size={14} /> Camera Scanner
        </button>

        <button
          type="button"
          onClick={() => {
            playPopSound(500);
            setMode("manual");
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mode === "manual" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"}`}
        >
          <Keyboard size={14} /> Type Pass Code
        </button>
      </div>

      {/* Camera Viewport with Reticle */}
      {mode === "camera" ? (
        <div className="glass-card p-4 overflow-hidden relative">
          <div className="relative rounded-2xl overflow-hidden bg-ink aspect-square flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />

            {cameraActive && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Aiming Reticle with Scan Laser */}
                <div className="w-2/3 aspect-square border-2 border-white/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] relative overflow-hidden">
                  <motion.div
                    animate={{
                      y: [0, 180, 0],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="h-1 w-full bg-gradient-to-r from-transparent via-marigold to-transparent"
                  />
                </div>
              </div>
            )}

            {cameraError && (
              <div className="p-6 text-center text-white/90 space-y-3 z-10">
                <CameraOff size={32} className="mx-auto text-white/60" />
                <p className="text-xs leading-relaxed">{cameraError}</p>
                <button
                  onClick={handleSimulateDemoScan}
                  className="clay-btn-primary !py-2 !px-4 text-xs font-bold"
                >
                  <Sparkles size={14} /> Run Demo Test Scan
                </button>
              </div>
            )}
          </div>

          {/* Quick Demo Simulator CTA */}
          <div className="mt-3 text-center">
            <button
              onClick={handleSimulateDemoScan}
              className="text-xs font-bold text-marigold-700 hover:text-marigold inline-flex items-center gap-1"
            >
              <Sparkles size={13} />
              <span>Tap to Simulate Guest Check-in (Instant Test)</span>
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleManualScan}
          className="glass-card p-6 flex flex-col gap-4"
        >
          <div>
            <label className="text-xs font-bold text-ink/75 block mb-1.5 uppercase tracking-wider">
              6-Character Guest Pass Code
            </label>
            <input
              className="clay-input font-mono text-center text-lg font-bold tracking-widest uppercase"
              placeholder="e.g. JP7A9K"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={12}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="clay-btn-primary !py-3 text-xs font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            <span>Validate &amp; Admit Guest</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateDemoScan}
            className="text-xs font-bold text-marigold-700 hover:text-marigold text-center"
          >
            Or tap here to test with sample code "JP7A9K"
          </button>
        </form>
      )}

      {/* Result feedback */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
            }}
            className="glass-card p-5 mt-5 border-l-4 border-l-red-500 flex items-start gap-3 bg-red-50/70"
          >
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={19} />
            <div>
              <p className="font-bold text-xs text-red-900">Check-in Error</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.92,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
            }}
            className={`glass-card p-6 mt-5 border-l-4 ${result.result === "ALREADY_SCANNED" ? "border-l-marigold bg-amber-50/70" : "border-l-sage bg-emerald-50/70"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2
                size={22}
                className={
                  result.result === "ALREADY_SCANNED"
                    ? "text-marigold"
                    : "text-sage-700"
                }
              />
              <h3 className="font-display font-bold text-lg text-ink">
                {result.result === "ALREADY_SCANNED"
                  ? "Already Checked In"
                  : "Welcome In! Admitted 🎉"}
              </h3>
            </div>

            <p className="text-sm font-bold text-ink">{result.guestName}</p>
            <p className="text-xs text-ink/65 font-medium">
              {result.invitationType === "DOUBLE"
                ? "Admits Two (Couple)"
                : "Single Entry Pass"}
            </p>

            {result.stats && (
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-ink/8 text-center text-xs">
                <div className="bg-white/80 rounded-xl p-2.5">
                  <p className="font-bold text-base text-ink">
                    {result.stats.checkedInAttendees}
                  </p>
                  <p className="text-[10px] text-ink/50 uppercase font-semibold">
                    Total Checked In
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-2.5">
                  <p className="font-bold text-base text-ink">
                    {result.stats.expectedAttendees}
                  </p>
                  <p className="text-[10px] text-ink/50 uppercase font-semibold">
                    Expected
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
