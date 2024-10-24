# Stellar Payment System v2.0.0

A secure web application for making payments on the Stellar testnet network. Live demo: https://simple-stellar-payment-system.vercel.app/

## Features

### v2.0.0 (Current)
- User authentication with Stellar public key
- Real-time balance display with auto-refresh
- Transaction history links to Stellar Explorer
- Automatic balance updates after transactions
- Key validation and verification
- Improved UI with session management
- Manual balance refresh option
- Secure client-side key handling

### v1.0.0
- Basic payment functionality
- Key validation
- Transaction status feedback
- Testnet support

## Technology Stack

- Next.js
- Tailwind CSS
- Stellar SDK
- Vercel Deployment

## Usage

1. Authentication:
   - Enter your Stellar public key to log in
   - Your balance will be displayed automatically

2. Making Payments:
   - Enter destination Stellar address
   - Specify amount in XLM
   - Enter your secret key to sign the transaction
   - Submit payment
   - View transaction details via provided links

3. Balance Management:
   - Balance updates automatically after transactions
   - Use refresh button for manual updates
   - View transaction results in Stellar Explorer

## Security Notes

- Secret keys are never stored
- Public keys stored in localStorage
- All transactions occur server-side
- Testnet only - do not use with mainnet keys
- Automatic key validation and verification

## Transaction Verification

Successful transactions can be verified using:

1. Stellar Expert Explorer:
   - Click the provided link in success message
   - View detailed transaction information

2. Horizon API:
   - Raw transaction data available
   - Direct link provided with each transaction
