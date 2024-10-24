// File: components/TransactionStatus.js
export default function TransactionStatus({ status }) {
  if (!status) return null;

  // If it's a success message with transaction ID
  if (status.includes('Transaction ID:')) {
    const txId = status.split('Transaction ID: ')[1];
    return (
      <div className="mt-4 p-4 rounded-md bg-green-50">
        <p className="text-sm text-green-800">Success!</p>
        <div className="mt-2 text-sm">
          <p>Transaction ID: <span className="font-mono">{txId}</span></p>
          <div className="mt-2 space-y-1">
            <p>View transaction details:</p>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 block"
            >
              → Stellar Expert Explorer
            </a>
            <a
              href={`https://horizon-testnet.stellar.org/transactions/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 block"
            >
              → Horizon API (raw data)
            </a>
          </div>
        </div>
      </div>
    );
  }

  // For error messages
  if (status.includes('Error:')) {
    return (
      <div className="mt-4 p-4 rounded-md bg-red-50">
        <p className="text-sm text-red-800">{status}</p>
      </div>
    );
  }

  // For other status messages
  return (
    <div className="mt-4 p-4 rounded-md bg-gray-50">
      <p className="text-sm text-gray-800">{status}</p>
    </div>
  );
}
