# Stellar Payment System v1.0.0

A simple web application for making payments on the Stellar testnet network. Live demo: https://simple-stellar-payment-system.vercel.app/

## Features

- Send XLM payments on Stellar testnet
- Real-time key validation
- Transaction status feedback
- Secure client-side key handling
- Mobile-responsive UI

## Technology Stack

- Next.js
- Tailwind CSS
- Stellar SDK
- Vercel Deployment

## Usage

1. Visit the deployed application
2. Enter the destination Stellar address
3. Specify the amount in XLM
4. Enter your secret key
5. Submit the transaction

## Transaction Verification

You can verify transactions using:

1. Stellar Expert Explorer:
   - https://stellar.expert/explorer/testnet/tx/{transaction_id}

2. Horizon API:
   - https://horizon-testnet.stellar.org/transactions/{transaction_id}

## Security Notes

- Secret keys are never stored
- All transactions occur server-side
- Testnet only - do not use with mainnet keys

## Version History

### v1.0.0
- Initial release
- Basic payment functionality
- Key validation
- Transaction status feedback
- Testnet support
