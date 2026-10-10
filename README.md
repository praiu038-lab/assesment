# NourishGuard AI — Full-Stack Application & SRS Specification

> **Assessment Submission: Application Requirements Specification (SRS) & Full-Stack System**  
> *Topic: AI-Powered Smart Pantry Management, Zero-Waste Cooking & Hyperlocal Food Rescue*

---

## 📌 Project Overview
**NourishGuard AI** is a complete full-stack web ecosystem built to eliminate household food waste, reduce monthly grocery bills, and eliminate local food insecurity by connecting surplus edible food to nearby shelters and neighbors in real time.

---

## 🛠️ Technology Stack & Architecture
* **Frontend**: HTML5, Responsive Vanilla CSS (Glassmorphism & Mobile Drawer), JavaScript Client, Leaflet.js (GPS Map), Chart.js (Data Analytics), Mermaid.js (Architecture & Use Case Diagrams).
* **Backend**: Node.js & Express.js REST API Server (`server.js`).
* **Database**: Persistent JSON Storage (`nourishguard_data.json` / `db.js`) with ACID-like atomic writes.
* **AI Modules (Simulated & Documented)**: Transformer TrOCR + YOLOv8 Freshness Vision Ingestion, Generative Zero-Waste Chef (LLM + RAG), and Predictive Spoilage & Geo-Redistribution Routing.

---

## 📡 Backend REST API Endpoints
| HTTP Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check & database connection status |
| `GET` | `/api/pantry` | Retrieve all pantry items with computed freshness & countdowns |
| `POST` | `/api/pantry` | Add a new grocery item to database |
| `PUT` | `/api/pantry/:id` | Update pantry item details |
| `DELETE` | `/api/pantry/:id` | Remove item from pantry |
| `POST` | `/api/pantry/:id/consume` | Mark item eaten (automatically updates savings in analytics DB) |
| `POST` | `/api/scan` | AI multi-modal receipt & pantry image OCR ingestion |
| `GET` | `/api/recipes` | Dynamic zero-waste recipe recommendations based on at-risk inventory |
| `GET` | `/api/donations` | Fetch active hyperlocal community food listings |
| `POST` | `/api/donations` | List surplus pantry item on rescue map |
| `POST` | `/api/donations/:id/claim` | Reserve donation & generate pickup verification QR token |
| `GET` | `/api/analytics` | Fetch metrics (dollars saved, kg diverted, category breakdown) |

---

## 🚀 How to Run the Application Locally

### Option 1: Run Full-Stack Express Server (Recommended)
```bash
# 1. Install dependencies
npm install

# 2. Start the server (runs on port 5050)
npm start
# or
node server.js

# 3. Open in your browser
open http://localhost:5050
```

### Option 2: Open Statically in Browser
Double-click [`index.html`](./index.html) or run:
```bash
python3 -m http.server 4567
```

---

## 📂 Repository Contents
* **[`SOFTWARE_REQUIREMENTS_SPECIFICATION.md`](./SOFTWARE_REQUIREMENTS_SPECIFICATION.md)**: Full IEEE 830-style Software Requirements Specification document containing all 16 required sections.
* **[`index.html`](./index.html)**: Interactive full-stack web portal with mobile menu, smart pantry, AI scanner, AI chef, rescue map, analytics, and SRS viewer.
* **[`style.css`](./style.css)**: 100% responsive CSS design system for desktop, tablet, and mobile devices.
* **[`app.js`](./app.js)**: Frontend client logic with live REST API integration and offline fallback.
* **[`server.js`](./server.js)**: Express REST API backend server.
* **[`db.js`](./db.js)**: Persistent database manager.
* **[`nourishguard_data.json`](./nourishguard_data.json)**: Database file.

---
*Assessment submission for Teacher evaluation.*
