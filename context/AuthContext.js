// File: context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import StellarSdk from 'stellar-sdk';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const storedPublicKey = localStorage.getItem('stellarPublicKey');
    if (storedPublicKey) {
      setPublicKey(storedPublicKey);
      fetchBalance(storedPublicKey);
    }
    setLoading(false);
  }, []);

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
      
      // Store in localStorage and state
      localStorage.setItem('stellarPublicKey', publicKey);
      setPublicKey(publicKey);
      await fetchBalance(publicKey);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('stellarPublicKey');
    setPublicKey(null);
    setBalance(null);
  };

  const refreshBalance = () => {
    if (publicKey) {
      fetchBalance(publicKey);
    }
  };

  return (
    <AuthContext.Provider value={{
      publicKey,
      balance,
      loading,
      login,
      logout,
      refreshBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
