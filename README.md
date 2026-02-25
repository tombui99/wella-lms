# Bifrost LMS - Multi-tenant Learning Management System

Bifrost LMS is a modern, multi-tenant SaaS learning platform built with .NET 10 (Backend) and Angular (Frontend).

## 🚀 Tech Stack

### Backend

- **Framework**: .NET 10
- **Database**: MySQL
- **ORM**: Entity Framework Core (Code First)
- **API Documentation**: OpenAPI (Swagger)

### Frontend

- **Framework**: Angular 21
- **API Integration**: OpenAPI Generator (Auto-generated Services & Models)
- **Styling**: TailwindCSS 4

---

## 🛠 Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) (LTS)
- [MySQL Server](https://www.mysql.com/downloads/)

---

## 🏃 Getting Started

### 1. Backend Setup

1. **Configure Connection String**:
   Update `backend/BifrostLms.Api/appsettings.json` with your MySQL credentials:

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=bifrost_lms;Uid=root;Pwd=YourPassword;"
   }
   ```

2. **Run Migrations**:
   Navigate to the backend directory and run:

   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

3. **Start the API**:

   ```bash
   dotnet run --project BifrostLms.Api
   ```

   The API will be available at `http://localhost:5000` (Swagger UI at `/swagger`).

### 2. Frontend Setup

1. **Install Dependencies**:

   ```bash
   cd frontend
   npm install
   ```

2. **Generate API Clients**:
   Ensure the backend is running, then run:

   ```bash
   npm run generate:api
   ```

   This will generate Angular services and models in `src/app/api` based on the backend's OpenAPI spec.

3. **Start the Frontend**:

   ```bash
   npm start
   ```

   The app will be available at `http://localhost:4200`.

---

## 📂 Project Structure

- `backend/`: .NET 10 Web API project.
  - `Core/Entities/`: Domain models (Courses, Lessons, Schedule, etc.)
  - `Data/`: EF Core DbContext and Migrations.
- `frontend/`: Angular application.
  - `scripts/generate-api.sh`: Shell script for OpenAPI generation.

---

## 🛠 Common Scripts

### EF Core Migrations

| Command                           | Description                      |
| :-------------------------------- | :------------------------------- |
| `dotnet ef migrations add <Name>` | Create a new migration           |
| `dotnet ef database update`       | Apply migrations to the database |

### Frontend Code Generation

| Command                     | Description                                    |
| :-------------------------- | :--------------------------------------------- |
| `npm run generate:api`      | Generate Angular services from Backend OpenAPI |
| `./scripts/generate-api.sh` | Shell script alternative for API generation    |

---

## 🌐 Deployment

For instructions on how to host this project on AWS and set up CI/CD, please refer to the [AWS Deployment Guide](README-DEPLOY.md).

---

## 📐 Multi-Tenant Architecture

The project is designed with a `BaseEntity` that includes a `TenantId`. This allows for data isolation across different tenants. The `Tenant` model in `Core/Entities` serves as the foundation for the multi-tenant SaaS configuration.
