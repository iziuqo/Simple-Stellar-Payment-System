// File: pages/dashboard.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import StellarSdk from 'stellar-sdk';
import TransactionStatus from '../components/TransactionStatus';

export default function Dashboard() {
  const { publicKey, balance, logout, refreshBalance } = useAuth();
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState('');
  const [validationStatus, setValidationStatus] = useState({});
  const router = useRouter();

  // If not logged in, redirect to login
  if (typeof window !== 'undefined' && !publicKey) {
    router.push('/');
    return null;
  }

  const validateInput = (input, type) => {
    try {
      if (type === 'destination') {
        StellarSdk.Keypair.fromPublicKey(input);
        setValidationStatus(prev => ({...prev, destination: 'Valid destination address'}));
      } else if (type === 'secret') {
        const keypair = StellarSdk.Keypair.fromSecret(input);
        // Verify the secret key matches the logged-in public key
        if (keypair.publicKey() !== publicKey) {
          setValidationStatus(prev => ({...prev, secret: 'Secret key does not match your account'}));
          return false;
        }
        setValidationStatus(prev => ({...prev, secret: 'Valid secret key'}));
      }
      return true;
    } catch (error) {
      setValidationStatus(prev => ({...prev, [type]: `Invalid ${type}: ${error.message}`}));
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setSecret('');
        setAmount('');
        // Immediately refresh the balance
        refreshBalance();
        // Set up a few more refreshes to catch any delay in the blockchain
        const refreshTimes = [1000, 3000, 5000]; // Refresh after 1s, 3s, and 5s
        refreshTimes.forEach(time => {
          setTimeout(() => refreshBalance(), time);
        });
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const handleBalanceRefresh = () => {
    setStatus('Refreshing balance...');
    refreshBalance();
    setTimeout(() => {
      setStatus('Balance updated');
      setTimeout(() => {
        if (status === 'Balance updated') {
          setStatus('');
        }
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Stellar Payments</h1>
              <button
                onClick={logout}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Logout
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <p className="text-sm text-gray-600">Your Public Key:</p>
              <p className="text-xs text-gray-800 break-all">{publicKey}</p>
              <div className="mt-2 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Balance:</p>
                  <p className="text-xl font-bold">{balance} XLM</p>
                </div>
                <button
                  onClick={handleBalanceRefresh}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  ↻ Refresh
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Destination Address
                  <input
                    type="text"
                    value={destinationAddress}
                    onChange={(e) => {
                      setDestinationAddress(e.target.value);
                      if (e.target.value.length >= 56) {
                        validateInput(e.target.value, 'destination');
                      }
                    }}
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
                    onChange={(e) => {
                      setSecret(e.target.value);
                      if (e.target.value.length >= 56) {
                        validateInput(e.target.value, 'secret');
                      }
                    }}
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

            <TransactionStatus status={status} />
          </div>
        </div>
      </div>
    </div>
  );
}
