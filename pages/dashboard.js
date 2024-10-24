// File: pages/dashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import StellarSdk from 'stellar-sdk';
import TransactionStatus from '../components/TransactionStatus';
import TransactionHistory from '../components/TransactionHistory';
import NotificationStack from '../components/NotificationStack';
import { 
  Search, 
  Bell, 
  QrCode, 
  Send, 
  Plus, 
  Home, 
  PieChart, 
  CreditCard, 
  Settings, 
  X 
} from 'lucide-react';

export default function Dashboard() {
  const { publicKey, balance, logout, refreshBalance } = useAuth();
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState('');
  const [validationStatus, setValidationStatus] = useState({});
  const [lastPaymentTimestamp, setLastPaymentTimestamp] = useState('');
  const [showSendForm, setShowSendForm] = useState(false);
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

  const validateInput = (input, type) => {
    try {
      if (type === 'destination') {
        StellarSdk.Keypair.fromPublicKey(input);
        setValidationStatus(prev => ({...prev, destination: 'Valid destination address'}));
      } else if (type === 'secret') {
        const keypair = StellarSdk.Keypair.fromSecret(input);
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
      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      const sourceKeypair = StellarSdk.Keypair.fromSecret(secret);
      const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
      
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

      transaction.sign(sourceKeypair);
      const result = await server.submitTransaction(transaction);

      setStatus(`Success! Transaction ID: ${result.id}`);
      setSecret('');
      setAmount('');
      setDestinationAddress('');
      setShowSendForm(false);
      refreshBalance();
      
      const refreshTimes = [1000, 3000, 5000];
      refreshTimes.forEach(time => {
        setTimeout(() => refreshBalance(), time);
      });
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  // Loading state
  if (typeof window !== 'undefined' && !publicKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white py-4 px-4 sm:px-6">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-medium">
                {publicKey.slice(0, 2)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="w-6 h-6 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                1
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Balance Card */}
        <div className="bg-primary-500 rounded-2xl p-6 text-white mb-8">
          <h2 className="text-sm opacity-80 mb-1">Your Balance</h2>
          <div className="text-3xl font-bold mb-4">
            ${parseFloat(balance).toFixed(2)}
          </div>
          <div className="text-sm opacity-80 mb-1">Account ID</div>
          <div className="flex justify-between items-center">
            <div className="font-mono">
              {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
            </div>
            <div className="opacity-80">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <button className="flex flex-col items-center" onClick={() => setShowSendForm(true)}>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-2">
              <Send className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-xs text-gray-600">Send</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-2">
              <Plus className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-xs text-gray-600">Add</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-2">
              <QrCode className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-xs text-gray-600">QR Code</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-2">
              <Settings className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-xs text-gray-600">More</span>
          </button>
        </div>

        {/* Overview Section */}
        <div className="bg-white rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Overview</h2>
            <select className="text-primary-600 text-sm bg-transparent border-none">
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Daily</option>
            </select>
          </div>

          <TransactionHistory publicKey={publicKey} />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex justify-around">
          <button className="flex flex-col items-center text-primary-600">
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <PieChart className="w-6 h-6" />
            <span className="text-xs mt-1">Analytics</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <CreditCard className="w-6 h-6" />
            <span className="text-xs mt-1">Card</span>
          </button>
          <button className="flex flex-col items-center text-gray-400" onClick={handleLogout}>
            <Settings className="w-6 h-6" />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </nav>

      {/* Send Money Modal */}
      {showSendForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Transfer</h2>
              <button 
                onClick={() => setShowSendForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Transfer To
                  <input
                    type="text"
                    value={destinationAddress}
                    onChange={(e) => {
                      setDestinationAddress(e.target.value);
                      if (e.target.value.length >= 56) {
                        validateInput(e.target.value, 'destination');
                      }
                    }}
                    className="mt-1 form-input"
                    required
                  />
                </label>
                {validationStatus.destination && (
                  <p className={`mt-1 text-sm ${
                    validationStatus.destination.includes('Invalid') 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {validationStatus.destination}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount (XLM)
                  <div className="mt-1 relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.0000001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 form-input"
                      required
                    />
                  </div>
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
                    className="mt-1 form-input"
                    required
                  />
                </label>
                {validationStatus.secret && (
                  <p className={`mt-1 text-sm ${
                    validationStatus.secret.includes('Invalid') 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {validationStatus.secret}
                  </p>
                )}
              </div>

              {status && <TransactionStatus status={status} />}

              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSendForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Transfer Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NotificationStack />
    </div>
  );
}
