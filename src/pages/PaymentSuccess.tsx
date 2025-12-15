import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ExternalLink, Home, RefreshCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const amount = searchParams.get("amount");
  const message =
    searchParams.get("message") || "Payment completed successfully.";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border border-emerald-100 shadow-lg rounded-2xl p-8">
          <div className="flex items-center gap-3 text-emerald-600">
            <CheckCircle className="h-10 w-10" />
            <h1 className="text-2xl font-semibold">Payment Successful</h1>
          </div>

          <p className="mt-4 text-slate-700">{message}</p>

          <div className="mt-6 grid gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Transaction ID</span>
              <span className="font-semibold text-slate-900">
                {transactionId || "Not provided"}
              </span>
            </div>
            {amount && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-semibold text-slate-900">₹{amount}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Status</span>
              <span className="font-semibold text-emerald-600">Success</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link to="/payrent">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Pay another rent
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/RentalTransaction">
                <ExternalLink className="h-4 w-4 mr-2" />
                View transactions
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Go home
              </Link>
            </Button>
          </div>

          <div className="mt-6 rounded-lg bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800">
            Keep your transaction ID for any support queries. A receipt will be
            sent to your registered email once it is available from the payment
            gateway.
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;

