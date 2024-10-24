// File: pages/dashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import StellarSdk from 'stellar-sdk';
import TransactionStatus from '../components/TransactionStatus';
import PaymentNotification from '../components/PaymentNotification';
import TransactionHistory from '../components/TransactionHistory';

export default function Dashboard() {
  const { publicKey, balance, logout, refreshBalance, lastReceivedPayment } = useAuth();
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState('');
  const [validationStatus, setValidationStatus] = useState({});
  const [lastPaymentTimestamp, setLastPaymentTimestamp] = useState('');
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    if (typeof window !== 'undefined' && !publicKey) {
      router.push('/');
    }
  }, [publicKey, router]);

  // Show loading state while checking authentication
  if (typeof window !== 'undefined' && !publicKey) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will be handled by the useEffect above
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if there's an error
      router.push('/');
    }
  };

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
      // Create Stellar server instance
      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      
      // Create keypair from secret
      const sourceKeypair = StellarSdk.Keypair.fromSecret(secret);
      
      // Load the source account
      const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
      
      // Build transaction
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destinationAddress,
            asset: StellarSdk.Asset.native(),
            amount: amount.toString(),
          })
        )
        .setTimeout(30)
        .build();

      // Sign and submit transaction
      transaction.sign(sourceKeypair);
      const result = await server.submitTransaction(transaction);

      setStatus(`Success! Transaction ID: ${result.id}`);
      setSecret('');
      setAmount('');
      setDestinationAddress('');
      refreshBalance();
      
      // Set up a few more refreshes to catch any delay in the blockchain
      const refreshTimes = [1000, 3000, 5000];
      refreshTimes.forEach(time => {
        setTimeout(() => refreshBalance(), time);
      });
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
    <>
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col sm:py-12">
        <div className="relative py-3 sm:max-w-4xl sm:mx-auto">
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Stellar Payments</h1>
                <button
                  onClick={handleLogout}
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

          {/* Transaction History */}
          <TransactionHistory publicKey={publicKey} />
        </div>
      </div>
      {lastReceivedPayment && <PaymentNotification payment={lastReceivedPayment} />}
    </>
  );
}
