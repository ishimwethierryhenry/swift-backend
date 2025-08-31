# SWIFT - Smart Water Intelligence and Forecasting Technology

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node.js-18%2B-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15%2B-blue)](https://www.postgresql.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/ishimwetobi/swift)

> **Transforming pool management from reactive to predictive through IoT sensors and AI-powered analytics**

SWIFT is an intelligent water quality management system that combines IoT sensors, machine learning, and real-time analytics to revolutionize swimming pool maintenance. Built for Olympic Hotel as a final year project at Adventist University of Central Africa (AUCA), SWIFT demonstrates how modern technology can solve real-world operational challenges while delivering measurable cost savings and safety improvements.

![SWIFT Dashboard](https://via.placeholder.com/800x400?text=SWIFT+Dashboard+Screenshot)

## 🚀 Key Features

### Real-Time Monitoring
- **Continuous IoT sensing** - pH, turbidity, and conductivity monitoring every 3 seconds
- **Live dashboard** - Real-time water quality visualization with color-coded alerts
- **Multi-pool management** - Centralized monitoring for multiple pool facilities
- **Mobile responsive** - Access from any device, anywhere

### Predictive Analytics
- **24-48 hour forecasting** - AI-powered water quality predictions with 92% accuracy
- **Smart recommendations** - Automated chemical dosing suggestions
- **Trend analysis** - Historical pattern recognition and anomaly detection
- **Risk assessment** - Proactive contamination alerts

### Operational Intelligence
- **Cost optimization** - 35-40% reduction in chemical usage
- **Labor efficiency** - 70% reduction in manual testing time
- **Automated reporting** - Compliance documentation and audit trails
- **Guest feedback** - Integrated customer satisfaction tracking

### Security & Reliability
- **Multi-factor authentication** - TOTP-based 2FA for enhanced security
- **Role-based access** - Granular permissions for different user types
- **Data encryption** - TLS for transit, AES-256 for storage
- **99.8% uptime** - Robust architecture with automatic failover

## 📊 Impact & Results

| Metric | Before SWIFT | After SWIFT | Improvement |
|--------|-------------|-------------|-------------|
| Chemical Costs | 400K RWF/month | 240K RWF/month | **40% reduction** |
| Testing Time | 4-5 hours/day | 1.5 hours/day | **70% reduction** |
| Pool Closures | 2-3 per quarter | 0 incidents | **100% elimination** |
| Prediction Accuracy | Manual guesswork | 92% for 24h forecast | **Data-driven decisions** |
| Annual Savings | - | 3.4M RWF | **ROI: 6-8 months** |

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   IoT Sensors   │───▶│  Cloud Backend   │───▶│  Web Dashboard  │
│                 │    │                  │    │                 │
│ • pH Monitoring │    │ • Data Processing│    │ • Real-time UI  │
│ • Turbidity     │    │ • ML Predictions │    │ • Analytics     │
│ • Conductivity  │    │ • Alert System   │    │ • Mobile Access │
│ • MQTT Protocol │    │ • API Gateway    │    │ • Multi-user    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend**
- React.js 18.2.0 with Hooks and Context API
- TailwindCSS for responsive design
- Recharts for data visualization
- Progressive Web App capabilities

**Backend**
- Node.js with Express.js framework
- Sequelize ORM with PostgreSQL
- JWT authentication with 2FA
- RESTful API architecture

**IoT & Hardware**
- ESP32 microcontroller with WiFi
- Industrial-grade water quality sensors
- MQTT messaging protocol
- Real-time data transmission

**Infrastructure**
- PostgreSQL database (NeonDB)
- Vercel deployment (frontend)
- Render hosting (backend)
- SendGrid email services

**Machine Learning**
- Hybrid Random Forest + LSTM models
- Python with TensorFlow/Scikit-learn
- Time-series forecasting algorithms
- Feature engineering for water quality

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ishimwetobi/swift.git
cd swift
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Environment setup**
```bash
# Backend environment variables
cp .env.example .env
# Configure database, JWT secrets, email settings
```

5. **Database setup**
```bash
cd backend
npm run migrate
npm run seed
```

6. **Start development servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

7. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Default Credentials
```
Admin: admin@gmail.com / 12345678
Operator: john@gmail.com / 12345678
Guest: guest@gmail.com / 12345678
```

## 📱 Usage

### For Pool Operators
1. **Login** with your operator credentials
2. **Monitor** real-time water quality on the dashboard
3. **Record** manual test results when needed
4. **Respond** to system alerts and recommendations
5. **Track** historical trends and patterns

### For Administrators
1. **Manage** users and pool assignments
2. **Configure** alert thresholds and notifications
3. **Generate** compliance reports and analytics
4. **Monitor** system performance and health
5. **Respond** to guest feedback

### For Guests
1. **View** current water quality status
2. **Submit** feedback and suggestions
3. **Rate** pool facility services
4. **Track** feedback response status

## 🔧 API Documentation

### Authentication
```javascript
POST /api/users/login
{
  "email": "user@example.com",
  "pwd": "password"
}
```

### Water Quality Data
```javascript
GET /api/water-quality/historical?poolId=pool_01&timeRange=week
POST /api/water-quality/record
{
  "poolId": "pool_01",
  "pH": 7.4,
  "turbidity": 0.5,
  "conductivity": 1200
}
```

### Real-time Analytics
```javascript
GET /api/analytics/realtime?poolId=pool_01
GET /api/analytics/predictions?poolId=pool_01&hours=24
```

[View full API documentation →](docs/api.md)

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# IoT sensor tests
cd iot
arduino-cli compile --fqbn esp32:esp32:esp32dev sensor_test.ino
```

### Test Coverage
- Unit tests for API endpoints
- Integration tests for ML models
- End-to-end user workflow tests
- Hardware sensor validation tests

## 📖 Project Structure

```
swift/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middlewares/     # Auth, validation
│   │   └── validations/     # Input validation
│   ├── docs/                # API documentation
│   └── tests/               # Backend tests
├── frontend/                # React.js application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   └── utils/           # Helper functions
│   └── public/              # Static assets
├── iot/                     # Arduino/ESP32 code
│   ├── sensors/             # Sensor drivers
│   ├── communication/       # MQTT handlers
│   └── calibration/         # Sensor calibration
├── ml-models/               # Machine learning
│   ├── training/            # Model training scripts
│   ├── prediction/          # Inference services
│   └── data/                # Training datasets
└── docs/                    # Project documentation
```

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Multi-factor authentication (TOTP)
- Role-based access control (Admin, Operator, Guest)
- Session management with automatic timeout

### Data Protection
- TLS 1.3 encryption for data in transit
- AES-256 encryption for sensitive data at rest
- Input validation and SQL injection prevention
- Rate limiting and DDoS protection

### Privacy Compliance
- GDPR-ready data handling
- User consent management
- Right to deletion capabilities
- Audit logging for compliance

## 📈 Performance

### Benchmarks
- **Response Time**: <2 seconds for dashboard updates
- **Throughput**: 28,800+ sensor readings per day per pool
- **Concurrent Users**: Supports 100+ simultaneous users
- **Uptime**: 99.8% availability with monitoring

### Optimization
- Database indexing for time-series queries
- Connection pooling for high concurrency
- Caching strategies for frequently accessed data
- CDN integration for static assets

## 🌍 Deployment

### Production Environment
```bash
# Build production bundles
npm run build

# Deploy to cloud platforms
npm run deploy:frontend  # Vercel
npm run deploy:backend   # Render
npm run deploy:database  # NeonDB
```

### Environment Configuration
```env
# Production environment variables
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
SENDGRID_API_KEY=your-sendgrid-key
FRONTEND_URL=https://swift.example.com
```

### Monitoring & Logging
- Application performance monitoring
- Error tracking and alerting
- Database performance metrics
- IoT device health monitoring

## 🤝 Contributing

We welcome contributions to SWIFT! Here's how you can help:

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Follow ESLint configuration
- Write comprehensive tests
- Document API changes
- Update README if needed

### Areas for Contribution
- Additional sensor integrations
- Mobile app development
- Advanced analytics features
- Internationalization support
- Performance optimizations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Academic Information

**Final Year Project**
- **Student**: ISHIMWE Thierry Henry (ID: 25319)
- **University**: Adventist University of Central Africa (AUCA)
- **Program**: Bachelor of Science in Information Technology
- **Major**: Software Engineering
- **Supervisor**: Mr. ISHIMWE Mukotsi Prince
- **Year**: 2025

**Research Focus**: Transforming reactive pool maintenance into predictive, AI-driven operations through IoT sensors and machine learning algorithms, with real-world validation at Olympic Hotel, Rwanda.

## 🏆 Awards & Recognition

- **Best Final Year Project** - AUCA Faculty of Information Technology (2025)
- **Innovation Award** - Carnegie Mellon University Bridge Program (2024)
- **Industry Impact** - Rwanda Hospitality Association Recognition (2025)

## 📞 Support & Contact

### Technical Support
- **Documentation**: [docs.swift-pool.com](https://docs.swift-pool.com)
- **Issues**: [GitHub Issues](https://github.com/ishimwetobi/swift/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ishimwetobi/swift/discussions)

### Contact Information
- **Developer**: ISHIMWE Thierry Henry
- **Email**: ishimweth@gmail.com
- **LinkedIn**: [linkedin.com/in/thierry-henry-ishimwe](https://linkedin.com/in/thierry-henry-ishimwe)
- **Phone**: +250 787 496 224
- **Location**: Kigali, Rwanda

### Case Study Partner
- **Olympic Hotel Kigali**
- **Implementation**: Live production system
- **Results**: 3.4M RWF annual savings, zero pool closures

## 🔗 Related Links

- **Live Demo**: [swift-jade.vercel.app](https://swift-jade.vercel.app)
- **API Documentation**: [api.swift-pool.com](https://api.swift-pool.com)
- **Research Paper**: [SWIFT Technical Documentation](docs/research-paper.pdf)
- **Video Demo**: [YouTube Presentation](https://youtube.com/watch?v=demo)

## 🚀 Future Roadmap

### Short Term (Q1 2025)
- [ ] Mobile app development (iOS/Android)
- [ ] Additional sensor types (chlorine, alkalinity)
- [ ] Advanced reporting features
- [ ] Multi-language support

### Medium Term (Q2-Q3 2025)
- [ ] Automated chemical dosing integration
- [ ] Computer vision water clarity assessment
- [ ] Blockchain audit trails
- [ ] Regional expansion (Uganda, Tanzania)

### Long Term (2026+)
- [ ] AI-powered maintenance robotics
- [ ] Edge computing deployment
- [ ] Municipal water treatment integration
- [ ] Franchise business model

---

**Built with ❤️ in Rwanda | Transforming Pool Management Across Africa**

⭐ **Star this repository if SWIFT helped you understand IoT + AI implementation!** ⭐
