# SmartQueue – QR-Based Virtual Queue Management System

SmartQueue is a web-based virtual queue management system that allows organizations to manage customer queues digitally. Customers can scan a QR code, join a queue, receive a digital token, and track their queue status in real time without installing an application or creating an account.

## ✨ Features

- **Organization Registration & Login:** Organizations can create their accounts and manage their queues.
- **Multiple Queue Management:** An organization can create and manage multiple queues.
- **Queue Admin Accounts:** Each queue has its own administrator credentials.
- **QR Code Generation:** Every queue has a unique QR code.
- **Digital Token Generation:** Customers can join a queue by entering their name.
- **Live Queue Tracking:** Customers can view their token number, position, current serving token, and estimated waiting time.
- **Queue Management Dashboard:** Administrators can call the next customer, mark tickets as served, or skip tickets.
- **Automatic Updates:** Customer ticket information refreshes automatically.
- **Secure Authentication:** Password hashing and role-based access control using Spring Security.

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| React.js | Frontend |
| Vite | Development server |
| Java | Backend programming |
| Spring Boot | REST API |
| Spring Security | Authentication and authorization |
| PostgreSQL | Database |
| Hibernate / JPA | Database connectivity |
| Maven | Backend build tool |

## 📁 Project Structure

```text
SmartQueue/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Java JDK 25
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd SmartQueue
```

### 2. Create the Database

Open PostgreSQL or pgAdmin and execute:

```sql
CREATE DATABASE smart_queue;
```

### 3. Configure the Backend

Open:

`backend/src/main/resources/application.properties`

Configure your PostgreSQL credentials using environment variables:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smart_queue
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD}
```

Set the `DB_PASSWORD` environment variable to your PostgreSQL password.

### 4. Start the Backend

Open a terminal inside the backend folder:

```cmd
cd backend
```

On Windows, run:

```cmd
mvnw.cmd spring-boot:run
```

Backend runs at:

`http://localhost:8080`

### 5. Start the Frontend

Open another terminal:

```cmd
cd frontend
npm install
npm run dev
```

For access from other devices on the same Wi-Fi network:

```cmd
npm run dev -- --host 0.0.0.0
```

Frontend normally runs at:

`http://localhost:5173`

## 🔄 How It Works

1. An organization registers and logs into SmartQueue.
2. The organization owner creates queues and assigns separate administrator credentials.
3. Each queue administrator accesses their dedicated dashboard.
4. The administrator displays or shares the queue-specific QR code.
5. Customers scan the QR code and open the corresponding queue page.
6. Customers enter their name and receive a digital token.
7. Administrators manage the queue using the Next, Serve, and Skip actions.
8. Customers automatically receive updated ticket information and estimated waiting times.

## 🎯 Use Cases

- Hospitals and clinics
- Salons and beauty centers
- College administrative offices
- Banks and service centers
- Other customer-service organizations

## 🔒 Security

- BCrypt password hashing.
- Spring Security authentication.
- Role-based access control.
- Organization-level queue isolation.
- Queue administrator access restricted to assigned queues.
- CSRF protection for protected requests.

## 🚀 Future Enhancements

- SMS and WhatsApp notifications.
- Queue analytics and reports.
- Cloud deployment.
- Multi-branch organization support.

## 👨‍💻 Project

**SmartQueue – Queue Smarter. Live Better.**

Developed using React.js, Java Spring Boot, and PostgreSQL.
