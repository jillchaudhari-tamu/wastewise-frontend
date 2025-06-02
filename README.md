# WasteWise

WasteWise is a full-stack web application that helps users classify waste items as Recyclable, Compostable, Trash, or Hazardous. It leverages AI-powered natural language processing, barcode scanning, and a cloud database to provide real-time, personalized waste tracking and analytics.

**Live App:** [wastewise-frontend-ashen.vercel.app] (https://wastewise-frontend-ashen.vercel.app)

## Features

- AI-based waste classification using Hugging Face NLP models
- Barcode scanning using OpenFoodFacts API
- Manual entry support for unscannable items
- Firebase Authentication with protected routes
- Realtime cloud logging and classification history (Firestore)
- Personalized waste analytics dashboard with Recharts
- Responsive UI designed for mobile and desktop
- Hosted frontend on Vercel and backend on Render

## Technologies Used

**Frontend:**
- React (Vite)
- Tailwind CSS
- Firebase Authentication
- Recharts for data visualization

**Backend:**
- Node.js with Express
- Hugging Face Inference API (BART)
- Firestore (NoSQL database)
- OpenFoodFacts public API
- Hosted via Render

## API Workflow

1. Users scan a barcode or enter a product manually
2. The backend queries OpenFoodFacts (for barcodes)
3. The item name and packaging info is sent to Hugging Face for classification
4. The classification is normalized and returned to the frontend
5. The result is logged to Firestore under the authenticated user
6. Realtime analytics are updated and displayed in the dashboard

## Project Structure

```
/wastewise
  /client   → React frontend
  /server   → Node.js backend API
```

Frontend and backend are hosted and maintained in separate GitHub repositories for modularity and deployment flexibility.

## Getting Started

### Prerequisites

- Node.js and npm installed locally
- Firebase project with Authentication and Firestore enabled
- Hugging Face API key

### Clone the repositories

```bash
git clone https://github.com/yourusername/wastewise-frontend.git
git clone https://github.com/yourusername/wastewise-backend.git
```

### Start backend

```bash
cd wastewise-backend
npm install
```

Create a `.env` file with:
```
HUGGINGFACE_API_KEY=your-api-key
PORT=5000
```

Start the backend:
```bash
node index.js
```

### Start frontend

```bash
cd wastewise-frontend
npm install
npm run dev
```

## Backend Repository

The backend code (AI classification engine + API) is available at:  
[https://github.com/jillchaudhari-tamu/wastewise-backend](https://github.com/jillchaudhari-tamu/wastewise-backend)

## Author

**Jill Chaudhari**  
Computer Science and Engineering  
Texas A&M University  
Email: jillchaudhari0817@gmail.com  
LinkedIn: [linkedin.com/in/jill-chaudhari](https://www.linkedin.com/in/jill-chaudhari/)

## Summary

WasteWise demonstrates a complete, deployable full-stack application focused on sustainability, intelligent automation, 
and user-centered design. It integrates modern frontend technologies, NLP-powered backend logic, and real-time cloud infrastructure, 
providing a strong example of practical engineering and product development.
