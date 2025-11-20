// TEST COMPONENT - Add this temporarily to debug

import { useState } from "react";
import { abstractAPI } from "../services/api";

export default function TestSubmit() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const testSubmit = async () => {
    console.log("🔍 Test submit clicked!");
    setTesting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("title", "Test Abstract Title");
      formData.append("authors", "John Doe, Jane Smith");
      formData.append("email", "sbadat@neomed.edu");
      formData.append("department", "cardiology");
      formData.append("category", "clinical");
      formData.append("keywords", "test, keywords");
      formData.append("abstract", "This is a test abstract for debugging purposes.");

      console.log("📤 Sending test submission...");
      const response = await abstractAPI.submit(formData);
      console.log("📥 Response received:", response);

      setResult({ success: true, data: response });
    } catch (error) {
      console.error("❌ Error:", error);
      setResult({ success: false, error: error.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed top-20 right-4 bg-white border-2 border-purple-500 rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-bold text-purple-900 mb-2">🧪 Test Submit</h3>
      
      <button
        onClick={testSubmit}
        disabled={testing}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 mb-2"
      >
        {testing ? "Testing..." : "Test Submit"}
      </button>

      {result && (
        <div className={`text-sm p-2 rounded ${result.success ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
          {result.success ? (
            <>
              <div className="font-bold">✅ Success!</div>
              <div className="text-xs mt-1">Token: {result.data?.data?.viewToken?.substring(0, 10)}...</div>
            </>
          ) : (
            <>
              <div className="font-bold">❌ Failed</div>
              <div className="text-xs mt-1">{result.error}</div>
            </>
          )}
        </div>
      )}

      <div className="text-xs text-gray-600 mt-2">
        Check console (F12) for logs
      </div>
    </div>
  );
}

// TO USE:
// 1. Import this in App.jsx
// 2. Add <TestSubmit /> component
// 3. Click "Test Submit" button
// 4. Check if it works
// 5. If yes, problem is in form. If no, problem is backend connection.