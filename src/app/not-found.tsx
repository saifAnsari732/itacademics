import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-grow flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-700">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-navy-950">Page Not Found</h1>
        <p className="text-sm text-slate-500">
          The page or grievance record you are looking for does not exist or has been moved.
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
