# Real Estate Portfolio Management System

A full-stack real estate portfolio management application built with **React**, **Node.js**, **Express**, and **PostgreSQL**. The project combines a property browsing experience with an administrative dashboard for managing listings, tracking portfolio activity, and exporting reports.

## Features

### Property browsing
- Browse property listings and view individual property detail pages.
- Filter listings by **listing type**, **property type**, **city**, **district**, **room count**, and **maximum price**.
- Sort listings to find relevant properties more easily.
- Explore recently added properties on the home page.
- View listing availability with **Active**, **Sold**, and **Rented** statuses.

### Administration
- Administrator login and a dedicated management interface.
- Add, edit, and remove property listings.
- Change listing statuses between **Active**, **Sold**, and **Rented**.
- Review dashboard summaries, including today's activity, monthly activity, and recently added listings.
- Explore portfolio distribution by city through a chart and summary counts.
- Filter administrative listing views by date and sort results.
- Export filtered portfolio data to **PDF**.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, JavaScript (ES6+), HTML5, CSS3, Bootstrap, React Router |
| Backend | Node.js, Express.js, REST API |
| Database | PostgreSQL |
| Authentication | JWT, bcrypt |
| Reporting | jsPDF, jsPDF-AutoTable |
| Version control | Git, GitHub |

## Project Structure

```text
.
├── public/                # Public frontend assets
├── src/
│   ├── assets/            # Styles, images, and fonts
│   ├── components/        # Reusable UI components
│   ├── layout/            # Shared layout elements
│   └── pages/             # Application pages
├── server/
│   ├── db.js              # PostgreSQL connection pool
│   ├── index.js           # Express server and API
│   ├── seedAdmin.js       # Administrator account setup
│   └── uploads/           # Property images
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/HilalPolat/real-estate-portfolio-management.git
cd real-estate-portfolio-management
```

### 2. Install dependencies

```bash
npm install
cd server
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `server` directory:

```dotenv
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
JWT_SECRET=replace_with_a_long_random_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password
```

> **Security:** Never commit `.env` files or real credentials. The example values above are placeholders.

### 4. Set up the database

Create a PostgreSQL database and configure the connection details in `server/.env`. The database schema (tables and constraints) must be created before starting the application. A database migration or SQL setup script is not currently included in this repository.

### 5. Run the application

Start the backend in one terminal:

```bash
cd server
node index.js
```

Start the React frontend in a second terminal, from the repository root:

```bash
npm start
```

The frontend typically runs at `http://localhost:3000`; the backend uses the port defined in `server/.env` (for example, `5000`).

### Administrator setup

Once the database schema is ready and the administrator credentials are set in `server/.env`, you can run:

```bash
cd server
node seedAdmin.js
```

**Note:** The seed script uses `ON CONFLICT (email) DO NOTHING`; it does not reset the password of an existing administrator account.

## Screenshots

Screenshots of the public property pages and administrative dashboard can be added here to demonstrate the application visually.

<!-- Example:
![Property listings](docs/screenshots/property-listings.png)
![Admin dashboard](docs/screenshots/admin-dashboard.png)
-->

## Notes

- This repository contains the application source code; it is not a hosted live demo.
- Local environment variables and database credentials are intentionally excluded from version control.
- Property images under `server/uploads/` should be used only when you have permission to share them.

## Author

**Hilal Polat**  
GitHub: [@HilalPolat](https://github.com/HilalPolat)
