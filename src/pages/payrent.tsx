// RentPaymentPage.tsx
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from "react-router-dom";
import {
  FaCreditCard,
  FaMoneyCheckAlt,
  FaHandHoldingUsd,
  FaHandshake,
  FaWallet,
  FaRegMoneyBillAlt,
  FaHome,
  FaSchool,
  FaBuilding,
  FaCalculator,
  FaDollarSign,
  FaMoneyBillWave,
  FaChartLine
} from 'react-icons/fa';
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  FaLock,
  FaTools,
  FaUserTie,
  FaUniversity,
  FaChalkboardTeacher
} from 'react-icons/fa';
import { useRef, useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ChevronDown } from "lucide-react";
import { MdBusinessCenter } from "react-icons/md";
import { GiTakeMyMoney } from "react-icons/gi";
import { IoArrowBack } from "react-icons/io5";
import { ClassNames } from "@emotion/react";

interface Transaction {
  id: string;
  date: string;
  paidTo: string;
  paymentType: string;
  amount: number;
  method: string;
  months: string[];
  status: 'Success' | 'Failed' | 'Pending';
  receiptUrl: string;
}
const phonePattern = /^\d{10}$/;

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.2, type: "spring", stiffness: 200, damping: 20 },
  }),
};

const RentPaymentPage = () => {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem('token'));
  // --- original states ---
  const [offers, setOffers] = useState<any[]>([]);
  const [categories, setCategories] = useState([
    { name: "House Rent", icon: <FaHome /> },
    { name: "Advance Money", icon: <FaHandHoldingUsd /> },
    { name: "Society Maintenance", icon: <FaBuilding /> },
    { name: "Society Deposit", icon: <FaMoneyCheckAlt /> },
    { name: "Office/Shop Rent", icon: <MdBusinessCenter /> },
    { name: "Brokerage ", icon: <FaHandshake /> },
    { name: "Office Security Deposit", icon: <FaSchool /> },
    { name: "Shop security deposit", icon: <FaCalculator /> },
  ]);

  const [payingTo, setPayingTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const today = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const getMonthLabel = (offset: number) =>
    monthNames[new Date(today.getFullYear(), today.getMonth() + offset).getMonth()];
  const [selectedMonth, setSelectedMonth] = useState<string>(getMonthLabel(0));

  // --- validation states added ---
  const [formData, setFormData] = useState({
    accountNumber: "",
    reAccountNumber: "",
    ifsc: "",
    phone: "",
    upiId: "",
    upiPhone: "",
  });

  // --- NEW: verification/payment flow states ---
  const [verifying, setVerifying] = useState<boolean>(false);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Simple API base
  const DEV_API_BASE = 'http://localhost:3001';
  const API_BASE =
    import.meta.env.DEV
      ? DEV_API_BASE
      : (import.meta.env.VITE_API_URL || window.location.origin);
  const API_BASE_CLEAN = API_BASE.replace(/\/$/, '');

  // Define explicit endpoints (no getApiUrl, no cleanPath)
  const VERIFY_VPA_URL = `${API_BASE_CLEAN}/api/payments/verify-vpa`;
  const VERIFY_BANK_URL = `${API_BASE_CLEAN}/api/payments/verify-bank`;
  const PROCESS_PAYMENT_URL = `${API_BASE_CLEAN}/api/payments/process-payment`;

  console.log('[PayRent] VERIFY_VPA_URL =', VERIFY_VPA_URL);
  console.log('[PayRent] VERIFY_BANK_URL =', VERIFY_BANK_URL);
  console.log('[PayRent] PROCESS_PAYMENT_URL =', PROCESS_PAYMENT_URL);

  const toggleMonth = (month: string) => {
    setSelectedMonths(prev =>
      prev.includes(month)
        ? prev.filter(m => m !== month)   // remove
        : [...prev, month]                // add
    );
  };

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [step2Errors, setStep2Errors] = useState<{ payingTo?: string; selectedCategory?: string; amount?: string }>({});

  // clear errors when form changes
  useEffect(() => {
    setFormErrors({});
    setStep2Errors({});
    setStep(1);
  }, [activeForm]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=3")
      .then((res) => res.json())
      .then((data) => setOffers(data));
  }, []);

  // --- UPDATED: verify step-1 inputs (calls backend) ---
  const handleVerify = async () => {
    if (!isAuthenticated) {
      alert("Please sign up or sign in");
      navigate("/auth/login");
      return;
    }

    setVerifyError(null);

    // Validation (same as before)
    const errs: { [key: string]: string } = {};
    if (activeForm === "Bank Transfer") {
      if (!formData.accountNumber.trim()) errs.accountNumber = "Account Number is required";
      if (!formData.reAccountNumber.trim()) errs.reAccountNumber = "Please re-enter Account Number";
      else if (formData.accountNumber !== formData.reAccountNumber)
        errs.reAccountNumber = "Account numbers must match";
      if (!formData.ifsc.trim()) errs.ifsc = "IFSC Code is required";
      if (!formData.phone) errs.phone = "Please enter your phone number.";
      else if (!phonePattern.test(formData.phone))
        errs.phone = "Please enter a valid 10-digit phone number.";
    }
    if (activeForm === "UPI Payments" || activeForm === "Payment via Credit Card") {
      if (!formData.upiId.trim()) errs.upiId = "UPI ID is required";
      if (!formData.upiPhone.trim()) {
        errs.upiPhone = "Phone Number is required";
      } else if (!phonePattern.test(formData.upiPhone)) {
        errs.upiPhone = "Please enter a valid 10-digit phone number";
      }
    }
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});

    // Call backend verification endpoints
    try {
      setVerifying(true);

      if (activeForm === "UPI Payments" || activeForm === "Payment via Credit Card") {
        setVerifyError(null);
        let res: Response;
        let data: any;

        try {
          res = await fetch(VERIFY_VPA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vpa: formData.upiId.trim() }),
          });
        } catch (err) {
          console.error('[PayRent] verify-vpa network error', err);
          setVerifyError('Network error during UPI verification. Please try again.');
          return;
        }

        const contentType = res.headers.get('Content-Type') || '';
        if (!contentType.includes('application/json')) {
          console.error('[PayRent] verify-vpa non-JSON response', res.status);
          setVerifyError(`Unexpected response from server (${res.status}).`);
          return;
        }

        try {
          data = await res.json();
        } catch (err) {
          console.error('[PayRent] verify-vpa JSON parse error', err);
          setVerifyError('Failed to parse verification response.');
          return;
        }

        if (!res.ok || !data?.gateway) {
          setVerifyError('UPI verification failed. Please try again.');
          return;
        }

        if (data.gateway.status === 'FAILURE') {
          setVerifyError('Invalid UPI ID, please try again.');
          return;
        }

        if (data.gateway.status === 'SUCCESS') {
          setVerifyError(null);
          setStep(2);
          return;
        }
      } else if (activeForm === "Bank Transfer") {
        setVerifyError(null);
        let res: Response;
        let data: any;

        try {
          res = await fetch(VERIFY_BANK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accountNumber: formData.accountNumber.trim(),
              ifsc: formData.ifsc.trim(),
            }),
          });
        } catch (err) {
          console.error('[PayRent] verify-bank network error', err);
          setVerifyError('Network error during bank verification. Please try again.');
          return;
        }

        const contentType = res.headers.get('Content-Type') || '';
        if (!contentType.includes('application/json')) {
          console.error('[PayRent] verify-bank non-JSON response', res.status);
          setVerifyError(`Unexpected response from server (${res.status}).`);
          return;
        }

        try {
          data = await res.json();
        } catch (err) {
          console.error('[PayRent] verify-bank JSON parse error', err);
          setVerifyError('Failed to parse bank verification response.');
          return;
        }

        if (!res.ok || (!data.ok && !data.success)) {
          const message =
            data?.message ||
            data?.error ||
            'Bank verification failed. Please check your details and try again.';
          setVerifyError(message);
          return;
        }

        setVerifyError(null);
        setStep(2);
      }
    } catch (error) {
      console.error('[PayRent] Verification error:', error);
      setVerifyError('Network error. Please check your connection and try again.');
    } finally {
      setVerifying(false);
    }
  };

  // --- UPDATED: final payment submit with backend integration ---
  const handlePaymentSubmit = async () => {
    const errs: typeof step2Errors = {};
    if (!payingTo.trim()) errs.payingTo = "Please enter name or organization";
    if (!selectedCategory) errs.selectedCategory = "Select a payment type";
    if (!amount.trim()) errs.amount = "Enter an amount";
    if (Object.keys(errs).length) {
      setStep2Errors(errs);
      return;
    }
    setStep2Errors({});

    try {
      setProcessingPayment(true);
      setVerifyError(null);

      // Get user info from localStorage if available
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      let res: Response;
      let data: any;

      try {
        res = await fetch(PROCESS_PAYMENT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount.trim(),
            paymentMethod: activeForm === 'UPI Payments' ? 'upi' : 'bank',
            vpa: formData.upiId?.trim() || undefined,
            accountNumber: formData.accountNumber?.trim() || undefined,
            ifsc: formData.ifsc?.trim() || undefined,
            name: user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`.trim()
              : user?.firstName || user?.lastName || payingTo.trim() || 'Customer',
            email: user?.email || 'noemail@example.com',
            mobile: activeForm === "UPI Payments"
              ? formData.upiPhone?.trim() || undefined
              : formData.phone?.trim() || undefined,
            payingTo: payingTo.trim(),
            paymentType: selectedCategory,
            selectedMonth: selectedMonth,
            months: selectedMonths,
            userId: user?.id || undefined,
          }),
        });
      } catch (err) {
        console.error('[PayRent] process-payment network error', err);
        setVerifyError('Network error during payment. Please try again.');
        return;
      }

      const contentType = res.headers.get('Content-Type') || '';

      if (!contentType.includes('application/json')) {
        console.error('[PayRent] process-payment non-JSON response', res.status);
        setVerifyError(`Unexpected response from server (${res.status}).`);
        return;
      }

      try {
        data = await res.json();
      } catch (err) {
        console.error('[PayRent] process-payment JSON parse error', err);
        setVerifyError('Failed to parse payment response.');
        return;
      }

      if (!res.ok || (!data.ok && !data.success)) {
        const message =
          data?.message ||
          data?.error ||
          'Payment processing failed. Please try again.';
        setVerifyError(message);

        // If a transaction id exists, send user to failure page to avoid dead-end
        if (data?.transactionId) {
          navigate(`/payment/failure?transactionId=${data.transactionId}`);
        }
        return;
      }

      // If gateway provided redirect, follow it (support multiple keys)
      const redirectUrl =
        data.redirectUrl ||
        data.gateway?.redirectUrl ||
        data.gateway?.paymentUrl ||
        data.gateway?.data?.url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      // Otherwise treat as success: save transaction locally (preserve existing UX)
      const newTransaction: Transaction = {
        id: data.transactionId || Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleString(),
        months: selectedMonths,
        paidTo: payingTo,
        paymentType: selectedCategory,
        amount: parseFloat(amount),
        method: activeForm || "Unknown",
        status: "Success",
        receiptUrl: data.receiptUrl || "#",
      };

      const existing = JSON.parse(localStorage.getItem("transactions") || "[]");
      localStorage.setItem("transactions", JSON.stringify([...existing, newTransaction]));

      // navigate to success page if server provided transactionId OR go back to UI (preserve old reset)
      if (data.transactionId) {
        navigate(`/payment/success?transactionId=${data.transactionId}`);
      } else {
        // reset local UI
        setStep(1);
        setActiveForm(null);
        setPayingTo("");
        setSelectedCategory("");
        setSelectedMonth(getMonthLabel(0));
        setAmount("");
        setFormData({
          accountNumber: "",
          reAccountNumber: "",
          ifsc: "",
          phone: "",
          upiId: "",
          upiPhone: "",
        });
      }
    } catch (error) {
      console.error('[PayRent] Payment processing error:', error);
      setVerifyError('An error occurred while processing your payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const paymentMethods = [
    {
      icon: <FaWallet className="h-5 w-6 mb-2 text-gray-700 dark:text-white" />,
      title: "UPI Payments",
      description: "Fast and easy payments with your favorite digital wallet.",
      bg: "bg-[#bdd6ff] dark:bg-[#2b6ef8]",
    },
    {
      icon: <FaRegMoneyBillAlt className="h-5 w-6 mb-2 text-gray-700 dark:text-white" />,
      title: "Bank Transfer",
      description: "Instant bank transfers with real-time confirmation and tracking.",
      bg: "bg-[#baf3dc] dark:bg-[#0b996c]",
    },
  ];

  const CardSection = () => {
    const cardsData: any[] = [];
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    useEffect(() => {
      const saved = JSON.parse(localStorage.getItem("transactions") || "[]");
      setTransactions(saved);
    }, []);

    return (
      <div className="flex flex-wrap justify-center gap-4">
        {cardsData.map((card, idx) => (
          <div
            key={idx}
            className="w-full sm:w-[45%] lg:w-[22%] p-6 rounded-xl shadow-lg border bg-white text-gray-900 dark:text-white dark:border-zinc-800/60 dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black "
          >
            {card.icon}
            <h6 className="text-sm font-semibold text-gray-900 dark:text-white">{card.heading}</h6>
            <p className="text-sm text-gray-600 dark:text-gray-300">{card.subHeading}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="overflow-x-hidden">
      <ThemeProvider defaultTheme="dark">
        <div className="min-h-screen flex flex-col w-full bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-900 dark:to-black text-black dark:text-white">
          <Navbar />
          <div className="min-h-screen">
            <style>
              {`@keyframes colorLoop{0%,100%{color:#60a5fa}50%{color:#34d399}}.animated-text{animation:colorLoop 2s infinite}`}
            </style>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
              <div className="w-full bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 pt-20 sm:pt-20 md:pt-24 pb-8 sm:pb-12 md:pb-24">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">

                    {/* Text Section - Always First */}
                    <div className="flex-1 text-center lg:text-left">
                      <h1 className="text-xl sm:text-3xl md:text-5xl font-bold leading-tight mb-3">
                        Empowering Digital Lives with<br />
                        <span className="animated-text font-bold">Smart Payments</span>
                      </h1>
                      <p className="text-gray-800 dark:text-gray-300 text-xs sm:text-sm md:text-base max-w-2xl mx-auto lg:mx-0 mb-5">
                        Instant payments, earn rewards, and skip the hassle of manual transactions.
                      </p>
                    </div>

                    {/* Image Section - Always Second */}
                    <div className="flex-1 flex justify-center">
                      <img
                        src="/smartpayment.png"
                        alt="Smart Payments Illustration"
                        className="w-40 sm:w-56 md:w-80 lg:w-[360px] h-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Options Section */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black duration-300">
              <div className="col-span-1 lg:col-span-8 flex justify-center mx-auto">
                <div className="w-full max-w-3xl pb-20">
                  {/* Left Column */}
                  <div className="w-full flex justify-center px-4">
                    <div className="w-full max-w-4xl mx-auto">
                      <div className="mb-6 text-center px-1 sm:px-2">
                        <h2 className="text-xl sm:text-3xl  lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          Pick Your Preferred Payment Mode
                        </h2>
                        <p className=" text-xs sm:text-sm md:text-base lg:text-md text-gray-600 dark:text-gray-300">
                          Explore our secure payment options for fast and hassle-free transactions.
                        </p>
                      </div>

                      {/* Payment Method Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-16 justify-center">
                        {paymentMethods.map((item, i) => (
                          <motion.div
                            key={i}
                            onClick={() => setActiveForm(item.title)}
                            className={`${item.bg} shadow-lg rounded-xl p-5 sm:p-6 text-gray-900 dark:text-white text-left cursor-pointer w-full lg:max-w-xl`}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            whileHover={{ scale: 1.05, boxShadow: "0px 8px 24px rgba(0,0,0,0.15)" }}
                            viewport={{ once: true }}
                            variants={cardVariants}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="flex flex-col items-start mb-3 sm:mb-4">
                              {item.icon}
                              <p className="text-sm sm:text-base font-bold whitespace-nowrap">{item.title}</p>
                            </div>
                            <p className="text-xs sm:text-sm mb-2 text-left">{item.description}</p>
                            <span
                              className="text-sm font-semibold hover:underline"
                              onClick={(e) => { e.stopPropagation(); setActiveForm(item.title); }}
                            >
                              Learn More →
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Modal for Verification & Details */}
                      {activeForm && (
                        <Modal
                          title={step === 1 ? `${activeForm} Verification` : "Payment Details"}
                          onClose={() => setActiveForm(null)}
                          onBack={() => setStep(1)}
                          showBack={step === 2}
                        >
                          {step === 1 ? (
                            <div className="space-y-3 sm:space-y-4">
                              {activeForm === "Bank Transfer" && (
                                <>
                                  <input
                                    className="w-full border p-2 rounded text-sm sm:text-base"
                                    placeholder="Account Number"
                                    value={formData.accountNumber}
                                    onChange={(e) =>
                                      setFormData({ ...formData, accountNumber: e.target.value })
                                    }
                                  />
                                  {formErrors.accountNumber && (
                                    <p className="text-red-500 text-xs sm:text-sm">{formErrors.accountNumber}</p>
                                  )}
                                  <input
                                    className="w-full border p-2 rounded text-sm sm:text-base"
                                    placeholder="Re-enter Account Number"
                                    value={formData.reAccountNumber}
                                    onChange={(e) =>
                                      setFormData({ ...formData, reAccountNumber: e.target.value })
                                    }
                                  />
                                  {formErrors.reAccountNumber && (
                                    <p className="text-red-500 text-xs sm:text-sm">{formErrors.reAccountNumber}</p>
                                  )}
                                  <input
                                    className="w-full border p-2 rounded text-sm sm:text-base"
                                    placeholder="IFSC Code"
                                    value={formData.ifsc}
                                    onChange={(e) =>
                                      setFormData({ ...formData, ifsc: e.target.value })
                                    }
                                  />
                                  {formErrors.ifsc && (
                                    <p className="text-red-500 text-xs sm:text-sm">{formErrors.ifsc}</p>
                                  )}
                                  <input
                                    id="phone"
                                    type="tel"
                                    className="w-full border p-2 rounded text-sm sm:text-base"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) =>
                                      setFormData({ ...formData, phone: e.target.value })
                                    }
                                  />
                                  {formErrors.phone && (
                                    <p className="text-red-500 text-xs sm:text-sm">{formErrors.phone}</p>
                                  )}
                                </>
                              )}

                              {(activeForm === "UPI Payments" || activeForm === "Payment via Credit Card") && (
                                <>
                                  <input
                                    className="w-full border p-2 rounded text-sm sm:text-base"
                                    placeholder="UPI ID"
                                    value={formData.upiId}
                                    onChange={(e) =>
                                      setFormData({ ...formData, upiId: e.target.value })
                                    }
                                  />
                                  {formErrors.upiId && (
                                    <p className="text-red-500 text-xs sm:text-sm">{formErrors.upiId}</p>
                                  )}
                                  <input
                                    id="phone"
                                    type="tel"
                                    className="w-full border p-2 rounded text-sm sm:text-base"
                                    placeholder="Phone Number"
                                    value={formData.upiPhone}
                                    onChange={(e) =>
                                      setFormData({ ...formData, upiPhone: e.target.value })
                                    }
                                  />
                                  {formErrors.upiPhone && (
                                    <p className="text-red-500 text-xs sm:text-sm">{formErrors.upiPhone}</p>
                                  )}
                                </>
                              )}

                              <button
                                className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleVerify}
                                disabled={verifying}
                              >
                                {verifying ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Verifying...</span>
                                  </>
                                ) : (
                                  'Verify & Continue'
                                )}
                              </button>
                              {verifyError && (
                                <p className="text-red-500 text-xs sm:text-sm mt-1">
                                  {verifyError}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[90vh] w-full max-w-md overflow-y-auto p-4 rounded">
                              <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="payingTo">
                                  Paying To
                                </label>
                                <input
                                  id="payingTo"
                                  value={payingTo}
                                  onChange={(e) => setPayingTo(e.target.value)}
                                  placeholder="Enter name or organization"
                                  className="w-full border p-2 rounded text-sm sm:text-base"
                                />
                                {step2Errors.payingTo && (
                                  <p className="text-red-500 text-xs sm:text-sm">{step2Errors.payingTo}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Payment Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {categories.map((cat, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => setSelectedCategory(cat.name)}
                                      className={`px-3 py-2 rounded-full border text-xs sm:text-sm font-medium ${selectedCategory === cat.name
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-gray-800 hover:bg-blue-100"
                                        }`}
                                    >
                                      {cat.name}
                                    </button>
                                  ))}
                                </div>
                                {step2Errors.selectedCategory && (
                                  <p className="text-red-500 text-xs sm:text-sm">{step2Errors.selectedCategory}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Paying For</label>
                                <div className="flex items-center gap-2">
                                  {[-1, 0, 1].map((offset) => {
                                    const month = getMonthLabel(offset);
                                    const isSelected = selectedMonths.includes(month);

                                    return (
                                      <button
                                        key={month}
                                        onClick={() => toggleMonth(month)}
                                        type="button"
                                        className={`px-3 py-2 rounded-full border text-xs sm:text-sm font-medium 
          ${isSelected ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-blue-100"}`}
                                      >
                                        {month}
                                      </button>
                                    );
                                  })}

                                  {/* Calendar Icon */}
                                  <button
                                    onClick={() => setShowMonthPicker(true)}
                                    className="p-2 rounded-full border bg-gray-100 hover:bg-gray-200"
                                  >
                                    <i className="fas fa-calendar"></i>
                                  </button>
                                </div>

                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="amount">
                                  Amount
                                </label>
                                <input
                                  id="amount"
                                  className="w-full border p-2 rounded text-sm sm:text-base"
                                  placeholder="Enter amount"
                                  type="number"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                />
                                {step2Errors.amount && (
                                  <p className="text-red-500 text-xs sm:text-sm">{step2Errors.amount}</p>
                                )}
                              </div>

                              <button
                                className="bg-green-600 text-white px-4 py-2 rounded w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handlePaymentSubmit}
                                disabled={processingPayment}
                              >
                                {processingPayment ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Processing Payment...</span>
                                  </>
                                ) : (
                                  'Make Payment'
                                )}
                              </button>
                              {verifyError && (
                                <p className="text-red-500 text-xs sm:text-sm mt-1">
                                  {verifyError}
                                </p>
                              )}
                            </div>
                          )}
                        </Modal>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Popular Payment Categories */}
              <div className="mb-16 px-4">
                <div className="text-center mb-6">
                  <h1 className="text-xl sm:text-3xl  font-bold">Popular Payment Categories</h1>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">
                    Easily manage and pay for different categories.
                  </p>
                </div>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-6">
                    {categories.map((category, index) => (
                      <a href="#card-section" key={index} className="block">
                        <li
                          className="flex flex-col items-center justify-center 
                     min-w-[140px] sm:min-w-0
                     p-4 sm:p-5 rounded-xl shadow-md 
                     bg-white hover:bg-blue-100 
                     dark:bg-transparent dark:hover:bg-transparent  
                     border border-transparent dark:border-zinc-800  
                     transition hover:scale-105 duration-300 cursor-pointer"
                        >
                          <div className="text-3xl sm:text-4xl text-blue-600 dark:text-blue-400 mb-2">
                            {category.icon}
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white text-center whitespace-nowrap truncate">
                            {category.name}
                          </span>
                        </li>
                      </a>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Why Choose Us */}
              <div className="mb-16 px-4 mt-10 lg:mt-24">
                <div className="text-center mb-10">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    Why Choose Us
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    We offer fast, secure, and reliable payment services.
                  </p>
                </div>

                <div className="bg-white dark:bg-black max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 rounded-xl shadow-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                    {/* Feature 1 */}
                    <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                      <div className="text-4xl sm:text-5xl text-blue-500">
                        <i className="fas fa-tachometer-alt"></i>
                      </div>
                      <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                        Fast Processing
                      </h4>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">
                        Instant payment confirmation
                      </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                      <div className="text-4xl sm:text-5xl text-blue-500">
                        <i className="fas fa-lock"></i>
                      </div>
                      <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                        Secure Payments
                      </h4>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">
                        Bank-grade security
                      </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                      <div className="text-4xl sm:text-5xl text-blue-500">
                        <i className="fas fa-headset"></i>
                      </div>
                      <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                        24/7 Support
                      </h4>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">
                        Always here to help
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Section */}
              <div id="card-section" className="scroll-mt-24 col-span-1 mt-10 mb-20 lg:mt-0  " >
                <div className="flex flex-col gap-4 lg:flex-row lg:gap-4 flex-wrap justify-center items-stretch ">
                  <CardSection />
                </div>
              </div>
              {showMonthPicker && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                  <div className="bg-white p-5 rounded-xl w-80 text-black relative">

                    <button
                      onClick={() => setShowMonthPicker(false)}
                      className="absolute top-3 right-3 text-xl text-black hover:text-red-600"
                    >
                      &times;
                    </button>
                    <h2 className="text-lg font-semibold mb-3 text-center">Select Months</h2>

                    <div className="grid grid-cols-3 gap-2">
                      {monthNames.map(month => {
                        const isSelected = selectedMonths.includes(month);

                        return (
                          <button
                            key={month}
                            onClick={() => toggleMonth(month)}
                            className={`py-2 rounded-lg border text-sm ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                              }`}
                          >
                            {month}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setShowMonthPicker(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <footer className="bg-background py-12 px-6 md:px-12 border-t border-border">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="md:col-span-2">
                    <img src="/newlogo.png" alt="DORPay Logo" className="w-16 h-16" />
                    <p className="text-muted-foreground max-w-md mb-6">
                      Discover the perfect property that matches your lifestyle and
                      preferences with our curated selection of premium DORPay.
                    </p>
                    <div className="flex space-x-4">
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Facebook</a>
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Instagram</a>
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Explore</h4>
                    <ul className="space-y-2">
                      <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Properties</a></li>
                      <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Agents</a></li>
                      <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Locations</a></li>
                      <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Contact</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>Rsoultek Consulting India Pvt Ltd,</li>
                      <li>CoWrks, RMZ Ecoworld, Ground Floor Bay Area, 6A, Devarabisanahalli,</li>
                      <li>Bengaluru, Karnataka, India- 560103</li>
                      <li><a href="mailto:support@dorpay.in" className="hover:text-foreground transition-colors">support@dorpay.in</a></li>
                      <li><a href="tel:+919844809969" className="hover:text-foreground transition-colors">+91 9844809969</a></li>
                    </ul>
                  </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border text-center sm:text-left sm:flex sm:justify-between sm:items-center">
                  <p className="text-muted-foreground text-sm">
                    © {new Date().getFullYear()} DORPay. All rights reserved.
                  </p>
                  <div className="mt-4 sm:mt-0 flex justify-center sm:justify-end space-x-6 text-sm">
                    <a href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
                    <a href="/TermsConditions" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Cookies Policy</a>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
};

const Modal = ({
  onClose,
  onBack,
  showBack = false,
  title,
  children,
}: {
  onClose: () => void;
  onBack?: () => void;
  showBack?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-black relative">
      {showBack && onBack && (
        <button
          onClick={onBack}
          className="absolute top-3 left-4 text-2xl text-black hover:text-blue-600"
        >
          <IoArrowBack />
        </button>
      )}
      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-2xl text-black hover:text-red-500"
      >
        &times;
      </button>
      <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>
      {children}
    </div>
  </div>
);

export default RentPaymentPage;
