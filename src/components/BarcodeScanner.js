import React, { useRef, useState } from "react";

const BarcodeScanner = ({ onScan }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setIsScanning(true);
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied or not available. Please use manual entry.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      const barcode = manualInput.trim();
      onScan(barcode);
      setManualInput("");
      setManualMode(false);
    }
  };

  const handleTestBarcode = (testBarcode) => {
    setManualInput(testBarcode);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Product Scanner</h2>

      {!manualMode ? (
        <>
          <div className="space-y-4">
            {!isScanning && !error && (
              <div className="text-center space-y-3">
                <button
                  onClick={startCamera}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📷 Start Camera Scanner
                </button>
                
                <div className="text-sm text-gray-600">
                  <p>Or try manual entry instead:</p>
                  <button
                    onClick={() => setManualMode(true)}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Enter barcode manually
                  </button>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="space-y-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    📱 Point camera at barcode
                  </p>
                  
                  <div className="space-x-2">
                    <button
                      onClick={() => setManualMode(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Switch to Manual Entry
                    </button>
                    
                    <button
                      onClick={stopCamera}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Stop Camera
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <p className="text-sm font-medium">Camera Issue:</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => setManualMode(true)}
                  className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Use Manual Entry Instead
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">📝 Manual Barcode Entry</p>
              <p className="text-xs">Enter the numbers from the barcode (usually 12-13 digits)</p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter barcode (e.g., 012345678901)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  pattern="[0-9]*"
                  maxLength="14"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔍 Look Up Product
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setManualMode(false);
                    setManualInput("");
                    setError("");
                  }}
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                >
                  📷 Back to Camera
                </button>
              </div>
            </form>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">Try these example barcodes:</p>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => handleTestBarcode("3017620422003")}
                  className="block w-full text-left p-2 bg-white rounded border hover:bg-blue-50"
                >
                  <strong>3017620422003</strong> - Nutella
                </button>
                <button
                  onClick={() => handleTestBarcode("5449000000996")}
                  className="block w-full text-left p-2 bg-white rounded border hover:bg-blue-50"
                >
                  <strong>5449000000996</strong> - Coca-Cola
                </button>
                <button
                  onClick={() => handleTestBarcode("7622210992307")}
                  className="block w-full text-left p-2 bg-white rounded border hover:bg-blue-50"
                >
                  <strong>7622210992307</strong> - Oreo
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BarcodeScanner;