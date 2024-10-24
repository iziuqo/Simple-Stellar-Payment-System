// File: pages/index.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

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
                      Your Public Key
                      <input
                        type="text"
                        value={inputPublicKey}
                        onChange={(e) => setInputPublicKey(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </label>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Continue
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
