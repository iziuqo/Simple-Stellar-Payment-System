// File: components/TransactionStatus.js
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function TransactionStatus({ status }) {
  if (!status) return null;

  if (status.includes('Success')) {
    const txId = status.split('Transaction ID: ')[1];
    return (
      <div className="mt-4 bg-gray-800/50 border border-green-500/20 rounded-lg p-4 animate-fade-in">
        <div className="flex items-center text-green-400">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>Payment Successful!</span>
        </div>
        <div className="mt-2">
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300"
          >
            View Transaction
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    );
  }

  if (status.includes('Error')) {
    return (
      <div className="mt-4 bg-gray-800/50 border border-red-500/20 rounded-lg p-4 animate-fade-in">
        <div className="flex items-center text-red-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{status}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4 animate-fade-in">
      <div className="flex items-center text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        <span>{status}</span>
      </div>
    </div>
  );
}
