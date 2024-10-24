// File: components/TransactionHistory.js
import { useState, useEffect } from 'react';
import StellarSdk from 'stellar-sdk';
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';

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
      const interval = setInterval(fetchTransactions, 30000);
      return () => clearInterval(interval);
    }
  }, [publicKey]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 7
    }).format(amount);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 rounded-lg p-4 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>No transactions yet</p>
          <p className="text-sm mt-2">Your transaction history will appear here</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-4 group hover:bg-gray-50 -mx-4 px-4 transition-colors duration-200 cursor-pointer"
              onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${tx.transactionId}`, '_blank')}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'Received' 
                    ? 'bg-green-100 text-green-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {tx.type === 'Received' ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                
                <div>
                  <div className="font-medium text-gray-900">
                    {tx.type === 'Received' ? 'From: ' : 'To: '}
                    {formatAddress(tx.type === 'Received' ? tx.from : tx.to)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(tx.timestamp)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className={`text-right ${
                  tx.type === 'Received' 
                    ? 'text-green-600' 
                    : 'text-blue-600'
                }`}>
                  <div className="font-medium">
                    {tx.type === 'Received' ? '+' : '-'}${formatAmount(tx.amount)}
                  </div>
                  <div className="text-sm opacity-75">XLM</div>
                </div>
                
                <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
