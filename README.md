# Nimewahi Ticket 
### Digital Event Ticketing & Management Platform

Nimewahi Ticket is a web-based digital ticketing application designed to simplify event registration, ticket purchasing, payment processing and ticket verification.

The platform incorporates M-PESA payment functionality, user authentication and an integrated QR code scanning system, providing a digital approach to event ticket management.

## Key Features

- **User Authentication:** Authenticated access to platform functionality.
- **M-PESA Integration:** Digital payment functionality for ticket purchases.
- **QR Code Ticket Verification:** Scan and verify tickets directly within the website.
- **Digital Ticketing:** Supports online ticket purchasing and registration.
- **Event Management:** Supports event organisers in managing ticket registrations.
- **Responsive Interface:** Web interface designed for convenient access.

##  Technology Stack

| Technology | Application |
|---|---|
| React.js | Frontend development |
| JavaScript | Application functionality |
| Firebase | Backend services, database and authentication |
| Node.js | Backend server |
| HTML5 | Web structure |
| CSS3 | Styling and interface design |
| Vite | Development and build tooling |
| React Router | Application navigation |
| Axios | HTTP requests |

## Getting Started

### Prerequisites

- Node.js and npm installed.
- Git installed.
- Firebase project configuration.
- Required backend and payment integration environment variables.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/TykoonKelly/nimewai-ticket.git
   ```

2. Navigate into the project:

   ```bash
   cd nimewai-ticket
   ```

3. Install project dependencies:

   ```bash
   npm run setup
   ```

4. Configure the required Firebase and backend environment variables using your local environment configuration.

5. Start the application:

   ```bash
   npm start
   ```

Refer to the backend configuration and application source files for the specific environment variables required.

## Project Structure

```text
nimewai-ticket/
│
├── backend/
│   └── Backend application files
│
├── public/
│   └── Public assets
│
├── src/
│   └── Frontend application source
│
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml
└── README.md
```

## Security Considerations

- Keep Firebase credentials and private API keys out of public repositories.
- Store sensitive backend configuration in environment variables.
- Do not expose payment credentials or private authentication secrets.
- Use appropriate authentication and server-side validation for sensitive operations.

## Project Objective

The project aims to simplify event ticketing by bringing ticket purchases, digital payments and ticket verification into one web-based platform.

It explores how web technologies can improve event organisation, registration processes and ticket management.

##  Developer

**Kioko Kelly Kyalo**

Information Systems and Technology Graduate | Web Developer

GitHub: [TykoonKelly](https://github.com/TykoonKelly)

---

*Developed as a practical web application project demonstrating frontend development, backend integration, authentication and digital payment functionality.*
