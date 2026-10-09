# Smart Disaster Response

A comprehensive, AI-powered platform designed to coordinate citizens, volunteers, donors, and administrators during emergencies.

## Features

- **Multi-Role Authentication**: Distinct portals and dashboards for Citizens, Administrators, Volunteers, and Donors.
- **Real-Time Emergency Reporting**: Citizens can instantly report emergencies with location data and severity assessments.
- **AI-Powered Triage & Prioritization**: Administrators have access to an AI engine that automatically sorts emergencies by severity and generates instant situation briefings.
- **Smart Resource Allocation**: Predict resource shortages and get AI-driven recommendations for essential supplies based on disaster types.
- **Intelligent Volunteer Matching**: Automatically match the best-suited volunteers to critical assignments based on their skills and location.
- **Omnipresent AI Copilot**: Every role has access to an AI Response Copilot (powered by Gemini 1.5 Flash) that acts as a 24/7 assistant, providing on-ground safety tips for citizens, assignment briefings for volunteers, and database insights for administrators.

## Tech Stack

### Frontend
- **Next.js** (App Router)
- **React**
- **Tailwind CSS** (v4)
- **DaisyUI** (Component Library)
- **Lucide React** (Icons)

### Backend
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose** (Database)
- **JSON Web Tokens (JWT)** (Authentication)
- **Google Gemini API** (AI Integration)

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas)
- Docker (Optional, for backend containerization)
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Smart_Disaster_Response
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/disaster_response
   JWT_SECRET=your_jwt_secret_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   Start the backend:
   ```bash
   npm run dev
   # Or using Docker:
   # docker compose up -d --build backend
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
