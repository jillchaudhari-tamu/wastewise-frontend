import Header from "./components/Header";
import ItemInput from "./components/ItemInput";
import DisposalResult from "./components/DisposalResult";
import BarcodeScanner from "./components/BarcodeScanner";
import StatsChart from "./components/StatsChart";
import { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, addDoc, doc, updateDoc, increment, setDoc, getDoc } from "firebase/firestore";
import "./styles/scanner.css";

function WasteWiseApp({ user }) {
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [lastScanned, setLastScanned] = useState("");
  const [log, setLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState({});
  const retryCount = useRef(0);
  const MAX_RETRIES = 2;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserStats(docSnap.data().stats || {});
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, [user]);

  const classifyWithAI = async (productName, packaging = "unknown") => {
    const packagingInfo = packaging !== "unknown" ? ` (packaging: ${packaging})` : "";
    const prompt = `${productName}${packagingInfo}`;

    try {
      const healthResponse = await fetch("http://localhost:5000/health");
      if (!healthResponse.ok) throw new Error("Server not responding");

      const response = await fetch("http://localhost:5000/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const responseText = await response.text();
      if (!response.ok) throw new Error(JSON.parse(responseText).error || `Server error: ${response.status}`);

      const data = JSON.parse(responseText);
      if (!data.result) throw new Error("No classification result received");

      const result = data.result.trim();
      const validResults = ["Recyclable", "Compostable", "Trash", "Hazardous"];
      const normalizedResult = validResults.find(valid => result.toLowerCase().includes(valid.toLowerCase())) || "Trash";
      return normalizedResult;

    } catch (error) {
      console.error("Classification error:", error);
      setError(error.message.includes("Server not responding") ? "Backend server is not running. Please start the server first." : `Classification failed: ${error.message}`);
      return "Trash";
    }
  };

  const handleClassify = async (item) => {
    if (!item?.trim()) return setError("Please enter an item name");

    setIsLoading(true);
    setError("");
    try {
      const classification = await classifyWithAI(item.trim());
      setResult(`${classification} (${item})`);
      addToLog(item, classification, "Manual Entry");
    } catch (error) {
      console.error("Classification failed:", error);
      setError("Classification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeScan = async (barcode) => {
    setLastScanned(barcode);
    setError("");
    setIsLoading(true);
    try {
      const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        retryCount.current = 0;
        const productName = data.product.product_name || data.product.generic_name || data.product.brands || `Product ${barcode}`;
        const packaging = data.product.packaging || "unknown";
        const classification = await classifyWithAI(productName, packaging);
        setResult(`${classification} (${productName})`);
        addToLog(productName, classification, "Barcode Scan");
      } else if (data.status === 0) {
        throw new Error(`Product ${barcode} not found in database`);
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (error) {
      console.error("Barcode lookup failed:", error);
      retryCount.current += 1;
      if (retryCount.current < MAX_RETRIES) {
        setError(`Retrying barcode lookup... (${retryCount.current}/${MAX_RETRIES})`);
        setTimeout(() => handleBarcodeScan(barcode), 2000);
      } else {
        if (barcode.length === 12 && !barcode.startsWith('0')) {
          retryCount.current = 0;
          setTimeout(() => handleBarcodeScan(`0${barcode}`), 1000);
          return;
        }
        setResult(`Unknown Product (${barcode})`);
        setError("Product not found in database. This barcode might be region-specific or not food-related.");
        addToLog(`Unknown barcode: ${barcode}`, "Trash", "Failed Scan");
        retryCount.current = 0;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addToLog = async (product, classification, source) => {
    const logEntry = {
      product,
      classification,
      source,
      time: new Date().toLocaleString(),
    };
    setLog(prev => [logEntry, ...prev]);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {}, { merge: true });
      await addDoc(collection(userRef, "history"), logEntry);
      await updateDoc(userRef, {
        [`stats.${classification}`]: increment(1),
      });

      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        setUserStats(updatedDoc.data().stats || {});
      }
    } catch (err) {
      console.error("Error logging to Firestore:", err);
    }
  };

  const clearHistory = () => {
    setLog([]);
    setResult("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="w-full flex justify-end px-4 py-2">
        <button
          onClick={() => signOut(auth)}
          className="text-sm text-red-600 underline hover:text-red-800"
        >
          🚪 Log Out
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <Header />
        <DisposalResult result={result} />
        {isLoading && <div className="text-center mt-4"><div className="animate-pulse text-blue-600 font-medium">🤖 Analyzing item...</div></div>}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mt-4">
            <p className="text-sm">{error}</p>
            {lastScanned && (
              <button
                onClick={() => handleBarcodeScan(lastScanned)}
                className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Retry Scan
              </button>
            )}
          </div>
        )}
        <BarcodeScanner onScan={handleBarcodeScan} />
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-center">Manual Classification</h3>
          <p className="text-sm text-gray-600 mb-3 text-center">Can't scan? Type the item name below:</p>
          <ItemInput onClassify={handleClassify} disabled={isLoading} />
        </div>

        {/* 📊 Add Bar Chart */}
        <StatsChart stats={userStats} />

        {/* 📦 Stat Counts Grid */}
        <div className="mt-6 grid grid-cols-4 gap-2 text-center">
          <div className="bg-green-100 p-3 rounded-lg">
            <div className="text-xl font-bold text-green-700">{userStats.Recyclable || 0}</div>
            <div className="text-xs text-green-600">♻️ Recycled</div>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <div className="text-xl font-bold text-yellow-700">{userStats.Compostable || 0}</div>
            <div className="text-xs text-yellow-600">🌱 Compost</div>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <div className="text-xl font-bold text-red-700">{userStats.Trash || 0}</div>
            <div className="text-xs text-red-600">🗑️ Trash</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <div className="text-xl font-bold text-purple-700">{userStats.Hazardous || 0}</div>
            <div className="text-xs text-purple-600">⚠️ Hazard</div>
          </div>
        </div>
        {log.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Recent Classifications</h3>
              <button onClick={clearHistory} className="text-sm text-gray-500 hover:text-red-600">Clear</button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {log.slice(0, 10).map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`font-semibold ${
                        item.classification === "Recyclable" ? "text-green-700" :
                        item.classification === "Compostable" ? "text-yellow-700" :
                        item.classification === "Hazardous" ? "text-purple-700" : "text-red-700"
                      }`}>
                        {item.classification}
                      </div>
                      <div className="text-sm text-gray-700">{item.product}</div>
                      <div className="text-xs text-gray-500">{item.source} • {item.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WasteWiseApp;
