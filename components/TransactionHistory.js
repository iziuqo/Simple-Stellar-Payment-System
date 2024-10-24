// File: components/TransactionHistory.js
import { useState, useEffect } from 'react';
import StellarSdk from 'stellar-sdk';
import { RefreshCw, ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';

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

          try {
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
          } catch (error) {
            console.error('Error fetching transaction details:', error);
            return null;
          }
        })
      );

      setTransactions(enrichedTransactions.filter(tx => tx !== null));
      setError(null);
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
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Transaction History</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        <div className="text-red-400 text-center py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Transaction History</h2>
          <button
            onClick={fetchTransactions}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh transactions"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-4 text-sm">
                      {formatDate(tx.timestamp)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {tx.type === 'Received' ? (
                          <ArrowDownLeft className="w-4 h-4 text-green-400 mr-2" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-blue-400 mr-2" />
                        )}
                        <span
                          className={`text-sm ${
                            tx.type === 'Received'
                              ? 'text-green-400'
                              : 'text-blue-400'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {tx.amount} XLM
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400">
                      <span title={tx.from} className="hover:text-white">
                        {formatAddress(tx.from)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400">
                      <span title={tx.to} className="hover:text-white">
                        {formatAddress(tx.to)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${tx.transactionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white inline-flex items-center rounded-lg hover:bg-gray-800 transition-colors"
                        title="View transaction details"
                      >
                        <ExternalLink className="w-4 h-4" />
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
