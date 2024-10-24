// File: pages/index.js
import { useState } from 'react';
import StellarSdk from 'stellar-sdk';

export default function Home() {
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState('');
  const [validationStatus, setValidationStatus] = useState({});

  const validateInput = (input, type) => {
    try {
      if (type === 'destination') {
        StellarSdk.Keypair.fromPublicKey(input);
        setValidationStatus(prev => ({...prev, destination: 'Valid destination address'}));
      } else if (type === 'secret') {
        StellarSdk.Keypair.fromSecret(input);
        setValidationStatus(prev => ({...prev, secret: 'Valid secret key'}));
      }
      return true;
    } catch (error) {
      setValidationStatus(prev => ({...prev, [type]: `Invalid ${type}: ${error.message}`}));
      return false;
    }
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value.trim();
    setDestinationAddress(value);
    if (value.length >= 56) {
      validateInput(value, 'destination');
    }
  };

  const handleSecretChange = (e) => {
    const value = e.target.value.trim();
    setSecret(value);
    if (value.length >= 56) {
      validateInput(value, 'secret');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Validating inputs...');

    // Clear previous validation status
    setValidationStatus({});

    // Validate both keys before submission
    const isDestinationValid = validateInput(destinationAddress, 'destination');
    const isSecretValid = validateInput(secret, 'secret');

    if (!isDestinationValid || !isSecretValid) {
      setStatus('Validation failed. Please check the errors above.');
      return;
    }

    setStatus('Processing payment...');

    try {
      const response = await fetch('/api/send-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationAddress,
          amount,
          secret,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`Success! Transaction ID: ${data.transactionId}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold mb-8">Stellar Payment System</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Destination Address
                      <input
                        type="text"
                        value={destinationAddress}
                        onChange={handleDestinationChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </label>
                    {validationStatus.destination && (
                      <p className={`mt-1 text-sm ${validationStatus.destination.includes('Invalid') ? 'text-red-600' : 'text-green-600'}`}>
                        {validationStatus.destination}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount (XLM)
                      <input
                        type="number"
                        step="0.0000001"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Secret Key
                      <input
                        type="password"
                        value={secret}
                        onChange={handleSecretChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </label>
                    {validationStatus.secret && (
                      <p className={`mt-1 text-sm ${validationStatus.secret.includes('Invalid') ? 'text-red-600' : 'text-green-600'}`}>
                        {validationStatus.secret}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Send Payment
                  </button>
                </form>
                {status && (
                  <div className={`mt-4 p-4 rounded-md ${status.includes('Error') ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <p className="text-sm">{status}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
