import { createContext, useContext, useState, useCallback } from "react";
import { XCircle, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { playPopSound } from "../utils/audio";
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);
  const push = useCallback(
    (message, type = "success") => {
      playPopSound(type === "error" ? 280 : 540);
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [
        ...t,
        {
          id,
          message,
          type,
        },
      ]);
      setTimeout(() => remove(id), 4200);
    },
    [remove],
  );
  const toast = {
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "info"),
  };
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 left-5 sm:left-auto z-[150] flex flex-col gap-2.5 sm:w-96 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{
                opacity: 0,
                y: 24,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 15,
                scale: 0.95,
              }}
              transition={{
                type: "spring",
                stiffness: 450,
                damping: 25,
              }}
              className={`pointer-events-auto glass-card flex items-start gap-3 p-4 rounded-2xl shadow-xl backdrop-blur-2xl border ${t.type === "error" ? "border-red-400/50 bg-white/85" : "border-marigold/40 bg-white/85"}`}
            >
              <div className="shrink-0 mt-0.5">
                {t.type === "error" ? (
                  <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                    <XCircle size={18} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-marigold-100 flex items-center justify-center text-marigold-700">
                    <Sparkles size={16} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-ink/45 mb-0.5">
                  {t.type === "error" ? "Notification" : "Success"}
                </p>
                <p className="text-sm font-semibold text-ink leading-snug">
                  {t.message}
                </p>
              </div>
              <button
                onClick={() => remove(t.id)}
                className="text-ink/40 hover:text-ink p-1 -mr-1 transition-colors rounded-lg"
              >
                <X size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
