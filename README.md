# Maritime Dominion

### A Maritime Compliance & Fleet Intelligence System

---

## Overview

**Maritime Dominion** is a full-stack database-driven application designed to manage maritime fleet operations, monitor environmental compliance, and analyze vessel activity.

The system integrates a **relational database (MySQL)** with an **Express.js backend** and a **React frontend**, emphasizing strong **DBMS concepts** such as normalization, constraints, triggers, and PL/SQL constructs.

---

##  Key Features

### Fleet Management

* Register and manage vessels with unique IMO numbers
* Track vessel metadata (flag state, type, etc.)

### Captain & Assignment Tracking

* Maintain captain records
* Track captain assignments over time
* Automatically manage active/inactive command periods

###  Compliance Logging

* Record sulfur levels and waste discharge
* Automatic violation detection using database triggers
* Historical log tracking with timestamps

###  Violation Monitoring

* Identify environmental violations (IMO 2020 compliance)
* Dashboard view for quick inspection

### Vessel Passport System

* Consolidated view of:

  * Vessel details
  * Captain history
  * Recent compliance logs
* Decision system for port entry approval

###  Authentication System

* Secure login/signup using JWT
* Role-based access (admin/officer/viewer)

---

##  DBMS Concepts Implemented

###  Database Design

* Entity–Relationship modeling
* Relational schema with primary & foreign keys

###  Normalization

* Tables normalized up to **3NF**
* Eliminates redundancy and ensures consistency

### Constraints

* NOT NULL, UNIQUE, FOREIGN KEY
* Enforces data integrity

### Trigger

* `check_violation` trigger automatically flags violations

###  Stored Procedure

* Encapsulates business logic for vessel registration

###  Function

* Computes analytical metrics (e.g., vessel risk score)

### Cursor

* Iterative processing for compliance audit reporting

### Views

* `vessel_compliance_dashboard` for aggregated insights

### Transactions

* Demonstrates ACID properties using COMMIT/ROLLBACK

---

## Tech Stack

| Layer    | Technology            |
| -------- | --------------------- |
| Database | MySQL                 |
| Backend  | Node.js + Express     |
| Frontend | React                 |
| Auth     | JWT (JSON Web Tokens) |
| Styling  | Custom CSS            |

---

## Project Structure

```
maritime-dominion/
│
├── db.sql                 # Database schema + advanced DBMS layer
├── backend/
│   └── server.js          # Express API server
├── maritime-frontend/
│   ├── src/
│   └── public/
└── package.json
```

---

## Setup Instructions

### 1️ Database Setup

```bash
# Open MySQL and run:
source db.sql;
```

---

### 2️ Backend Setup

```bash
cd backend
npm install
node server.js
```

Server runs at:
 `http://localhost:3001`

---

### 3️ Frontend Setup

```bash
cd maritime-frontend
npm install
npm start
```

Frontend runs at:
 `http://localhost:3000` (React dev server)

---

##  API Highlights

| Endpoint               | Description         |
| ---------------------- | ------------------- |
| `/auth/signup`         | Register new user   |
| `/auth/login`          | Login user          |
| `/vessels`             | Get all vessels     |
| `/add-vessel`          | Add vessel          |
| `/logs`                | Get logs            |
| `/add-log`             | Add compliance log  |
| `/captains`            | Get captains        |
| `/assign-captain`      | Assign captain      |
| `/vessel-passport/:id` | Full vessel profile |

---

##  Sample Use Cases

* Monitor sulfur compliance across fleet
* Identify high-risk vessels using analytical functions
* Track captain assignments historically
* Generate compliance dashboards

---

## Highlights

* Strong **backend-first DBMS design**
* Real-world **maritime compliance system**
* Advanced SQL + PL/SQL integration
* Clean and modern UI
* Scalable architecture

---

##  Future Improvements

* Role-based admin dashboard
* Real-time alerts for violations
* Data visualization (charts)
* Deployment (Docker / Cloud)

---

##  Author

**Jatin**
B.Tech Computer Engineering
Thapar University

---

##  License

This project is for academic purposes.

---

##  Final Note

This project demonstrates how **database systems are not just storage tools**, but powerful engines for enforcing rules, ensuring integrity, and enabling intelligent decision-making.

---
