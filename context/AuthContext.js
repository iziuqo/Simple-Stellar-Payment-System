// File: context/AuthContext.js (add new functions)
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import StellarSdk from 'stellar-sdk';

export function AuthProvider({ children }) {
  // ... existing code ...

  const [lastReceivedPayment, setLastReceivedPayment] = useState(null);
  const eventSourceRef = useRef(null);

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
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
      };

      eventSourceRef.current = eventSource;
    }
  };

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

  // Add lastReceivedPayment to the context value
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
