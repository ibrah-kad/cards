import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <div className="w-14 h-14 rounded-3xl bg-marigold-100 flex items-center justify-center mx-auto mb-4 text-marigold shadow-md">
        <Sparkles size={24} />
      </div>
      <span className="label-eyebrow text-xs mb-1 block">404 Error</span>
      <h1 className="font-display text-3xl font-bold text-ink mb-2">
        Page Not Found
      </h1>
      <p className="text-xs text-ink/60 mb-6">
        This celebration card seems to have moved or does not exist.
      </p>
      <Link to="/" className="clay-btn-primary text-xs font-bold">
        Return Home
      </Link>
    </div>
  );
}
