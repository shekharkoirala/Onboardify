# Onboardify

Onboardify is a multi-tenant web application for parsing and managing onboard documentations. 

## Features

- 🔐 Secure authentication with email/password
- 🏢 Multi-tenant architecture
- 📝 Document parsing and formatting
- 📊 Fleet management dashboard

## Tech Stack

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Supabase Client

### Backend
- FastAPI
- Python 3.11+
- SQLAlchemy
- Supabase

## Prerequisites
- Node.js 18+
- Python 3.11+
- Docker
- Supabase account

## Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd Onboardify
```

2. Install frontend dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Install backend dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

5. Start the development servers:

Frontend:
```bash
npm run dev
```

Backend:
```bash
cd backend
uvicorn main:app --reload --port 8000
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Docker Deployment

1. Build and run the containers:
```bash
docker-compose up --build
```

2. Access the services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Project Structure

```
.
├── app/                    # Next.js application
│   ├── (auth)/            # Authentication routes
│   ├── components/        # React components
│   └── lib/              # Utility functions
├── backend/              # FastAPI backend
│   ├── main.py          # Main application
│   └── requirements.txt  # Python dependencies
├── supabase/            # Supabase configurations
│   └── migrations/      # Database migrations
└── docker-compose.yml   # Docker compose configuration
```

## API Documentation

The API documentation is automatically generated and available at `/docs` when running the backend server.

### Key Endpoints

- `POST /documents/`: Upload a new document
- `GET /documents/{document_id}`: Retrieve a document
- More endpoints documented in the Swagger UI

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request