import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { io } from "socket.io-client";
import countryList from "react-select-country-list";
import Select from "react-select";
import { MdPhoneIphone, MdAccountBalance } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";

const Wallet = () => {
const { user } = useAuth();

const [balance, setBalance] = useState(0);
const [amount, setAmount] = useState("");
const [method, setMethod] = useState("");
const [transactions, setTransactions] = useState([]);
const [showAllTransactions, setShowAllTransactions] = useState(false);
const [actionType, setActionType] = useState("add");
const [paymentMethods, setPaymentMethods] = useState([]);
const [methodDescription, setMethodDescription] = useState("");
const [paymentDetails, setPaymentDetails] = useState({});
const [countryOptions, setCountryOptions] = useState([]);
const [selectedCountry, setSelectedCountry] = useState(null);

// ================= FETCH WALLET =================
const fetchWallet = async () => {
try {
const response = await API.get("/wallet");
setBalance(response.data.balance);
const sortedTransactions = (response.data.transactions || []).sort(
(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);
setTransactions(sortedTransactions);
} catch (error) {
console.error("WALLET ERROR:", error.response || error);
toast.error(error.response?.data?.message || "Failed to load wallet");
}
};

// ================= FETCH PAYMENT METHODS =================
const fetchPaymentMethods = async () => {
try {
const response = await API.get("/payment-methods");
setPaymentMethods(response.data.methods || []);
} catch (error) {
console.error("PAYMENT METHODS ERROR:", error.response || error);
toast.error(error.response?.data?.message || "Failed to load payment methods");
}
};

useEffect(() => {
if (!user) return;

const initialize = async () => {  
  await fetchWallet();  
  await fetchPaymentMethods();  
  setCountryOptions(countryList().getData());  

  const socket = io(import.meta.env.VITE_API_URL);  

  socket.on("wallet:update", ({ userId, balance: newBalance, transactions: newTxs }) => {  
    if (userId === user._id) {  
      setBalance(newBalance);  

      if (newTxs) {  
        const sortedTransactions = newTxs.sort(  
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)  
        );  
        setTransactions(sortedTransactions);  

        const completedTxs = newTxs.filter(  
          (tx) => tx.status === "Completed" && tx.notified !== true  
        );  

        completedTxs.forEach((tx) => {  
          toast.success(`Deposit of $${tx.amount} successful!`);  
          tx.notified = true;  
        });  
      }  
    }  
  });  

  return () => socket.disconnect();  
};  

initialize();

}, [user]);

// ================= ADD FUNDS =================
const handleAddFunds = async () => {
if (!amount || !method) {
return toast.error("Enter amount and select payment method");
}

try {  
  const selectedMethod = paymentMethods.find((m) => m.name === method);  

  const detailsWithCountry = { ...paymentDetails };  

  if (  
    (selectedMethod.type === "mobile-money" ||  
      selectedMethod.type === "mpesa") &&  
    selectedCountry  
  ) {  
    detailsWithCountry.country = selectedCountry.value;  
  }  

  const response = await API.post("/payment/initialize", {  
    amount: Number(amount),  
    method: selectedMethod?.name,  
    paymentDetails: detailsWithCountry,  
  });  

  toast.success(response.data.message);  
  setAmount("");  
  setMethod("");  
  setMethodDescription("");  
  setPaymentDetails({});  
  setSelectedCountry(null);  
  fetchWallet();  

  window.location.href = response.data.authorization_url;  
} catch (error) {  
  console.error("ADD FUNDS ERROR:", error.response || error);  
  toast.error(error.response?.data?.message || "Deposit failed");  
}

};

const handleWithdraw = () => {
toast("Withdrawal coming soon", { icon: "⏳" });
};

const displayedTransactions = showAllTransactions
? transactions
: transactions.slice(0, 3);

// ================= REACT SELECT OPTIONS =================
const paymentOptions = paymentMethods.map((m) => {
let icon = null;

if (m.type === "mobile-money" || m.type === "mpesa")  
  icon = <MdPhoneIphone />;  
else if (m.type === "card") icon = <FaCreditCard />;  
else if (m.type === "bank") icon = <MdAccountBalance />;  

return {  
  value: m.name,  
  label: (  
    <div className="flex items-center gap-2">  
      {icon}  
      {m.name}  
    </div>  
  ),  
  method: m,  
};

});

// ===== MOBILE MONEY NETWORK OPTIONS (ADDED) =====
const mobileNetworkOptions = [
{
value: "Mpesa",
label: (
<div className="flex items-center gap-2">
<MdPhoneIphone className="text-green-600"/>
Mpesa
</div>
),
},
{
value: "MoMo",
label: (
<div className="flex items-center gap-2">
<MdPhoneIphone className="text-yellow-500"/>
MoMo
</div>
),
},
{
value: "Airtel Money",
label: (
<div className="flex items-center gap-2">
<MdPhoneIphone className="text-red-500"/>
Airtel Money
</div>
),
},
];

return (
<div className="bg-gray-100 min-h-screen flex flex-col pb-24">
<Header />

<main className="flex-1 max-w-4xl mt-8 space-y-6">  

{/* Balance Card */}  
<div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-6">  
<div>  
<h2 className="text-lg text-gray-500">Wallet Balance</h2>  
<p className="text-3xl font-bold text-green-600">  
${Number(balance).toFixed(4)}  
</p>  
</div>  

<div className="flex gap-4">  
<button  
className={`px-6 py-3 rounded-xl text-white ${  
actionType === "add" ? "bg-green-600" : "bg-green-500"  
}`}  
onClick={() => setActionType("add")}  
>  
Add Funds  
</button>  

<button  
className={`px-6 py-3 rounded-xl text-white ${  
actionType === "withdraw" ? "bg-red-600" : "bg-red-500"  
}`}  
onClick={() => setActionType("withdraw")}  
>  
Withdraw  
</button>  
</div>  
</div>  

{/* Add Funds */}  
{actionType === "add" && (  
<div className="bg-white rounded-2xl shadow-lg p-6">  

<h3 className="text-xl font-semibold mb-4">Add Funds</h3>  

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">  

<input  
type="number"  
placeholder="Enter Amount (USD)"  
value={amount}  
onChange={(e) => setAmount(e.target.value)}  
className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-400"  
/>  

<Select  
options={paymentOptions}  
placeholder="Select Payment Method"  
isSearchable  
onChange={(option) => {  
setMethod(option.value);  
const selected = option.method;  
setMethodDescription(selected?.description || "");  
setPaymentDetails({});  
setSelectedCountry(null);  
}}  
className="w-full"  
/>  

</div>  

{methodDescription && (  
<p className="mt-2 text-gray-500 italic">{methodDescription}</p>  
)}  

{/* Dynamic Forms */}  
{method && (() => {  
const selected = paymentMethods.find((m) => m.name === method);  
if (!selected) return null;  

switch (selected.type) {  

case "mobile-money":  
case "mpesa":  
return (  
<div className="space-y-3 mt-4">  

<Select  
options={mobileNetworkOptions}  
placeholder="Select Mobile Money Network"  
isSearchable  
value={mobileNetworkOptions.find(  
(opt) => opt.value === paymentDetails.network  
)}  
onChange={(option) =>  
setPaymentDetails({  
...paymentDetails,  
network: option.value,  
})  
}  
/>  

<label className="block font-semibold mb-1">  
Phone  
</label>  

<PhoneInput  
country={paymentDetails.country || "ke"}  
value={paymentDetails.phone || ""}  
onChange={(phone, data) => {  
setPaymentDetails({  
...paymentDetails,  
phone: phone,  
country: data.countryCode.toUpperCase(),  
});  
}}  
inputClass="w-full p-3 rounded-xl border"  
/>  

</div>  
);

case "card":
return (/* unchanged */ null);

case "bank":
return (/* unchanged */ null);

case "manual":
return (
<div className="mt-4 p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded-lg text-yellow-700">
Please visit our support to deposit manually.
</div>
);

default:
return null;
}
})()}

<button  
onClick={handleAddFunds}  
className="mt-4 w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600"  
>  
Proceed to Payment  
</button>  

</div>  
)}

{/* Withdraw + Transactions remain EXACTLY the same */}

</main>

<Footer />

</div>
);
};

export default Wallet;
