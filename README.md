# Finance Management Application - Frontend

React-based frontend application for managing personal finances with a modern, responsive UI.

## 🚀 Features

- **Dashboard**: Visual overview of financial health with charts and summary cards
- **Investments Management**: Add, edit, delete, and track investments with gain/loss calculations
- **Assets Management**: Manage personal assets with categorization
- **Liabilities Management**: Track debts and liabilities
- **Real-time Updates**: Automatic refresh of financial data
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface built with React and CSS3

## 📋 Prerequisites

- **Node.js 16+** and npm
- **Backend API** running on `http://localhost:8080` (see [FinanceApp-backend](https://github.com/vedesai/FinanceApp-backend))

## 🛠️ Technology Stack

- **React 18.2.0** - UI library
- **React Router DOM 6.20.0** - Client-side routing
- **Axios 1.6.2** - HTTP client for API calls
- **Recharts 3.5.0** - Chart library for data visualization
- **Lucide React 0.554.0** - Icon library
- **React Scripts 5.0.1** - Build tooling

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vedesai/FinanceApp-frontend.git
cd FinanceApp-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Endpoint

The frontend is configured to connect to the backend API at `http://localhost:8080` by default. This is set in `package.json` as a proxy:

```json
{
  "proxy": "http://localhost:8080"
}
```

To change the API endpoint, update `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://your-backend-url:8080';
```

### 4. Start the Development Server

```bash
npm start
```

The application will open in your browser at `http://localhost:3001`

## 🏗️ Project Structure

```
frontend/
├── public/
│   ├── index.html          # HTML template
│   └── logo.png            # Application logo
├── src/
│   ├── components/         # React components
│   │   ├── Dashboard.js    # Dashboard component
│   │   ├── Investments.js  # Investments management
│   │   ├── Assets.js        # Assets management
│   │   └── Liabilities.js # Liabilities management
│   ├── services/
│   │   └── api.js          # API service layer
│   ├── App.js              # Main app component
│   ├── App.css             # App styles
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
└── .gitignore             # Git ignore rules
```

## 📱 Features Overview

### Dashboard

- **Financial Summary Cards**: Total Assets, Investments, Liabilities, and Net Worth
- **Visual Charts**: Graphical representation of financial data
- **Quick Stats**: Count of assets, investments, and liabilities
- **Real-time Updates**: Automatically refreshes when data changes

### Investments Management

- **View All Investments**: List view with investment details
- **Add Investment**: Form to add new investments
- **Edit Investment**: Update existing investment details
- **Delete Investment**: Remove investments
- **Gain/Loss Calculation**: Automatic calculation of profit/loss
- **CSV Export**: Export investment data

### Assets Management

- **View All Assets**: List view with asset details
- **Add Asset**: Form to add new assets
- **Edit Asset**: Update existing asset details
- **Delete Asset**: Remove assets
- **Categorization**: Organize assets by type
- **CSV Export**: Export asset data

### Liabilities Management

- **View All Liabilities**: List view with liability details
- **Add Liability**: Form to add new liabilities
- **Edit Liability**: Update existing liability details
- **Delete Liability**: Remove liabilities
- **Categorization**: Organize liabilities by type
- **CSV Export**: Export liability data

## 🎨 UI Components

### Navigation

The application features a sidebar navigation with:
- Dashboard icon and link
- Investments icon and link
- Assets icon and link
- Liabilities icon and link

### Forms

All forms include:
- Input validation
- Error handling
- Success notifications
- Responsive design

### Data Tables

- Sortable columns
- Action buttons (Edit/Delete)
- Responsive layout
- Empty state messages

## 🔧 Available Scripts

### `npm start`

Runs the app in development mode at `http://localhost:3001`

### `npm build`

Builds the app for production to the `build` folder.

```bash
npm run build
```

### `npm test`

Launches the test runner in interactive watch mode.

```bash
npm test
```

### `npm eject`

**Note: This is a one-way operation. Once you `eject`, you can't go back!**

Ejects from Create React App, giving you full control over configuration.

## 🌐 API Integration

The frontend communicates with the backend API through the `api.js` service layer:

```javascript
// Example API calls
import api from './services/api';

// Get all investments
const investments = await api.get('/investments');

// Create investment
await api.post('/investments', investmentData);

// Update investment
await api.put(`/investments/${id}`, investmentData);

// Delete investment
await api.delete(`/investments/${id}`);
```

### API Endpoints Used

- `GET /api/dashboard` - Get financial summary
- `GET /api/investments` - Get all investments
- `POST /api/investments` - Create investment
- `PUT /api/investments/{id}` - Update investment
- `DELETE /api/investments/{id}` - Delete investment
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Create asset
- `PUT /api/assets/{id}` - Update asset
- `DELETE /api/assets/{id}` - Delete asset
- `GET /api/liabilities` - Get all liabilities
- `POST /api/liabilities` - Create liability
- `PUT /api/liabilities/{id}` - Update liability
- `DELETE /api/liabilities/{id}` - Delete liability

## 🎯 Key Features

### Responsive Design

- Mobile-friendly layout
- Adaptive components
- Touch-friendly interactions

### Error Handling

- Network error handling
- User-friendly error messages
- Retry mechanisms

### Data Validation

- Form validation
- Input sanitization
- Type checking

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Deploy to Static Hosting

The `build` folder can be deployed to any static hosting service:
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload `build` folder contents
- **GitHub Pages**: Use `gh-pages` package

### Environment Variables

For production, you may want to set environment variables:

```bash
REACT_APP_API_URL=https://your-backend-api.com
```

Then update `src/services/api.js` to use `process.env.REACT_APP_API_URL`.

## 🐛 Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure:
1. Backend CORS is configured to allow your frontend origin
2. Backend is running and accessible
3. API URL is correct in `src/services/api.js`

### Port Already in Use

If port 3001 is already in use:

```bash
# Kill the process using port 3001
lsof -ti:3001 | xargs kill -9

# Or use a different port
PORT=3002 npm start
```

### Build Errors

Clear cache and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🔗 Related Repositories

- **Backend**: [FinanceApp-backend](https://github.com/vedesai/FinanceApp-backend)

## 📞 Support

For issues and questions, please open an issue in the GitHub repository.

## 🎨 Design Notes

- Color scheme: Modern, professional palette
- Typography: Clean, readable fonts
- Icons: Lucide React icon library
- Charts: Recharts for data visualization
- Responsive breakpoints: Mobile-first approach

