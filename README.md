# Stellar Payment System v3.0.0

A secure web application for making payments on the Stellar testnet network with real-time payment notifications. Live demo: https://simple-stellar-payment-system.vercel.app/

## Features

### v3.0.0 (Current)
- Real-time payment notifications for received payments
- Automatic balance updates for both sender and receiver
- Payment confirmation with transaction links
- Polling-based payment monitoring
- Enhanced error handling and validation
- Improved UI/UX with animations
- Works with static hosting (no backend required)

### v2.0.0
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
- Static Hosting Compatible

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

3. Receiving Payments:
   - Real-time balance updates
   - Pop-up notification when payment is received
   - Click transaction link to view details
   - Automatic balance refresh

4. Balance Management:
   - Balance updates automatically after transactions
   - Use refresh button for manual updates
   - View transaction results in Stellar Explorer

## Security Notes

- Secret keys are never stored
- Public keys stored in localStorage
- All transactions occur client-side
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

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Build static version: `npm run build`

## Deployment

This app can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Surge
- Amazon S3
- Any static file host

No special server configuration required.
