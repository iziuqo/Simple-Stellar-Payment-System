// File: components/PaymentNotification.js
import { ExternalLink } from 'lucide-react';

export default function PaymentNotification({ payment }) {
  if (!payment) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md animate-slide-in">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-400">Payment Received!</h3>
          <span className="text-sm text-gray-400">Just now</span>
        </div>
        <div className="mt-2">
          <p className="text-white">Amount: <span className="font-mono">{payment.amount} XLM</span></p>
          <p className="text-gray-400 text-sm">From: {payment.from.slice(0, 4)}...{payment.from.slice(-4)}</p>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${payment.transactionId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center text-indigo-400 hover:text-indigo-300 text-sm"
          >
            View Transaction
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}
