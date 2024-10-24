# Stellar Payment System v5.0.0

A comprehensive web application for making payments on the Stellar testnet network with real-time payment notifications, transaction history, and improved session management. Live demo: https://simple-stellar-payment-system.vercel.app/

## Features

### v5.0.0 (Current)
- Improved session management and logout functionality
- Enhanced authentication flow
- Better state cleanup on logout
- Smooth transitions between pages
- Loading states during authentication
- Fixed transaction history persistence
- Improved error handling
- Better component organization
- Code optimization and cleanup

### v4.0.0
- Complete transaction history view
- Color-coded sent/received transactions
- Auto-refreshing transaction list
- Detailed transaction information
- Transaction links to Stellar Explorer
- Truncated addresses with full view on hover
- Loading states and error handling
- Improved UI layout for better readability

### v3.0.0
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
   - Secure session management
   - Clean logout functionality

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

4. Transaction History:
   - Complete list of sent and received payments
   - Color-coded for easy identification
   - Real-time updates
   - Links to detailed transaction info

## Security Features

- Complete session cleanup on logout
- Secret keys never stored
- Public keys stored in localStorage
- All transactions occur client-side
- Automatic key validation
- Secure state management
- Testnet only - do not use with mainnet keys

## Transaction Verification

Transactions can be verified through:

1. Transaction History:
   - Complete list of all account transactions
   - Direct links to Stellar Explorer
   - Real-time updates

2. Stellar Expert Explorer:
   - Click the provided link in success message or transaction history
   - View detailed transaction information

3. Pop-up Notifications:
   - Immediate notification of received payments
   - Links to transaction details

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

## State Management

The application manages state through:
1. React Context for global state
2. Local state for UI components
3. localStorage for session persistence
4. Clean state removal on logout

## Error Handling

- Comprehensive error catching
- User-friendly error messages
- Automatic recovery attempts
- Graceful fallbacks
- Clear validation feedback

## Performance

- Optimized re-renders
- Efficient state updates
- Proper cleanup of resources
- Smooth transitions
- Responsive design
