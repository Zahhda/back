import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, Home, RefreshCcw, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const code = searchParams.get("code");
  const message =
    searchParams.get("message") ||
    "We could not complete your payment. Please try again.";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border border-rose-100 shadow-lg rounded-2xl p-8">
          <div className="flex items-center gap-3 text-rose-600">
            <XCircle className="h-10 w-10" />
            <h1 className="text-2xl font-semibold">Payment Failed</h1>
          </div>

          <p className="mt-4 text-slate-700">{message}</p>

          <div className="mt-6 grid gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Transaction ID</span>
              <span className="font-semibold text-slate-900">
                {transactionId || "Not provided"}
              </span>
            </div>
            {code && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Gateway code</span>
                <span className="font-semibold text-slate-900">{code}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4" />
              <span>
                If credentials are invalid or your server IP is not whitelisted,
                please update them in the payment gateway dashboard and retry.
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="bg-rose-600 hover:bg-rose-700">
              <Link to="/payrent">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Try payment again
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Go home
              </Link>
            </Button>
          </div>

          <div className="mt-6 rounded-lg bg-rose-50 border border-rose-100 p-4 text-sm text-rose-800">
            Keep this transaction ID handy when contacting support. No amount
            has been captured for failed attempts.
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentFailure;

