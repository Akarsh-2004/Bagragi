# 🧳 Bagragi — Your AI-Powered Travel Assistant 🌏

**Bagragi** is an intelligent travel planning assistant built with **React**, **Node.js**, and **Gemini API**. It helps users plan trips, find hotels, explore destination images, and chat with an AI assistant to get real-time travel help.

---

## ✨ Features

- 🔍 **AI Chatbot** – Ask anything about travel, destinations, or planning.
- 🗺️ **Plan Trip** – Auto-suggested itineraries using Gemini AI.
- 🏨 **Create & Book Hotels** – Add and browse hotel options.
- 🖼️ **City Images** – Explore beautiful city images via integrated API.
- 📜 **History** – Know your travel history and current location.
- 💸 **Cost Estimation** – Estimate costs of stay and trips.
- 🙋 **Be a Host** – Add your hotel to the platform.
- 🧑‍💼 **Know the Owner** – Get details of hotel owners.
- ❓ **FAQs** – (Coming soon) Common travel-related questions and answers.

---

## 🧠 Tech Stack

| Frontend         | Backend             | AI / ML             | Others                        |
|------------------|---------------------|----------------------|-------------------------------|
| React + Vite     | Node.js + Express   | Gemini API by Google | MongoDB, Mongoose             |
| Tailwind CSS     |                     | OpenAI (Fallback)    | Axios, dotenv, Nodemon        |
|                  |                     | Python (Flask, optional) |                             |

---

## 📁 Project Structure

bagragi/
├── client/ # React frontend
│ ├── src/components/ # Chatbot, Hotel cards, Navbar, etc.
│ ├── src/pages/ # PlanTrip, CityImages, History
│ └── App.jsx # Main layout and routing
├── server/ # Node.js backend
│ ├── controllers/ # Business logic
│ ├── routes/ # Express route handlers
│ ├── python_api_for_hotel_route.py # Optional Python integration
│ └── index.js # Server entry point
└── .env # Environment variables (not committed)

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Akarsh-2004/Bagragi.git
cd Bagragi
2. Install Dependencies
Backend:

bash
Copy
Edit
cd server
npm install
Frontend:

bash
Copy
Edit
cd client
npm install
3. Setup Environment Variables
Create a .env file inside the /server directory:

env
Copy
Edit
MONGO_URI=your_mongo_db_connection
GEMINI_API_KEY=your_google_gemini_api_key
💡 Tip: Add a .env.example for reference.

🚀 Running the Project
Start Backend:

bash
Copy
Edit
cd server
nodemon index.js
Start Frontend:

bash
Copy
Edit
cd client
npm run dev
🤖 Example Gemini Prompt
Prompt:

"Plan a 5-day trip to Tokyo for a solo traveler. Include food recommendations and tourist spots."

Response:

A structured day-wise itinerary, generated via Google Gemini API and shown in the chat interface.

📦 API Route Summary
Route	Method	Description
/api/chat	POST	Ask a travel question
/api/trip/plan	POST	Get a trip plan
/api/images/:city	GET	Fetch images for a city
/api/hotels/create	POST	Add a hotel listing
/api/history	GET	Fetch user location & history

📌 TODO / Future Enhancements
🔐 Add authentication and user login

💾 Save planned trips to database

🗺️ Map and geolocation integration

📱 Mobile responsiveness improvements

🚀 Deploy frontend to Vercel and backend to Railway

🙌 Credits
👨‍💻 Backend Developer: Akarsh Saklani

👩‍💻 Frontend Developer: Shruti Saini

🔗 AI Integration: Google Gemini API

⚛️ Built With: React, Tailwind CSS, Node.js, MongoDB

Made with 💡 and ☕ in India.
