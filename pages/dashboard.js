// File: pages/dashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import StellarSdk from 'stellar-sdk';
import TransactionStatus from '../components/TransactionStatus';
import TransactionHistory from '../components/TransactionHistory';
import NotificationStack from '../components/NotificationStack';
import { Copy, LogOut, RefreshCw, Send } from 'lucide-react';

export default function Dashboard() {
  const { publicKey, balance, logout, refreshBalance } = useAuth();
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState('');
  const [validationStatus, setValidationStatus] = useState({});
  const [lastPaymentTimestamp, setLastPaymentTimestamp] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    if (typeof window !== 'undefined' && !publicKey) {
      router.push('/');
    }
  }, [publicKey, router]);

  // Add polling for payments
  useEffect(() => {
    let interval;
    if (publicKey) {
      refreshBalance();
      
      interval = setInterval(async () => {
        try {
          const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
          const payments = await server
            .payments()
            .forAccount(publicKey)
            .limit(1)
            .order('desc')
            .call();

          if (payments.records.length > 0) {
            const latestPayment = payments.records[0];
            
            if (latestPayment.created_at !== lastPaymentTimestamp) {
              setLastPaymentTimestamp(latestPayment.created_at);
              
              if (latestPayment.type === 'payment' && latestPayment.to === publicKey) {
                const notification = {
                  type: 'payment',
                  amount: latestPayment.amount,
                  from: latestPayment.from,
                  to: latestPayment.to,
                  timestamp: latestPayment.created_at,
                  transactionId: latestPayment.transaction_hash
                };
                
                window.addNotification(notification);
                refreshBalance();
              }
            }
          }
        } catch (error) {
          console.error('Error checking for payments:', error);
        }
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [publicKey, lastPaymentTimestamp]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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

  // Loading state
  if (typeof window !== 'undefined' && !publicKey) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white text-lg">Loading...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Stellar Pay</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBalanceRefresh}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                title="Refresh Balance"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Account Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Public Key</label>
                  <div className="mt-1 flex items-center justify-between bg-gray-800 rounded-lg p-3">
                    <code className="text-xs break-all">{publicKey}</code>
                    <button
                      onClick={() => copyToClipboard(publicKey)}
                      className="ml-2 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Balance</label>
                  <div className="mt-1 text-2xl font-bold">{balance} XLM</div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg mt-6">
              <h2 className="text-lg font-semibold mb-4">Send Payment</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">
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
                      className="mt-1 block w-full rounded-lg border-gray-600 bg-gray-800 text-white focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </label>
                  {validationStatus.destination && (
                    <p className={`mt-1 text-sm ${validationStatus.destination.includes('Invalid') ? 'text-red-400' : 'text-green-400'}`}>
                      {validationStatus.destination}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Amount (XLM)
                    <input
                      type="number"
                      step="0.0000001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-1 block w-full rounded-lg border-gray-600 bg-gray-800 text-white focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
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
                      className="mt-1 block w-full rounded-lg border-gray-600 bg-gray-800 text-white focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </label>
                  {validationStatus.secret && (
                    <p className={`mt-1 text-sm ${validationStatus.secret.includes('Invalid') ? 'text-red-400' : 'text-green-400'}`}>
                      {validationStatus.secret}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Payment</span>
                </button>
              </form>

              <TransactionStatus status={status} />
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <TransactionHistory publicKey={publicKey} />
          </div>
        </div>
      </main>

      {/* Notifications */}
      <NotificationStack />
      {showCopied && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          Copied to clipboard
        </div>
      )}
    </div>
  );
}
