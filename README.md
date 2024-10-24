# Stellar Payment System v7.0.0

A comprehensive web application for making payments on the Stellar testnet network with advanced real-time notifications and modern UI. Live demo: https://simple-stellar-payment-system.vercel.app/

## Features

### v7.0.0 (Current)
- Enhanced real-time notification system
- Stacked notifications with animations
- Improved notification visibility and accessibility
- Manual notification dismissal
- Better mobile responsiveness for notifications
- Notification persistence
- Smart notification stacking
- Improved UI/UX with dark theme
- Copy to clipboard functionality
- Better error feedback

### v6.0.0
- Modern dark theme design
- Enhanced responsive layout
- Improved typography and spacing
- Icon integration
- Better visual hierarchy
- Smooth transitions and animations
- Enhanced transaction history visualization
- Improved notification system
- Mobile-optimized interface

### v5.0.0
- Improved session management and logout functionality
- Enhanced authentication flow
- Better state cleanup
- Code optimization
- Fixed transaction history persistence
- Improved error handling
- Better component organization
- Smoother transitions

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
- Lucide Icons

## Features

### Real-time Notifications
- Stacked notification system
- Auto-dismiss after 5 seconds
- Manual dismiss option
- Smooth animations
- Mobile responsive
- Transaction links
- Clear visual hierarchy

### Security
- Secret keys never stored
- Public keys stored in localStorage
- All transactions occur client-side
- Testnet only - do not use with mainnet keys
- Automatic key validation
- Secure state management

### Transaction Management
- Complete transaction history
- Real-time updates
- Color-coded transactions
- Quick access to details
- Auto-refresh capability
- Manual refresh option

### User Interface
- Modern dark theme
- Responsive design
- Touch-friendly
- Smooth animations
- Clear feedback
- Intuitive layout

## Usage

1. Authentication:
   - Enter your Stellar public key to log in
   - Secure session management
   - Clean logout functionality

2. Making Payments:
   - Enter destination Stellar address
   - Specify amount in XLM
   - Enter your secret key
   - Submit payment
   - View real-time transaction status

3. Receiving Payments:
   - Instant notifications
   - Real-time balance updates
   - Transaction details readily available
   - Clear success indicators

4. Transaction History:
   - Complete list of sent/received payments
   - Color-coded for easy identification
   - One-click transaction details
   - Auto-refresh capability

## Development

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Run development server:
```bash
npm run dev
```
4. Build for production:
```bash
npm run build
```

## Deployment

This app can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel (recommended)
- Surge
- Amazon S3

No special server configuration required.

## Notifications System

The notification system provides:
- Stacked notifications
- Auto-dismiss after 5 seconds
- Manual dismiss option
- Smooth enter/exit animations
- Mobile-friendly positioning
- Clear transaction information
- Direct links to transaction details

## Browser Support

- Chrome
- Firefox
- Safari
- Edge
- Mobile browsers

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
