import React, { useEffect, useState } from 'react';
import { ThemeProvider } from "@/components/ThemeProvider";
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Tag,
    DollarSign,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    Building,
    IdCard,
} from 'lucide-react';

interface Transaction {
    id: string;
    date: string;
    paidTo: string;
    paymentType: string;
    amount: number;
    method: string;
    status: 'Success' | 'Failed' | 'Pending';
    receiptUrl: string;
    userEmail: string;
}

const ITEMS_PER_PAGE = 3;

const TransactionHistory: React.FC = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser
        ? (JSON.parse(storedUser) as { email: string; userType: string })
        : null;
    const isAdmin =
        currentUser?.userType === "admin" ||
        currentUser?.userType === "super_admin";

    const dummyData = [
        { id: 'TXN001', date: '2025-05-29 10:30 AM', paidTo: 'Dream Homes Pvt Ltd', paymentType: 'Rent', amount: 10000, method: 'UPI', status: 'Success', receiptUrl: '#' },
        { id: 'TXN002', date: '2025-05-28 02:15 PM', paidTo: 'BESCOM', paymentType: 'Electricity', amount: 1200, method: 'Card', status: 'Failed', receiptUrl: '#' },
        { id: 'TXN003', date: '2025-05-27 09:45 AM', paidTo: 'Water Board', paymentType: 'Water Bill', amount: 800, method: 'Net Banking', status: 'Pending', receiptUrl: '#' },
    ] as Omit<Transaction, 'userEmail'>[];

    useEffect(() => {
        const stored = localStorage.getItem("transactions");
        let allTxns: Transaction[];

        if (stored) {
            try { allTxns = JSON.parse(stored); } catch { allTxns = []; }
        } else {
            allTxns = dummyData.map(txn => ({ ...txn, userEmail: currentUser?.email ?? "unknown" }));
        }

        if (currentUser) {
            allTxns = allTxns.map(txn => ({ ...txn, userEmail: txn.userEmail || currentUser.email }));
        }
        localStorage.setItem("transactions", JSON.stringify(allTxns));

        const filtered = isAdmin ? allTxns : allTxns.filter(txn => txn.userEmail === currentUser?.email);
        setTransactions(filtered);
        setLoading(false);
    }, [currentUser, isAdmin]);

    const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentTxns = transactions.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <ThemeProvider defaultTheme="dark">
            <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
                <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-10">
                    <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8 text-gray-800 dark:text-gray-100">
                        <FileText className="inline mr-2 text-indigo-500" size={20} />
                        Rental Transaction History
                    </h1>

                    {loading ? (
                        <div className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400">Loading...</div>
                    ) : currentTxns.length === 0 ? (
                        <div className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400">No transactions found.</div>
                    ) : (
                        <>
                            {/* Cards grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {currentTxns.map((txn) => (
                                    <div
                                        key={txn.id}
                                        className="bg-white dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black rounded-xl shadow-lg hover:shadow-2xl transition p-4 sm:p-6 flex flex-col justify-between"
                                    >
                                        {/* Header: Paid to */}
                                        <div className="mb-3 sm:mb-4 flex items-center">
                                            <Tag className="mr-2 text-gray-500 dark:text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:text-base">
                                                <span className="text-xs sm:text-sm">Paid to:</span>{" "}
                                                <span className="text-xs sm:text-sm md:text-base text-indigo-600 dark:text-indigo-400">{txn.paidTo}</span>
                                            </h3>
                                        </div>

                                        {/* Date */}
                                        <div className="mb-3 sm:mb-4 flex items-center text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
                                            <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                            {txn.date}
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
                                            <div className="flex items-center">
                                                <IdCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                <span>
                                                    <span className="font-medium">ID:</span>{" "}
                                                    <span className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm md:text-base">{txn.id}</span>
                                                </span>
                                            </div>

                                            <div className="flex items-center">
                                                <Building className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                <span>
                                                    <span className="font-medium">Type:</span>{" "}
                                                    <span className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm md:text-base">{txn.paymentType}</span>
                                                </span>
                                            </div>

                                            <div className="flex items-center">
                                                <DollarSign className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                <span>
                                                    <span className="font-medium">Amount:</span>{" "}
                                                    <span className="text-green-600 dark:text-green-400">₹{txn.amount}</span>
                                                </span>
                                            </div>

                                            <div className="flex items-center">
                                                <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                <span>
                                                    <span className="font-medium">Method:</span>{" "}
                                                    <span className="text-indigo-600 dark:text-indigo-400">{txn.method}</span>
                                                </span>
                                            </div>

                                            <div className="flex items-center">
                                                {txn.status === "Success" ? (
                                                    <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                                ) : txn.status === "Failed" ? (
                                                    <XCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                                                ) : (
                                                    <Clock className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                                                )}
                                                <span>
                                                    <span className="font-medium">Status:</span>{" "}
                                                    <span
                                                        className={`inline-block px-2 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold text-white ${txn.status === "Success"
                                                                ? "bg-green-600"
                                                                : txn.status === "Failed"
                                                                    ? "bg-red-600"
                                                                    : "bg-yellow-500"
                                                            }`}
                                                    >
                                                        {txn.status}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                                            <a
                                                href={txn.receiptUrl}
                                                className="flex items-center text-indigo-600 dark:text-indigo-400 underline text-xs sm:text-sm md:text-base "
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FileText className="mr-1 h-4 w-4 sm:h-5 sm:w-5" /> View Receipt
                                            </a>
                                            {isAdmin && (
                                                <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">{txn.userEmail}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-1 sm:gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-2 sm:px-3 py-1 rounded border border-gray-400 dark:border-gray-600
                       bg-white dark:bg-gray-800 text-xs sm:text-sm md:text-base
                       text-gray-700 dark:text-gray-300 disabled:opacity-50"
                                >
                                    Prev
                                </button>

                                {Array.from({ length: totalPages }, (_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => goToPage(idx + 1)}
                                        className={`px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm ${currentPage === idx + 1
                                                ? "dark:bg-white dark:text-black bg-black text-white"
                                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-2 sm:px-3 py-1 rounded border border-gray-400 dark:border-gray-600
                       bg-white dark:bg-gray-800 text-xs sm:text-sm md:text-base
                       text-gray-700 dark:text-gray-300 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* CTA section */}
                <section
                    className="
      relative w-full h-56 sm:h-64
      overflow-hidden mb-8 sm:mb-12
      mx-3 sm:mx-12
      bg-gradient-to-r from-gray-800/90 via-gray-900/90 to-gray-800/90
      dark:bg-gradient-to-r dark:from-black/80 dark:via-gray-800/80 dark:to-gray-700/80
      p-5 sm:p-8
      flex flex-col justify-center items-center text-center
      left-0 sm:-left-12
    "
                >
                    <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                        <svg className="absolute right-0 top-0 h-full w-full" viewBox="0 0 80 80" preserveAspectRatio="none">
                            <circle cx="0" cy="0" r="80" fill="white" fillOpacity="0.1" />
                            <circle cx="80" cy="0" r="40" fill="white" fillOpacity="0.1" />
                            <circle cx="80" cy="80" r="60" fill="white" fillOpacity="0.1" />
                            <circle cx="0" cy="80" r="40" fill="white" fillOpacity="0.1" />
                        </svg>
                    </div>

                    <h2 className="relative z-10 text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2 text-white dark:text-gray-100">
                        Ready to Make a New Payment?
                    </h2>
                    <p className="relative z-10 text-xs sm:text-sm md:text-bases  mb-4 sm:mb-6 text-white/90 dark:text-gray-300">
                        Stay on top of your bills and rent with quick, easy payments.
                    </p>

                    <button
                        onClick={() => navigate("/payrent")}
                        className="
        relative z-10 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold
        bg-black text-white hover:bg-gray-800
        dark:bg-white dark:text-black dark:hover:bg-gray-100
        transition text-xs sm:text-sm md:text-base
      "
                    >
                        Make a Payment
                    </button>
                </section>
            </div>

        </ThemeProvider>
    );
};

export default TransactionHistory;
