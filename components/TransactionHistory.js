// File: components/TransactionHistory.js
import { useState, useEffect } from 'react';
import StellarSdk from 'stellar-sdk';

export default function TransactionHistory({ publicKey }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      const payments = await server
        .payments()
        .forAccount(publicKey)
        .order('desc')
        .limit(20)
        .call();

      const enrichedTransactions = await Promise.all(
        payments.records.map(async (payment) => {
          if (payment.type !== 'payment' || payment.asset_type !== 'native') {
            return null;
          }

          const transaction = await server
            .transactions()
            .transaction(payment.transaction_hash)
            .call();

          return {
            id: payment.id,
            type: payment.to === publicKey ? 'Received' : 'Sent',
            amount: payment.amount,
            from: payment.from,
            to: payment.to,
            timestamp: payment.created_at,
            transactionId: payment.transaction_hash,
            memo: transaction.memo || '',
          };
        })
      );

      setTransactions(enrichedTransactions.filter(tx => tx !== null));
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchTransactions();
      // Refresh every 30 seconds
      const interval = setInterval(fetchTransactions, 30000);
      return () => clearInterval(interval);
    }
  }, [publicKey]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          <button
            onClick={fetchTransactions}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            ↻ Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount (XLM)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(tx.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.type === 'Received'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {tx.amount}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <span title={tx.from}>{formatAddress(tx.from)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <span title={tx.to}>{formatAddress(tx.to)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${tx.transactionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View →
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
