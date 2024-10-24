// File: context/AuthContext.js
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import StellarSdk from 'stellar-sdk';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastReceivedPayment, setLastReceivedPayment] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    // Check localStorage on mount
    const storedPublicKey = localStorage.getItem('stellarPublicKey');
    if (storedPublicKey) {
      setPublicKey(storedPublicKey);
      fetchBalance(storedPublicKey);
    }
    setLoading(false);
  }, []);

  // Start payment listener when publicKey changes
  useEffect(() => {
    if (publicKey) {
      startPaymentListener();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [publicKey]);

  const startPaymentListener = () => {
    if (publicKey && typeof window !== 'undefined') {
      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Start new connection
      const eventSource = new EventSource(`/api/payment-listener?publicKey=${publicKey}`);
      
      eventSource.onmessage = (event) => {
        const payment = JSON.parse(event.data);
        if (payment.to === publicKey) {
          setLastReceivedPayment(payment);
          refreshBalance();
          
          // Clear the payment notification after 5 seconds
          setTimeout(() => {
            setLastReceivedPayment(null);
          }, 5000);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          startPaymentListener();
        }, 5000);
      };

      eventSourceRef.current = eventSource;
    }
  };

  const fetchBalance = async (key) => {
    try {
      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(key);
      const xlmBalance = account.balances.find(b => b.asset_type === 'native');
      setBalance(xlmBalance ? xlmBalance.balance : '0');
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
    }
  };

  const login = async (publicKey) => {
    try {
      // Validate the public key format
      StellarSdk.Keypair.fromPublicKey(publicKey);
      
      // Verify account exists on the network
      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      await server.loadAccount(publicKey);
      
      // Store in localStorage and state
      localStorage.setItem('stellarPublicKey', publicKey);
      setPublicKey(publicKey);
      await fetchBalance(publicKey);
      
      // Start listening for payments
      startPaymentListener();
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    // Close payment listener
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    // Clear storage and state
    localStorage.removeItem('stellarPublicKey');
    setPublicKey(null);
    setBalance(null);
    setLastReceivedPayment(null);
  };

  const refreshBalance = async () => {
    if (publicKey) {
      await fetchBalance(publicKey);
    }
  };

  return (
    <AuthContext.Provider value={{
      publicKey,
      balance,
      loading,
      login,
      logout,
      refreshBalance,
      lastReceivedPayment,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
