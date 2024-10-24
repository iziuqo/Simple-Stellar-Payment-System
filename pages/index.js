// File: pages/index.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { LogIn } from 'lucide-react';

export default function Home() {
  const { publicKey, login } = useAuth();
  const [inputPublicKey, setInputPublicKey] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const success = await login(inputPublicKey.trim());
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid public key');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // If already logged in, redirect to dashboard
  if (publicKey) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <h1 className="text-center text-3xl font-bold mb-8">Stellar Pay</h1>
        <div className="bg-gray-900 py-8 px-6 shadow rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Enter Your Public Key
                <input
                  type="text"
                  value={inputPublicKey}
                  onChange={(e) => setInputPublicKey(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-600 bg-gray-800 text-white focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </label>
            </div>
            
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Continue</span>
            </button>
          </form>

          <div className="mt-6">
            <p className="text-sm text-gray-400 text-center">
              Don't have a Stellar account?{' '}
              <a
                href="https://laboratory.stellar.org/#account-creator?network=test"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300"
              >
                Create one here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
