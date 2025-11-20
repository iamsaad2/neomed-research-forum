import { useState } from 'react';
import { testConnection } from '../services/api';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function BackendDiagnostic() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const testResult = {
      apiUrl,
      envLoaded: !!import.meta.env.VITE_API_URL,
      tests: []
    };

    // Test 1: Check if API URL is set
    testResult.tests.push({
      name: 'Environment Variable',
      success: !!import.meta.env.VITE_API_URL,
      message: import.meta.env.VITE_API_URL 
        ? `Using: ${import.meta.env.VITE_API_URL}` 
        : 'Using default: http://localhost:5000'
    });

    // Test 2: Try to connect to root endpoint
    try {
      const response = await fetch(`${apiUrl}/`);
      const data = await response.json();
      testResult.tests.push({
        name: 'Backend Connection',
        success: true,
        message: `Connected! ${data.message || 'Server is running'}`
      });
    } catch (error) {
      testResult.tests.push({
        name: 'Backend Connection',
        success: false,
        message: `Failed: ${error.message}`
      });
    }

    // Test 3: Try the submit endpoint
    try {
      const response = await fetch(`${apiUrl}/api/abstracts/submit`, {
        method: 'OPTIONS' // CORS preflight
      });
      testResult.tests.push({
        name: 'Submit Endpoint',
        success: response.ok || response.status === 204,
        message: response.ok ? 'Endpoint accessible' : `Status: ${response.status}`
      });
    } catch (error) {
      testResult.tests.push({
        name: 'Submit Endpoint',
        success: false,
        message: `Failed: ${error.message}`
      });
    }

    // Test 4: Try published endpoint
    try {
      const response = await fetch(`${apiUrl}/api/abstracts/published`);
      const data = await response.json();
      testResult.tests.push({
        name: 'Published Endpoint',
        success: response.ok,
        message: response.ok ? `Found ${data.count || 0} published abstracts` : `Status: ${response.status}`
      });
    } catch (error) {
      testResult.tests.push({
        name: 'Published Endpoint',
        success: false,
        message: `Failed: ${error.message}`
      });
    }

    setResult(testResult);
    setTesting(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border-2 border-slate-300 rounded-lg shadow-lg p-4 max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900">Backend Diagnostic</h3>
          <button
            onClick={runTest}
            disabled={testing}
            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:bg-slate-400"
          >
            {testing ? 'Testing...' : 'Run Test'}
          </button>
        </div>

        {result && (
          <div className="space-y-2">
            <div className="text-xs text-slate-600 mb-2">
              <strong>API URL:</strong> {result.apiUrl}
            </div>
            
            {result.tests.map((test, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                {test.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{test.name}</div>
                  <div className={`text-xs ${test.success ? 'text-green-700' : 'text-red-700'}`}>
                    {test.message}
                  </div>
                </div>
              </div>
            ))}

            {!result.tests.some(t => t.success) && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <strong>Troubleshooting:</strong>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>Check your .env file has VITE_API_URL set</li>
                  <li>Restart dev server after changing .env</li>
                  <li>Verify Railway backend is running</li>
                  <li>Check CORS settings on backend</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {!result && (
          <div className="text-sm text-slate-600 text-center py-2">
            Click "Run Test" to check backend connection
          </div>
        )}
      </div>
    </div>
  );
}