// File: components/PaymentNotification.js
export default function PaymentNotification({ payment }) {
  if (!payment) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-green-50 p-4 rounded-lg shadow-lg border border-green-200 animate-slide-in z-50">
      <h3 className="text-green-800 font-semibold">Payment Received!</h3>
      <div className="mt-2 text-sm text-green-700">
        <p>Amount: {payment.amount} XLM</p>
        <p>From: {payment.from}</p>
        <p className="mt-2">
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${payment.transactionId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-800 hover:text-green-900 underline"
          >
            View Transaction
          </a>
        </p>
      </div>
    </div>
  );
}
