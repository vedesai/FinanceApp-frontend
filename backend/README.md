# Finance Management Application - Backend

Spring Boot REST API backend for managing personal finances including investments, assets, and liabilities.

## 🚀 Features

- **Investments Management**: CRUD operations for investment tracking with support for mutual funds, stocks, and other investment types
- **Assets Management**: Track and manage personal assets with categorization
- **Liabilities Management**: Monitor debts and liabilities
- **Dashboard API**: Financial summary with net worth calculations
- **ICICIDirect Integration**: Automatic synchronization of mutual fund investments from ICICIDirect
- **Scheduled Sync**: Daily automatic sync of mutual fund data (configurable)
- **CSV Export**: Export data for investments, assets, and liabilities

## 📋 Prerequisites

- **Java 17** or higher
- **Maven 3.6+**
- **PostgreSQL 12+** database (AWS RDS recommended)
- **ICICIDirect API credentials** (optional, for mutual fund sync)

## 🛠️ Technology Stack

- **Spring Boot 3.2.0** - Application framework
- **Spring Data JPA** - Database abstraction layer
- **PostgreSQL** - Relational database
- **Spring WebFlux** - Reactive HTTP client for external APIs
- **Maven** - Build and dependency management

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vedesai/FinanceApp-backend.git
cd FinanceApp-backend
```

### 2. Database Configuration

#### Option A: Environment Variables (Recommended)

Set the following environment variables:

```bash
export DB_URL=jdbc:postgresql://your-rds-endpoint.region.rds.amazonaws.com:5432/financedb
export DB_USERNAME=your_db_username
export DB_PASSWORD=your_db_password
```

#### Option B: Update application.properties

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://your-rds-endpoint:5432/financedb
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. ICICIDirect Configuration (Optional)

If you want to use ICICIDirect integration for mutual fund sync:

```bash
export ICICIDIRECT_APP_KEY=your_app_key
export ICICIDIRECT_CLIENT_SECRET=your_client_secret
export ICICIDIRECT_USER_ID=your_user_id
export ICICIDIRECT_PASSWORD=your_password
```

Or update `application.properties`:

```properties
icicidirect.api.app-key=your_app_key_here
icicidirect.api.client-secret=your_client_secret_here
icicidirect.api.user-id=your_user_id_here
icicidirect.api.password=your_password_here
```

**Note**: Register for ICICIDirect API access at [ICICIDirect API Portal](https://api.icicidirect.com/apiuser/apihome)

### 4. Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

## 📡 API Endpoints

### Investments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/investments` | Get all investments |
| GET | `/api/investments/{id}` | Get investment by ID |
| POST | `/api/investments` | Create new investment |
| PUT | `/api/investments/{id}` | Update investment |
| DELETE | `/api/investments/{id}` | Delete investment |
| GET | `/api/investments/export` | Export investments as CSV |

**Investment Request Body Example:**
```json
{
  "investmentType": "Mutual Fund",
  "providerBroker": "ICICIDirect",
  "investmentAmount": 10000.00,
  "currentAmount": 12500.00,
  "schemeCode": "123456",
  "schemeName": "ABC Mutual Fund",
  "purchasedDate": "2023-01-15",
  "maturityDate": null
}
```

### Assets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assets` | Get all assets |
| GET | `/api/assets/{id}` | Get asset by ID |
| POST | `/api/assets` | Create new asset |
| PUT | `/api/assets/{id}` | Update asset |
| DELETE | `/api/assets/{id}` | Delete asset |
| GET | `/api/assets/export` | Export assets as CSV |

**Asset Request Body Example:**
```json
{
  "name": "Savings Account",
  "assetType": "Cash",
  "value": 50000.00,
  "description": "Primary savings account"
}
```

### Liabilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/liabilities` | Get all liabilities |
| GET | `/api/liabilities/{id}` | Get liability by ID |
| POST | `/api/liabilities` | Create new liability |
| PUT | `/api/liabilities/{id}` | Update liability |
| DELETE | `/api/liabilities/{id}` | Delete liability |
| GET | `/api/liabilities/export` | Export liabilities as CSV |

**Liability Request Body Example:**
```json
{
  "name": "Home Loan",
  "liabilityType": "Loan",
  "amount": 500000.00,
  "description": "Home mortgage"
}
```

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get financial summary |

**Dashboard Response Example:**
```json
{
  "totalAssets": 100000.00,
  "totalInvestments": 50000.00,
  "totalAssetsWithInvestments": 150000.00,
  "totalLiabilities": 50000.00,
  "netWorth": 100000.00,
  "assetCount": 5,
  "investmentCount": 10,
  "liabilityCount": 2
}
```

### ICICIDirect Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/icicidirect/sync` | Manually trigger mutual fund sync |

**Sync Response Example:**
```json
{
  "success": true,
  "message": "Successfully synced mutual fund investments",
  "syncedCount": 5
}
```

## 🔄 ICICIDirect Integration

The application includes automatic synchronization with ICICIDirect API for mutual fund investments.

### Features

- **Automatic Sync**: Scheduled to run daily at 2 AM (configurable via cron expression)
- **Manual Sync**: Trigger sync via API endpoint
- **Smart Updates**: Updates existing investments or creates new ones based on SIP ID
- **Session Management**: Automatically handles authentication and token refresh

### Configuration

The sync schedule can be configured in `application.properties`:

```properties
icicidirect.sync.enabled=true
icicidirect.sync.cron=0 0 2 * * ?  # Daily at 2 AM
```

To disable automatic sync:
```properties
icicidirect.sync.enabled=false
```

### Sync Behavior

- Fetches active SIPs from ICICIDirect
- Maps SIP data to Investment entities:
  - Investment Type: "Mutual Fund"
  - Provider/Broker: "ICICIDirect"
  - Investment Amount: SIP amount
  - Current Amount: Current value from ICICIDirect
  - Scheme Code and Name: From ICICIDirect data
- Updates existing investments if found by SIP ID, otherwise creates new ones

## 🗄️ Database Schema

The application uses JPA/Hibernate with automatic schema generation (`ddl-auto=update`). The following tables are created:

- **investments**: Investment records
- **assets**: Asset records
- **liabilities**: Liability records

## 🔒 Security & Configuration

### CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:3001` (Frontend development server)
- `http://localhost:3000` (Alternative frontend port)

To add additional origins, update `CorsConfig.java` or `application.properties`.

### Environment Variables

For production, use environment variables instead of hardcoding credentials:

```bash
export DB_URL=your_database_url
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
export ICICIDIRECT_APP_KEY=your_app_key
export ICICIDIRECT_CLIENT_SECRET=your_client_secret
export ICICIDIRECT_USER_ID=your_user_id
export ICICIDIRECT_PASSWORD=your_password
```

## 🧪 Testing

Run tests with:

```bash
mvn test
```

## 📝 Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/financeapp/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── entity/          # JPA entities
│   │   │   ├── repository/      # Data repositories
│   │   │   ├── scheduler/       # Scheduled tasks
│   │   │   └── service/         # Business logic
│   │   └── resources/
│   │       └── application.properties
│   └── test/                    # Test files
└── pom.xml
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

- **Frontend**: [FinanceApp-frontend](https://github.com/vedesai/FinanceApp-frontend)

## 📞 Support

For issues and questions, please open an issue in the GitHub repository.
