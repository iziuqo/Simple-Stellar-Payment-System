// File: pages/api/payment-listener.js
import { Readable } from 'stream';
import StellarSdk from 'stellar-sdk';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publicKey } = req.query;

  if (!publicKey) {
    return res.status(400).json({ error: 'Public key is required' });
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Create Stellar server instance
  const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

  // Create payment stream
  const es = new Readable({
    read() {}
  });

  // Handle client disconnect
  res.socket.on('close', () => {
    es.destroy();
  });

  try {
    // Start listening for payments
    const paymentsStream = server
      .payments()
      .forAccount(publicKey)
      .cursor('now')
      .stream({
        onmessage: async (payment) => {
          if (payment.type !== 'payment') return;

          try {
            // Get transaction details
            const transaction = await server.transactions()
              .transaction(payment.transaction_hash)
              .call();

            // Get operation details
            const operation = await server.operations()
              .operation(payment.id)
              .call();

            if (operation.type === 'payment' && operation.asset_type === 'native') {
              const data = {
                type: 'payment',
                amount: operation.amount,
                from: operation.from,
                to: operation.to,
                timestamp: transaction.created_at,
                transactionId: payment.transaction_hash
              };

              // Send the payment data to the client
              res.write(`data: ${JSON.stringify(data)}\n\n`);
            }
          } catch (error) {
            console.error('Error processing payment:', error);
          }
        }
      });

    // Clean up on client disconnect
    res.socket.on('close', () => {
      paymentsStream();
    });
  } catch (error) {
    console.error('Stream error:', error);
    res.end();
  }
}
