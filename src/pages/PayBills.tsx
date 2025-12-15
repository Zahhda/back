import React, { useState, useEffect, useRef } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { X, ChevronUp, ChevronDown, ArrowUp, LucideIcon, Smartphone, Battery, Tv, PhoneCall, BookOpen, Banknote, Flame, Shield, Droplet, Building2, Landmark } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ServiceItem { icon: LucideIcon; name: string; }

const faqs = [
    { question: "Is my payment secure?", answer: "Absolutely. We use industry-standard encryption and secure payment gateways." },
    { question: "Do I need to sign up?", answer: "Yes, creating an account helps us offer a personalized experience and better support." },
    { question: "What services can I pay for?", answer: "You can pay for electricity, water, rent, internet, phone bills, and other utility services." },
    { question: "Can I track my past transactions?", answer: "Yes, you can view all your past transactions in your account dashboard anytime." },
];

const services: ServiceItem[] = [
    { icon: Smartphone, name: "Mobile Recharge" },
    { icon: Battery, name: "Electricity Bill" },
    { icon: Tv, name: "DTH Recharge" },
    { icon: PhoneCall, name: "Landline" },
    { icon: BookOpen, name: "Tution Fee" },
    { icon: Banknote, name: "Loan Repayment" },
    { icon: Flame, name: "Gas Booking" },
    { icon: Shield, name: "Insurance" },
    { icon: Droplet, name: "Water Bill" },
    { icon: Building2, name: "Municipal Bill" },
    { icon: Landmark, name: "Loan EMI" },
    { icon: Banknote, name: "Traffic Challan" },
];

const stateCityData = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat", "Roing"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"],
    "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Raigarh"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Hisar"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
    "Karnataka": ["Bengaluru", "Mysuru", "Mangalore", "Hubballi", "Belagavi"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
    "Manipur": ["Imphal", "Thoubal", "Churachandpur", "Bishnupur", "Ukhrul"],
    "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh", "Baghmara"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Puri"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
    "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Ambassa"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "Rishikesh", "Roorkee"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
    "Andaman and Nicobar Islands": ["Port Blair", "Havelock Island", "Diglipur"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
    "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket", "Lajpat Nagar"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
    "Ladakh": ["Leh", "Kargil"],
    "Lakshadweep": ["Kavaratti", "Agatti"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
};
const statesWithCities: Record<string, string[]> = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Kurnool", "Rajahmundry", "Kadapa"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Pasighat", "Ziro"],
    "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Tezpur", "Jorhat"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Durg"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
    "Haryana": ["Chandigarh", "Gurugram", "Faridabad", "Panipat", "Karnal"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Mandi"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City"],
    "Karnataka": ["Bangalore", "Mysore", "Mangalore", "Hubli", "Belgaum"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Alappuzha"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    "Manipur": ["Imphal", "Thoubal", "Churachandpur"],
    "Meghalaya": ["Shillong", "Tura", "Nongstoin"],
    "Mizoram": ["Aizawl", "Lunglei"],
    "Nagaland": ["Kohima", "Dimapur"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Sambalpur"],
    "Punjab": ["Chandigarh", "Amritsar", "Ludhiana", "Jalandhar", "Patiala"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
    "Sikkim": ["Gangtok", "Namchi"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
    "Tripura": ["Agartala", "Udaipur"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Meerut", "Noida"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Nainital"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
    "Union Territory - Andaman and Nicobar Islands": ["Port Blair"],
    "Union Territory - Chandigarh": ["Chandigarh"],
    "Union Territory - Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Silvassa"],
    "Union Territory - Delhi": ["New Delhi", "Delhi"],
    "Union Territory - Jammu and Kashmir": ["Srinagar", "Jammu"],
    "Union Territory - Ladakh": ["Leh", "Kargil"],
    "Union Territory - Lakshadweep": ["Kavaratti"],
    "Union Territory - Puducherry": ["Pondicherry", "Karaikal", "Mahe"]
};
const electricityBoardsByState = {
    "Andhra Pradesh": [{ label: "APEPDCL", value: "apepdcl" }, { label: "APSERC", value: "apserc" }],
    "Arunachal Pradesh": [{ label: "APDCL", value: "apdcl" }],
    "Assam": [{ label: "APDCL", value: "apdcl_assam" }],
    "Bihar": [{ label: "BSEB", value: "bseb" }],
    "Chhattisgarh": [{ label: "CSPDCL", value: "cspdcl" }, { label: "CSEB", value: "cseb" }],
    "Delhi": [{ label: "BRPL", value: "brpl" }, { label: "BYPL", value: "bypl" }, { label: "TPDDL", value: "tpddl" }],
    "Goa": [{ label: "GEDA", value: "geda" }],
    "Gujarat": [{ label: "GETCO", value: "getco" }, { label: "UGVCL", value: "ugvcl" }, { label: "DGVCL", value: "dgvcl" }, { label: "PGVCL", value: "pgvcl" }, { label: "MGVCL", value: "mgvcl" }],
    "Haryana": [{ label: "UHBVN", value: "uhbvn" }, { label: "DHBVN", value: "dhbvn" }],
    "Himachal Pradesh": [{ label: "HPSEBL", value: "hpsebl" }],
    "Jammu & Kashmir": [{ label: "JKPDD", value: "jkpdd" }],
    "Jharkhand": [{ label: "JSEB", value: "jseb" }],
    "Karnataka": [{ label: "BESCOM", value: "bescom" }, { label: "MESCOM", value: "mescom" }, { label: "HESCOM", value: "hescom" }, { label: "GESCOM", value: "gescom" }, { label: "CESC Mysore", value: "cesc_mysore" }],
    "Kerala": [{ label: "KSEB", value: "kseb" }],
    "Madhya Pradesh": [{ label: "MPPKVVCL", value: "mppkvvcl" }, { label: "MPMKVVCL", value: "mpmkvvcl" }, { label: "MPPKVNCL", value: "mppkvncl" }],
    "Maharashtra": [{ label: "MSEB", value: "mseb" }, { label: "Reliance Energy", value: "reliance_energy" }, { label: "Tata Power", value: "tata_power" }],
    "Manipur": [{ label: "MSPDCL", value: "mspdcl" }],
    "Meghalaya": [{ label: "MePDCL", value: "mepdcl" }],
    "Mizoram": [{ label: "MZPDD", value: "mzpdd" }],
    "Nagaland": [{ label: "NEEPCO", value: "neepco" }],
    "Odisha": [{ label: "CESU", value: "cesu" }, { label: "NESCO", value: "nesco" }, { label: "WESCO", value: "wesco" }, { label: "SOUTHCO", value: "southco" }],
    "Punjab": [{ label: "PSPCL", value: "pspcl" }],
    "Rajasthan": [{ label: "JVVNL", value: "jvvnl" }, { label: "AVVNL", value: "avvnl" }, { label: "JdVVNL", value: "jdvvnl" }],
    "Sikkim": [{ label: "SEDC", value: "sedc" }],
    "Tamil Nadu": [{ label: "TANGEDCO", value: "tangedco" }],
    "Telangana": [{ label: "TSSPDCL", value: "tsspdcl" }, { label: "TSNPDCL", value: "tsnpdcl" }],
    "Tripura": [{ label: "TSECL", value: "tsecl" }],
    "Uttar Pradesh": [{ label: "DVVNL", value: "dvvnl" }, { label: "MVVNL", value: "mvvnl" }, { label: "PVVNL", value: "pvvnl" }, { label: "UPPCL", value: "uppcl" }],
    "Uttarakhand": [{ label: "PDD Uttarakhand", value: "pdd_uttarakhand" }],
    "West Bengal": [{ label: "WBSEDCL", value: "wbsedcl" }],
};
const citiesByState: Record<string, string[]> = {
    "Andhra Pradesh": ["Vijayawada", "Visakhapatnam", "Guntur"], "Karnataka": ["Bengaluru", "Mysuru", "Mangalore"], "Maharashtra": ["Mumbai", "Pune", "Nagpur"], "Delhi": ["New Delhi", "South Delhi", "North Delhi"]
};

const landlineOperators = [
    { label: "Airtel Landline", value: "airtel" }, { label: "BSNL Landline", value: "bsnl" }, { label: "MTNL Delhi", value: "mtnl_delhi" }, { label: "MTNL Mumbai", value: "mtnl_mumbai" }, { label: "Tata Teleservices", value: "tata" }, { label: "Reliance Communications", value: "reliance" },
];

const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
       <section className="py-12 md:py-16 px-4 sm:px-6 max-w-4xl mx-auto">
  <h2 className="text-2xl sm:text-3xl md:text-3xl font-semibold mb-6 md:mb-8 text-center">FAQs</h2>

  {faqs.map((faq, index) => (
    <div key={index} className="border-b py-3 md:py-4">
      <button
        type="button"
        onClick={() => toggleFAQ(index)}
        className="w-full flex justify-between items-center text-left gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 rounded md:rounded-none"
        aria-expanded={openIndex === index}
        aria-controls={`faq-panel-${index}`}
      >
        <h4 className="text-base sm:text-lg md:text-lg font-medium">{faq.question}</h4>
        <span className="shrink-0">
          {openIndex === index ? <ChevronUp size={20} className="sm:size-6" /> : <ChevronDown size={20} className="sm:size-6" />}
        </span>
      </button>

      {openIndex === index && (
        <p
          id={`faq-panel-${index}`}
          className="mt-2 text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed"
        >
          {faq.answer}
        </p>
      )}
    </div>
  ))}
</section>

    );
};

const serviceFieldsMap: Record<
    string,
    {
        label: string;
        name: string;
        type: string;
        placeholder?: string;
        pattern?: string;
        required?: boolean
        options?: { label: string; value: string }[];
    }[]
> = {
    "Mobile Recharge": [
        {
            label: "", name: "rechargeType", type: "radio",
            options: [
                { label: "Prepaid", value: "prepaid" },
                { label: "Postpaid", value: "postpaid" }
            ]
        },
        { label: "Mobile Number", name: "mobileNumber", type: "tel", placeholder: "Enter mobile number", pattern: "[0-9]{10}", },
        {
            label: "Operator", name: "operator", type: "select",
            options: [
                { label: "Airtel", value: "airtel" },
                { label: "BSNL", value: "bsnl" },
                { label: "Jio", value: "jio" },
                { label: "MTNL", value: "mtnl" },
                { label: "Vi", value: "vi" }
            ]
        },
        { label: "Amount", name: "amount", type: "number", placeholder: "Enter amount" }
    ],

    "Electricity Bill": [

        { label: "Consumer Number", name: "consumerNumber", type: "text", placeholder: "Enter consumer number" },
        { label: "Amount", name: "amount", type: "number", placeholder: "Enter amount" },
    ],

    "DTH Recharge": [
        {
            label: "Operator",
            name: "operator",
            type: "select",
            placeholder: "Select operator",
            options: [
                { label: "TATA Play", value: "tata_play" },
                { label: "Airtel Digital TV", value: "airtel_digital_tv" },
                { label: "Sun Direct", value: "sun_direct" },
                { label: "Dish TV", value: "dish_tv" },
                { label: "d2h", value: "d2h" },
            ],
        },
        { label: "Subscriber ID / Mobile Number", name: "subscriberId", type: "text", placeholder: "Enter subscriber ID or mobile number" },
        { label: "Amount", name: "amount", type: "number", placeholder: "Enter amount" },
    ],


    Landline: [
        { label: "Operator", name: "operator", type: "select", placeholder: "Select Operator", options: landlineOperators, },
        { label: "Landline Number", name: "landlineNumber", type: "text", placeholder: "Enter landline number", },
        { label: "Amount", name: "amount", type: "number", placeholder: "Enter amount", },
    ],

    "Tution Fee": [
        { label: "Student ID", name: "studentId", type: "text", placeholder: "Enter student ID" },


        {
            label: "State",
            name: "state",
            type: "select",
            options: Object.keys(statesWithCities).map((state) => ({
                label: state,
                value: state,
            })),
        },

        {
            label: "City",
            name: "city",
            type: "select",

            options: [],
        },

        { label: "Institution Name", name: "institutionName", type: "text", placeholder: "Enter institution name" },
        // { label: "UPI ID", name: "upiid", type: "text", placeholder: "Enter Your UPI ID" },
        { label: "Amount", name: "amount", type: "number", placeholder: "Enter amount" },
    ],
    "Loan Repayment": [
        {
            label: "Lender", name: "lender", type: "select", placeholder: "Select a lender",
            options: [
                { label: "DMI Finance Private Limited EMI payment", value: "DMI Finance Private Limited" },
                { label: "Bajaj Finance Limited EMI payment", value: "Bajaj Finance Limited" },
                { label: "Muthoot Finance EMI payment", value: "Muthoot Finance" },
                { label: "TVS Credit Services Limited EMI payment", value: "TVS Credit Services Limited" },
                { label: "Ujjivan Small Finance Bank EMI payment", value: "Ujjivan Small Finance Bank" },
                { label: "HDFC Bank Retail Assets EMI payment", value: "HDFC Bank Retail Assets" },
                { label: "HDB Financial Services EMI payment", value: "HDB Financial Services" },
                { label: "Home Credit India Finance Pvt. Ltd EMI payment", value: "Home Credit India Finance Pvt. Ltd" },
                { label: "Muthoot Fincorp Ltd EMI payment", value: "Muthoot Fincorp Ltd" },
                { label: "121 Finance Private Limited EMI payment", value: "121 Finance Private Limited" },
                { label: "Truhome Finance LTD EMI payment", value: "Truhome Finance LTD" },
                { label: "Mahindra and Mahindra Financial Services Limited EMI payment", value: "Mahindra and Mahindra Financial Services Limited" },
                { label: "IIFL Finance Limited EMI payment", value: "IIFL Finance Limited" },
                { label: "Annapurna Finance Private Limited-MFI EMI payment", value: "Annapurna Finance Private Limited-MFI" },
                { label: "Utkarsh Bank Loan Repayment EMI payment", value: "Utkarsh Bank Loan Repayment" },
                { label: "AMU Leasing Pvt Ltd EMI payment", value: "AMU Leasing Pvt Ltd" },
                { label: "APAC Financial Services Pvt Ltd EMI payment", value: "APAC Financial Services Pvt Ltd" },
                { label: "ARTH EMI payment", value: "ARTH" },
                { label: "ASA International India Microfinance Limited EMI payment", value: "ASA International India Microfinance Limited" },
                { label: "AU Small Finance Bank Limited EMI payment", value: "AU Small Finance Bank Limited" },
                { label: "Aadhar Housing Finance Ltd. EMI payment", value: "Aadhar Housing Finance Ltd." },
                { label: "Aavas Financiers Limited EMI payment", value: "Aavas Financiers Limited" },
                { label: "Achiievers Finance Personal Loan EMI payment", value: "Achiievers Finance Personal Loan" },
                { label: "Adarsh Laxmi Nidhi EMI payment", value: "Adarsh Laxmi Nidhi" },
                { label: "Aditya Birla Financial Services EMI payment", value: "Aditya Birla Financial Services" },
                { label: "Aditya Birla Housing Finance Limited EMI payment", value: "Aditya Birla Housing Finance Limited" },
                { label: "Agora Microfinance India Ltd - AMIL EMI payment", value: "Agora Microfinance India Ltd - AMIL" },
                { label: "Agriwise Finserv Limited EMI payment", value: "Agriwise Finserv Limited" },
                { label: "Aham Housing Finance Private Limited EMI payment", value: "Aham Housing Finance Private Limited" },
                { label: "Ajeevak Nidhi Limited EMI payment", value: "Ajeevak Nidhi Limited" },
            ]
        },
        { label: "Loan Account Number", name: "loanAccountNumber", type: "text", placeholder: "Enter loan account number" },
        { label: "Amount", name: "amount", type: "number", placeholder: "Enter repayment amount" }
    ],

    "Gas Booking": [
        { label: "Choose Option", name: "gasOption", type: "radio", options: [{ label: "Book Gas Cylinder", value: "book" }, { label: "Pay Gas Bill", value: "pay" },], },
    ],

    Insurance: [
        {
            label: "Insurer",
            name: "insurer",
            type: "select",
            placeholder: "Select insurer",
            options: [
                { label: "LIC of India Bill Payment", value: "lic_india" },
                { label: "HDFC Life Insurance Bill Payment", value: "hdfc_life" },
                { label: "TATA AIA Life Insurance Bill Payment", value: "tata_aia" },
                { label: "SBI Life Insurance Company Limited Bill Payment", value: "sbi_life" },
                { label: "ICICI Prudential Life Insurance Bill Payment", value: "icici_prudential" },
                { label: "Acko General Insurance Health Bill Payment", value: "acko_health" },
                { label: "Acko General Insurance Motor Bill Payment", value: "acko_motor" },
                { label: "Aditya Birla Health Insurance Bill Payment", value: "aditya_birla_health" },
                { label: "Aditya Birla Sun Life Insurance Bill Payment", value: "aditya_birla_sunlife" },
                { label: "Ageas Federal Life Insurance Company Limited Bill Payment", value: "ageas_federal" },
                { label: "Agriculture Insurance Company of India Ltd Bill Payment", value: "agriculture_insurance" },
                { label: "Aviva Life Insurance Bill Payment", value: "aviva" },
                { label: "Axis Max Life Insurance Co Ltd. Bill Payment", value: "axis_max" },
                { label: "Bajaj Allianz General Insurance Bill Payment", value: "bajaj_allianz_general" },
                { label: "Bajaj Allianz Life Insurance Company Limited Bill Payment", value: "bajaj_allianz_life" },
                { label: "Bajaj Finance Ltd - Corporate agent Bill Payment", value: "bajaj_finance_corp" },
                { label: "Bandhan Life Insurance Bill Payment", value: "bandhan_life" },
                { label: "Bharti AXA Life Insurance Bill Payment", value: "bharti_axa" },
                { label: "Canara HSBC Life Insurance Co. Ltd Bill Payment", value: "canara_hsbc" },
                { label: "Care Health Insurance Bill Payment", value: "care_health" },
                { label: "Cholamandalam MS General Insurance Co Ltd Bill Payment", value: "chola_ms" },
                { label: "CreditAccess Life Insurance Limited Bill Payment", value: "creditaccess_life" },
                { label: "Edelweiss Tokio Life Insurance Bill Payment", value: "edelweiss_tokio" },
                { label: "Future Generali India General Insurance Bill Payment", value: "future_generali_general" },
                { label: "Future Generali India Life Insurance Company Limited Bill Payment", value: "future_generali_life" },
                { label: "Go Digit Insurance Bill Payment", value: "go_digit" },
                { label: "Go digit Life Insurance Ltd Bill Payment", value: "go_digit_life" },
                { label: "HDFC ERGO General Insurance (Motor) Bill Payment", value: "hdfc_ergo_motor" },
                { label: "HDFC Ergo General Insurance Company (Health) Bill Payment", value: "hdfc_ergo_health" },
                { label: "HDFC Life Insurance (for Former Exide Life Customers only) Bill Payment", value: "hdfc_life_exide" },
                { label: "ICICI Lombard General Insurance (Health) Bill Payment", value: "icici_lombard_health" },
                { label: "ICICI Lombard General Insurance (Motor) Bill Payment", value: "icici_lombard_motor" },
                { label: "ICICI Prudential Life Insurance First Premium Bill Payment", value: "icici_prudential_first" },
                { label: "Iffco Tokio General Insurance Company Limited Bill Payment", value: "iffco_tokio" },
                { label: "IndiaFirst Life Insurance Bill Payment", value: "indiafirst_life" },
                { label: "Kotak Life Insurance Company Limited Bill Payment", value: "kotak_life" },
                { label: "Kotak Mahindra General Insurance Company Limited Bill Payment", value: "kotak_general" },
                { label: "Liberty General Insurance Limited Bill Payment", value: "liberty_general" },
                { label: "Liberty General Insurance Limited - Health Bill Payment", value: "liberty_health" },
                { label: "Magma HDI - Health Insurance Bill Payment", value: "magma_hdi_health" },
                { label: "Magma HDI - Motor Insurance Bill Payment", value: "magma_hdi_motor" },
                { label: "Magma HDI - Non Motor Insurance Bill Payment", value: "magma_hdi_nonmotor" },
                { label: "ManipalCigna Health Insurance Bill Payment", value: "manipal_cigna" },
                { label: "Niva Bupa Health Insurance Company Limited Bill Payment", value: "niva_bupa" },
                { label: "Pnb Metlife India Insurance Company Ltd Bill Payment", value: "pnb_metlife" },
                { label: "Pramerica Life Insurance Limited Bill Payment", value: "pramerica_life" },
                { label: "Raheja QBE General Insurance Company Limited Bill Payment", value: "raheja_qbe" },
                { label: "Reliance General Insurance Company Limited (Health) Bill Payment", value: "reliance_health" },
                { label: "Reliance General Insurance Company Limited (Motor) Bill Payment", value: "reliance_motor" },
                { label: "Reliance Nippon Life Insurance Bill Payment", value: "reliance_nippon" },
                { label: "Royal Sundaram General Insurance Bill Payment", value: "royal_sundaram" },
                { label: "SBI General Health Insurance Bill Payment", value: "sbi_general_health" },
                { label: "SBI General Motor Insurance Bill Payment", value: "sbi_general_motor" },
                { label: "Shriram General Insurance Bill Payment", value: "shriram_general" },
                { label: "Shriram General Insurance - Quote Payment Bill Payment", value: "shriram_quote" },
                { label: "Shriram Life Insurance - Quote Payment Bill Payment", value: "shriram_life_quote" },
                { label: "Shriram Life Insurance Co. Ltd. Bill Payment", value: "shriram_life" },
                { label: "Star Health and Allied Insurance Bill Payment", value: "star_health" },
                { label: "Star Union Dai- Ichi Life Insurance Bill Payment", value: "star_union" },
                { label: "TATA AIG General Insurance co. Ltd Retail Bill Payment", value: "tata_aig" },
                { label: "The Oriental Insurance Company Bill Payment", value: "oriental_insurance" },
                { label: "United India Insurance - Agent Collection Bill Payment", value: "united_india_agent" },
                { label: "United India Insurance Company Limited Bill Payment", value: "united_india" },
                { label: "Universal Sompo General Insurance Bill Payment", value: "universal_sompo" },
                { label: "Zuno General Insurance Bill Payment", value: "zuno" }
            ]
        },

        { label: "Policy Number", name: "policyNumber", type: "text", placeholder: "Enter policy number" },
        { label: "Date Of Birth", name: "dateofbirth", type: "text", placeholder: "Enter Your Date Of Birth" },
    ],
    "Water Bill": [

        { label: "Account Number", name: "accountNumber", type: "text", placeholder: "Enter account number" },
        { label: "Amount", name: "amount", type: "number", placeholder: "Enter amount" },
    ],
    "Municipal Bill": [
        {
            label: "Corporation",
            name: "corporation",
            type: "select",
            placeholder: "Select Corporation",
            options: [
                { label: "Municipal Corporation Of Delhi Bill Payment", value: "Municipal Corporation Of Delhi Bill Payment" },
                { label: "Agartala Municipal Corporation Bill Payment", value: "Agartala Municipal Corporation Bill Payment" },
                { label: "Ahmedabad Municipal Corporation Bill Payment", value: "Ahmedabad Municipal Corporation Bill Payment" },
                { label: "Ajmer Nagar Nigam Bill Payment", value: "Ajmer Nagar Nigam Bill Payment" },
                { label: "Bhubaneswar Municipal Corporation Bill Payment", value: "Bhubaneswar Municipal Corporation Bill Payment" },
                { label: "Bicholim Municipal council Bill Payment", value: "Bicholim Municipal council Bill Payment" },
                { label: "Bicholim Municipal council Trade License Bill Payment", value: "Bicholim Municipal council Trade License Bill Payment" },
                { label: "Canacona Municipal Council Trade License Bill Payment", value: "Canacona Municipal Council Trade License Bill Payment" },
                { label: "Canacona Municipal council Bill Payment", value: "Canacona Municipal council Bill Payment" },
                { label: "Grampanchayat Ambegaon Bill Payment", value: "Grampanchayat Ambegaon Bill Payment" },
                { label: "Grampanchayat Aitawade Khurd Bill Payment", value: "Grampanchayat Aitawade Khurd Bill Payment" },
                { label: "Gramin Nalpani Yojana Grampanchayat Shiye Bill Payment", value: "Gramin Nalpani Yojana Grampanchayat Shiye Bill Payment" },
                { label: "Gram Panchayat Wangi Bill Payment", value: "Gram Panchayat Wangi Bill Payment" },
                { label: "Gram Panchayat Dhamner Bill Payment", value: "Gram Panchayat Dhamner Bill Payment" },
                { label: "GRAMPANCHAYAT NEVARI Bill Payment", value: "GRAMPANCHAYAT NEVARI Bill Payment" },
                { label: "Directorate of Municipal Administration Karnataka Bill Payment", value: "Directorate of Municipal Administration Karnataka Bill Payment" },
                { label: "Directorate of Land Revenue and Settlement Dept - Mizoram Bill Payment", value: "Directorate of Land Revenue and Settlement Dept - Mizoram Bill Payment" },
                { label: "Dewas Municipal Corporation Bill Payment", value: "Dewas Municipal Corporation Bill Payment" },
                { label: "Davangere Citi Municipal Corporation Bill Payment", value: "Davangere Citi Municipal Corporation Bill Payment" },
                { label: "Curchorem Cacora Municipal council Bill Payment", value: "Curchorem Cacora Municipal council Bill Payment" },
                { label: "Curchorem Cacora Municipal Council Trade License Bill Payment", value: "Curchorem Cacora Municipal Council Trade License Bill Payment" },
                { label: "Cuncolim Municipal council Bill Payment", value: "Cuncolim Municipal council Bill Payment" },
                { label: "Cuncolim Municipal Council Trade License Bill Payment", value: "Cuncolim Municipal Council Trade License Bill Payment" },
                { label: "Corporation of City Panaji Trade License Bill Payment", value: "Corporation of City Panaji Trade License Bill Payment" },
                { label: "Corporation of City Panaji Bill Payment", value: "Corporation of City Panaji Bill Payment" },
                { label: "Commissioner and Director of Municipal Administration Hyderabad, Telangana Bill Payment", value: "Commissioner and Director of Municipal Administration Hyderabad, Telangana Bill Payment" },
                { label: "Jejuri Nagarparishad Bill Payment", value: "Jejuri Nagarparishad Bill Payment" },
                { label: "Hubli-Dharwad Municipal Corporation Bill Payment", value: "Hubli-Dharwad Municipal Corporation Bill Payment" },
                { label: "Gulbarga City Corporation Bill Payment", value: "Gulbarga City Corporation Bill Payment" },
                { label: "Greater Hyderabad Municipal Corporation Bill Payment", value: "Greater Hyderabad Municipal Corporation Bill Payment" },
                { label: "Greater Chennai Corporation Bill Payment", value: "Greater Chennai Corporation Bill Payment" },
                { label: "Grampanchayat Kheradewangi Bill Payment", value: "Grampanchayat Kheradewangi Bill Payment" },
                { label: "Grampanchayat Hingangaon Budruk Bill Payment", value: "Grampanchayat Hingangaon Budruk Bill Payment" },
                { label: "Grampanchayat Halondi Gram Nidhi Bill Payment", value: "Grampanchayat Halondi Gram Nidhi Bill Payment" },
                { label: "Grampanchayat Fund Grampanchayat Shiye Bill Payment", value: "Grampanchayat Fund Grampanchayat Shiye Bill Payment" },

            ]
        },
        { label: "Property ID", name: "propertyId", type: "text", placeholder: "Enter property ID" },
        { label: "Amount", name: "amount", type: "number", placeholder: "Enter amount" },
    ],
    "Loan EMI": [
        {
            label: "Lender",
            name: "lender",
            type: "select",
            placeholder: "Select lender",
            options: [
                { label: "HDFC Bank", value: "hdfc" },
                { label: "ICICI Bank", value: "icici" },
                { label: "State Bank of India (SBI)", value: "sbi" },
                { label: "Axis Bank", value: "axis" },
                { label: "Bajaj Finserv", value: "bajaj" },
                { label: "Kotak Mahindra Bank", value: "kotak" },
                { label: "Punjab National Bank (PNB)", value: "pnb" },
                { label: "IDFC First Bank", value: "idfc" },
                { label: "LIC Housing Finance", value: "lic" },
                { label: "Tata Capital", value: "tata" }
            ]
        },
        { label: "Loan Account Number", name: "loanAccountNumber", type: "text", placeholder: "Enter loan account number" },
        { label: "EMI Amount", name: "emiAmount", type: "number", placeholder: "Enter EMI amount" },
    ],
    "Traffic Challan": [
        {
            label: "Traffic Authority",
            name: "trafficAuthority",
            type: "select",
            placeholder: "Select traffic authority",
            options: [
                { label: "Andhra Pradesh Traffic Police Bill Payment", value: "andhra-pradesh" },
                { label: "Avadi Traffic Police Bill Payment", value: "avadi" },
                { label: "Chennai Traffic Police Bill Payment", value: "chennai" },
                { label: "Tambaram Traffic Police Bill Payment", value: "tambaram" },
                { label: "Telangana Traffic Police Bill Payment", value: "telangana" },
                { label: "Haryana Traffic Police Bill Payment", value: "haryana" }
            ]
        },
        { label: "Vehicle Number", name: "vehicleNumber", type: "text", placeholder: "Enter vehicle number" },
        { label: "Challan Number", name: "challanNumber", type: "text", placeholder: "Enter challan number" },
        { label: "Amount", name: "amount", type: "number", placeholder: "Enter amount" },
    ],
};


const PayBills: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = Boolean(localStorage.getItem("token"));
    const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const modalRef = useRef<HTMLDivElement>(null);
    const [selectedState, setSelectedState] = useState("");
    const [boardOptions, setBoardOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedBoard, setSelectedBoard] = React.useState("");
    const [selectedStateForEducation, setSelectedStateForEducation] = useState("");
    const [cityOptionsForEducation, setCityOptionsForEducation] = useState([]);
    const [selectedCity, setSelectedCity] = useState<string>("");
    const formRef = useRef<HTMLFormElement>(null);

    const statesOptions = Object.keys(statesWithCities).map((state) => ({
        label: state,
        value: state,
    }));

    const cityOptions = selectedState
        ? statesWithCities[selectedState].map((city) => ({ label: city, value: city }))
        : [];

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        setSelectedState(selected);
        const boards = electricityBoardsByState[selected] || [];
        setBoardOptions(boards);
    };

    // Scroll back to top button logic
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Reset form data on new service select
    useEffect(() => {
        if (selectedService) {
            const fields = serviceFieldsMap[selectedService];
            if (fields) {
                const initialData: Record<string, string> = {};
                fields.forEach((field) => (initialData[field.name] = ""));
                setFormData(initialData);
            }
        } else {
            setFormData({});
        }
    }, [selectedService]);

    // Close modal if clicked outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setSelectedService(null);
            }
        }
        if (selectedService) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedService]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };



    const handleServiceSelect = (serviceName: string) => {
        setSelectedService(serviceName);
    };

    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     alert(
    //         `Submitting payment for ${selectedService} with data:\n${JSON.stringify(
    //             formData,
    //             null,
    //             2
    //         )}`
    //     );
    //     setSelectedService(null);
    // };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert("Please login");
            navigate("/auth/login");
            return;
        }
        if (formRef.current && !formRef.current.checkValidity()) {
            formRef.current.reportValidity();
            return;
        }
        const now = new Date();
        const transactionData = {
            orderNo: `ORD${Date.now()}`,
            date: now.toISOString().split("T")[0],
            time: now.toLocaleTimeString(),
            productDescription: selectedService || "Unknown Service",
            status: "Success",
            price: Number(formData.amount),
        };

        const existing = JSON.parse(localStorage.getItem("paymentTransactions") || "[]");
        existing.push(transactionData);
        localStorage.setItem("paymentTransactions", JSON.stringify(existing));

        alert(`Payment submitted for ${selectedService}`);
        setSelectedService(null);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (selectedService === "Education Fee" && name === "state") {
            setSelectedStateForEducation(value);
            setCityOptionsForEducation(statesWithCities[value] || []);
            setFormData((prev) => ({ ...prev, city: "" })); // Reset city
        }
    };

    return (
        <div className="overflow-x-hidden">
            <ThemeProvider defaultTheme="dark">
                <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
                    <Navbar />

                    {/* Hero Section */}
                    <section className="bg-gray-50 dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black pt-20 pb-12 md:py-20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10">
                            {/* Text Left */}
                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.6 }}
                                className="text-center md:text-left max-w-xl w-full"
                            >
                                <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-blue-900 dark:text-blue-300 mb-2 sm:mb-3 md:mb-4 leading-snug">
                                    Pay Your Bills Effortlessly
                                </h1>
                                <p className="text-xs sm:text-sm md:text-lg text-gray-600 dark:text-gray-300">
                                    Recharge and pay all your utility bills in one place — fast, secure, and hassle-free.
                                </p>
                            </motion.div>

                            {/* Image Right */}
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.6 }}
                                className="w-full md:w-[40%] flex justify-center mt-4 md:mt-0"
                            >
                                <img
                                    src="/paybills.png"
                                    alt="Pay bills illustration"
                                    className="w-40 sm:w-56 md:w-[300px] h-auto object-contain max-w-full"
                                />
                            </motion.div>
                        </div>
                    </section>




                    <main className="flex-1">
                        {/* Services Section */}
                        <section
                            className="max-w-7xl mx-auto px-6 py-20 grid gap-6 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
                        >
                            {services.map(({ icon: Icon, name }) => (
                                <motion.button
                                    key={name}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleServiceSelect(name)}
                                    className="flex flex-col items-center focus:outline-none"
                                    aria-label={`Pay for ${name}`}
                                >
                                    <div className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 mb-3">
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <span className="font-light text-xs text-center">{name}</span>
                                </motion.button>
                            ))}
                        </section>

                        {selectedService && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <motion.div
                                    ref={modalRef}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 relative"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="modal-title"
                                >
                                    <button
                                        onClick={() => setSelectedService(null)}
                                        aria-label="Close form"
                                        className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>

                                    <h2 id="modal-title" className="text-2xl font-bold mb-4 text-center">
                                        {selectedService} Payment
                                    </h2>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Electricity Bill Dropdowns */}
                                        {selectedService === "Electricity Bill" && (
                                            <>
                                                <div className="flex flex-col">
                                                    <label htmlFor="state" className="mb-1 font-medium text-gray-700 dark:text-gray-200">
                                                        State
                                                    </label>
                                                    <select
                                                        id="state"
                                                        name="state"
                                                        required
                                                        value={selectedState}
                                                        onChange={handleStateChange}
                                                        className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">Select State</option>
                                                        {Object.keys(electricityBoardsByState).map((state) => (
                                                            <option key={state} value={state}>
                                                                {state}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="flex flex-col">
                                                    <label htmlFor="electricityBoard" className="mb-1 font-medium text-gray-700 dark:text-gray-200">
                                                        Electricity Board
                                                    </label>
                                                    <select
                                                        id="electricityBoard"
                                                        name="electricityBoard"
                                                        required
                                                        value={selectedBoard}
                                                        onChange={(e) => setSelectedBoard(e.target.value)}
                                                        disabled={!selectedState}
                                                        className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">Select Electricity Board</option>
                                                        {boardOptions.map((board) => (
                                                            <option key={board.value} value={board.value}>
                                                                {board.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        {/* Dynamic fields */}
                                        {serviceFieldsMap[selectedService]?.map(({ label, name, type, placeholder, pattern, options }) => {
                                            if (
                                                selectedService === "DTH Recharge" &&
                                                (name === "subscriberId" || name === "amount") &&
                                                !formData.operator
                                            ) {
                                                return null;
                                            }

                                            let dynamicOptions = options;
                                            if (selectedService === "Education Fee" && name === "city") {
                                                dynamicOptions = cityOptionsForEducation.map((city) => ({
                                                    label: city,
                                                    value: city,
                                                }));
                                            }

                                            const selectOptions = dynamicOptions?.length ? dynamicOptions : options;

                                            return (
                                                <div key={name} className="flex flex-col">
                                                    <label htmlFor={name} className="mb-1 font-medium text-gray-700 dark:text-gray-200">
                                                        {label}
                                                    </label>

                                                    {type === "radio" ? (
                                                        <div className="flex space-x-6">
                                                            {selectOptions?.map((option) => (
                                                                <label
                                                                    key={option.value}
                                                                    className="flex items-center space-x-2 cursor-pointer"
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={name}
                                                                        value={option.value}
                                                                        checked={formData[name] === option.value}
                                                                        onChange={handleInputChange}
                                                                        className="form-radio text-blue-600"
                                                                    />
                                                                    <span>{option.label}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    ) : type === "select" ? (
                                                        <select
                                                            id={name}
                                                            name={name}
                                                            required
                                                            value={formData[name] || ""}
                                                            onChange={handleInputChange}
                                                            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="" disabled>
                                                                {placeholder}
                                                            </option>
                                                            {selectOptions?.map((option) => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            id={name}
                                                            name={name}
                                                            type={type}
                                                            pattern={pattern}
                                                            placeholder={placeholder}
                                                            required
                                                            value={formData[name] || ""}
                                                            onChange={handleInputChange}
                                                            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {formData.gasOption === "book" && (
                                            <>
                                                <div>
                                                    <label className="font-semibold ">Gas Provider</label>
                                                    <select
                                                        name="gasProvider"
                                                        value={formData.gasProvider || ""}
                                                        onChange={handleInputChange}
                                                        className="border p-2 w-full rounded text-black"
                                                        required
                                                    >
                                                        <option value="" disabled>Select Gas Provider</option>
                                                        <option value="HP Gas Bill Payment ">HP Gas Bill Payment</option>
                                                        <option value="Bharatgas Bill Payment">Bharatgas Bill Payment</option>
                                                        <option value="Bharat Gas (BPCL) - Commercial Bill Payment">Bharat Gas (BPCL) - Commercial Bill Payment</option>
                                                        <option value="Indane Bill Payment">Indane Bill Payment</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="font-semibold">Mobile Number</label>
                                                    <input
                                                        type="tel"
                                                        name="mobileNumber"
                                                        placeholder="Enter mobile number"
                                                        value={formData.mobileNumber || ""}
                                                        onChange={handleInputChange}
                                                        className="border p-2 w-full rounded"
                                                        required
                                                        pattern="[0-9]{10}"

                                                    />
                                                </div>

                                                <div>
                                                    <label className="font-semibold">State</label>
                                                    <select
                                                        name="state"
                                                        value={formData.state || ""}
                                                        onChange={(e) => {
                                                            handleInputChange(e);
                                                            // Reset city on state change
                                                            setFormData((prev) => ({ ...prev, city: "" }));
                                                        }}
                                                        className="border p-2 w-full rounded"
                                                        required
                                                    >
                                                        <option value="" disabled>Select State</option>
                                                        {Object.keys(statesWithCities).map((state) => (
                                                            <option key={state} value={state}>{state}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="font-semibold">City</label>
                                                    <select
                                                        name="city"
                                                        value={formData.city || ""}
                                                        onChange={handleInputChange}
                                                        className="border p-2 w-full rounded"
                                                        disabled={!formData.state}
                                                        required
                                                    >
                                                        <option value="" disabled>{formData.state ? "Select City" : "Select State First"}</option>
                                                        {formData.state &&
                                                            statesWithCities[formData.state].map((city) => (
                                                                <option key={city} value={city}>{city}</option>
                                                            ))}
                                                    </select>
                                                </div>
                                            </>
                                        )}
                                        {formData.gasOption === "pay" && (
                                            <>
                                                <div>
                                                    <label className="font-semibold text-black">Gas Provider</label>
                                                    <select
                                                        name="gasProvider"
                                                        value={formData.gasProvider || ""}
                                                        onChange={handleInputChange}
                                                        className="border p-2 w-full rounded text-black"
                                                        required
                                                    >
                                                        <option value="" disabled>Select Gas Provider</option>
                                                        <option value="Gujarat Gas Limited Bill Payment">Gujarat Gas Limited Bill Payment</option>
                                                        <option value="Mahanagar Gas- Mumbai Bill Payment">Mahanagar Gas- Mumbai Bill Payment</option>
                                                        <option value="Adani Total Gas Limited Bill Payment">Adani Total Gas Limited Bill Payment</option>
                                                        <option value="AGP CGD India Pvt Ltd Bill Payment">AGP CGD India Pvt Ltd Bill Payment</option>
                                                        <option value="AGP City Gas Pvt Ltd Bill Payment">AGP City Gas Pvt Ltd Bill Payment</option>
                                                        <option value="Aavantika Gas Ltd Bill Payment">Aavantika Gas Ltd Bill Payment</option>
                                                        <option value="Assam Gas Company Limited Bill Payment">Assam Gas Company Limited Bill Payment</option>
                                                        <option value="Bengal Gas Company Limited Bill Payment">Bengal Gas Company Limited Bill Payment</option>
                                                        <option value="Bhagyanagar Gas Limited Bill Payment">Bhagyanagar Gas Limited Bill Payment</option>
                                                        <option value="Central U.P. Gas Limited Bill Payment">Central U.P. Gas Limited Bill Payment</option>
                                                        <option value="Charotar Gas Sahakari Mandali Ltd Bill Payment">Charotar Gas Sahakari Mandali Ltd Bill Payment</option>
                                                        <option value="GAIL Gas Limited Bill Payment">GAIL Gas Limited Bill Payment</option>
                                                        <option value="GAIL India Limited Bill Payment">GAIL India Limited Bill Payment</option>
                                                        <option value="Goa Natural Gas Private Limited Bill Payment">Goa Natural Gas Private Limited Bill Payment</option>
                                                        <option value="Godavari Gas Pvt Ltd Bill Payment">Godavari Gas Pvt Ltd Bill Payment</option>
                                                        <option value="Green Gas Limited(GGL) Bill Payment">Green Gas Limited(GGL) Bill Payment</option>
                                                        <option value="HP Oil Gas Private Limited Bill Payment">HP Oil Gas Private Limited Bill Payment</option>
                                                        <option value="Haryana City Gas Distribution Bhiwadi Ltd Bill Payment">Haryana City Gas Distribution Bhiwadi Ltd Bill Payment</option>
                                                        <option value="Haryana City Gas Distribution Limited Bill Payment">Haryana City Gas Distribution Limited Bill Payment</option>
                                                        <option value="Hindustan Petroleum Corporation Ltd-Piped Gas Bill Payment">Hindustan Petroleum Corporation Ltd-Piped Gas Bill Payment</option>
                                                        <option value="IRM Energy Private Limited Bill Payment">IRM Energy Private Limited Bill Payment</option>
                                                        <option value="Indian Oil Corporation Ltd-Piped Gas Bill Payment">Indian Oil Corporation Ltd-Piped Gas Bill Payment</option>
                                                        <option value="Indian Oil-Adani Gas Private Limited Bill Payment">Indian Oil-Adani Gas Private Limited Bill Payment</option>
                                                        <option value="Indraprastha Gas Limited Bill Payment">Indraprastha Gas Limited Bill Payment</option>
                                                        <option value="Maharashtra Natural Gas Limited (MNGL) Bill Payment">Maharashtra Natural Gas Limited (MNGL) Bill Payment</option>
                                                        <option value="Megha Gas Bill Payment">Megha Gas Bill Payment</option>
                                                        <option value="Naveriya Gas Pvt Ltd Bill Payment">Naveriya Gas Pvt Ltd Bill Payment</option>
                                                        <option value="Purba Bharati Gas Pvt Ltd Bill Payment">Purba Bharati Gas Pvt Ltd Bill Payment</option>
                                                        <option value="Rajasthan State Gas Limited Bill Payment">Rajasthan State Gas Limited Bill Payment</option>
                                                        <option value="Sabarmati Gas Limited (SGL) Bill Payment">Sabarmati Gas Limited (SGL) Bill Payment</option>
                                                        <option value="Think Gas Bill Payment">Think Gas Bill Payment</option>
                                                        <option value="Torrent Gas Bill Payment">Torrent Gas Bill Payment</option>
                                                        <option value="Tripura Natural Gas Bill Payment">Tripura Natural Gas Bill Payment</option>
                                                        <option value="Unique Central Piped Gases Pvt Ltd (UCPGPL) Bill Payment">Unique Central Piped Gases Pvt Ltd (UCPGPL) Bill Payment</option>
                                                        <option value="Vadodara Gas Limited (VGL) Bill Payment">Vadodara Gas Limited (VGL) Bill Payment</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="font-semibold text-black">Consumer Number</label>
                                                    <input
                                                        type="text"
                                                        name="consumerNumber"
                                                        placeholder="Enter consumer number"
                                                        className="border p-2 w-full rounded text-black"
                                                        value={formData.consumerNumber || ""}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        <button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Submit Payment
                                        </button>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                       <section className="py-12 md:py-16 bg-gray-50 dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black">
  <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 md:mb-4 text-center">
    How It Works
  </h2>

  <div className="py-4 md:py-6 w-full px-4 sm:px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-stretch justify-between gap-5 md:gap-6">
    {/* Left Side: Steps */}
    <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4 md:space-y-6">
      <div className="flex-1 flex flex-col justify-between space-y-3 md:space-y-3">
        <div className="w-full p-4 md:p-6 rounded-lg shadow dark:shadow-gray-700 bg-gray-50 dark:bg-gray text-center transition-transform duration-300 ease-in-out transform hover:scale-105">
          <div className="text-primary text-2xl sm:text-3xl md:text-4xl mb-1 md:mb-2">1️⃣</div>
          <h3 className="text-base sm:text-lg md:text-xl font-medium mb-0.5 md:mb-1 dark:text-black">Sign Up</h3>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-black">Create your free account in seconds.</p>
        </div>

        <div className="w-full p-4 md:p-6 rounded-lg shadow dark:shadow-gray-700 bg-gray-50 dark:bg-gray text-center transition-transform duration-300 ease-in-out transform hover:scale-105">
          <div className="text-primary text-2xl sm:text-3xl md:text-4xl mb-1 md:mb-2">2️⃣</div>
          <h3 className="text-base sm:text-lg md:text-xl font-medium mb-0.5 md:mb-1 dark:text-black">Choose a Service</h3>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-black">Select from a range of bill payment or recharge services.</p>
        </div>

        <div className="w-full p-4 md:p-6 rounded-lg shadow dark:shadow-gray-700 bg-gray-50 dark:bg-gray text-center transition-transform duration-300 ease-in-out transform hover:scale-105">
          <div className="text-primary text-2xl sm:text-3xl md:text-4xl mb-1 md:mb-2">3️⃣</div>
          <h3 className="text-base sm:text-lg md:text-xl font-medium mb-0.5 md:mb-1 dark:text-black">Pay Securely</h3>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-black">Complete your transaction safely and quickly.</p>
        </div>
      </div>
    </div>

    {/* Right Side: Image */}
    <div className="w-full md:w-1/2 flex justify-center items-center">
      <img
        src="/howitwork.jpg"
        alt="How it works illustration"
        className="w-64 sm:w-80 md:w-full max-w-[600px] h-auto rounded-lg object-contain"
      />
    </div>
  </div>
</section>
              {/* FAQ Section */}
                        <FAQSection />
                    </main>

                    {/* Footer */}
                    <footer className="bg-background py-12 px-6 md:px-12 border-t border-border">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="md:col-span-2">
                                <img src="/newlogo.png" alt="DORPay Logo" className="w-16 h-16" />

                                {/* <h3 className="text-2xl font-semibold mb-4">
                                    DORPay<span className="text-primary/80">.</span>
                                </h3> */}
                                <p className="text-muted-foreground max-w-md mb-6">
                                    Discover the perfect property that matches your lifestyle and preferences with our curated selection of premium DORPay.
                                </p>
                                <div className="flex space-x-4">
                                    <a
                                        href="#"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Twitter
                                    </a>
                                    <a
                                        href="#"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Facebook
                                    </a>
                                    <a
                                        href="#"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Instagram
                                    </a>
                                    <a
                                        href="#"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        LinkedIn
                                    </a>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-4">Explore</h4>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Properties
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Agents
                                        </a>
                                        {/* <a
                                            href="/PayBills"
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Pay Bills
                                        </a> */}
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Locations
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Blog
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-medium mb-4">Contact</h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>Rsoultek Consulting India Pvt Ltd,</li>
                                    <li>
                                        CoWrks, RMZ Ecoworld, Ground Floor Bay Area, 6A, Devarabisanahalli,
                                    </li>
                                    <li>Bengaluru, Karnataka, India- 560103</li>
                                    <li>
                                        <a
                                            href="mailto:support@dorpay.in"
                                            className="hover:text-foreground transition-colors"
                                        >
                                            support@dorpay.in
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="tel:+919844809969"
                                            className="hover:text-foreground transition-colors"
                                        >
                                            +91 9844809969
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border text-center sm:text-left sm:flex sm:justify-between sm:items-center">
                            <p className="text-muted-foreground text-sm">
                                © {new Date().getFullYear()} DORPay. All rights reserved.
                            </p>
                            <div className="mt-4 sm:mt-0 flex justify-center sm:justify-end space-x-6 text-sm">
                                <a
                                    href="/privacy-policy"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Privacy Policy
                                </a>
                                <a
                                    href="/TermsConditions"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Terms of Service
                                </a>
                                <a
                                    href="#"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cookies Policy
                                </a>
                            </div>
                        </div>
                    </footer>
                    {/* Back to Top Button */}
                    {showBackToTop && (
                        <button
                            aria-label="Back to top"
                            className="fixed bottom-8 right-8 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
                            onClick={scrollToTop}
                        >
                            <ArrowUp size={20} />
                        </button>
                    )}
                </div>
            </ThemeProvider>
        </div>
    );
};

export default PayBills;
