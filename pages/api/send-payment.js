// File: pages/api/send-payment.js
import StellarSdk from 'stellar-sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destinationAddress, amount, secret } = req.body;

  try {
    // Configure Stellar SDK for testnet
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secret);
    const sourcePublicKey = sourceKeypair.publicKey();

    // Load the source account
    const sourceAccount = await server.loadAccount(sourcePublicKey);

    // Create a payment transaction
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: await server.fetchBaseFee(),
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: destinationAddress,
          asset: StellarSdk.Asset.native(),
          amount: amount.toString(),
        })
      )
      .setTimeout(180)
      .build();

    // Sign the transaction
    transaction.sign(sourceKeypair);

    // Submit the transaction
    const result = await server.submitTransaction(transaction);

    return res.status(200).json({
      success: true,
      transactionId: result.id,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(400).json({
      error: error.message || 'Failed to process payment',
    });
  }
}
