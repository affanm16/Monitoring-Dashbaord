# Monitoring Dashboard

A web application to monitor server status, disk usage, and explore log files. The backend is built with Node.js and Express, and the frontend is a Next.js application.

## Project Structure

```
Monitoring-Dashboard/
├── backend/        # Node.js Express server
│   ├── Dashboard/  # Mock data and log files served by the backend
│   └── server.js   # Main backend logic and API endpoints
├── frontend/       # Next.js frontend application
│   ├── app/        # Next.js app router (pages, layout)
│   ├── components/ # React components
│   └── config/     # Authentication configuration (e.g., MSAL)
├── .gitignore      # Specifies intentionally untracked files that Git should ignore
├── azure-pipelines.yml # Azure Pipelines CI/CD configuration
└── README.md       # This file
```

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18.x or later recommended)
- npm (comes with Node.js) or yarn

## Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone YOUR_REPOSITORY_URL
    cd Monitoring-Dashboard
    ```

    (Replace `YOUR_REPOSITORY_URL` with the actual URL of your Git repository)

2.  **Install Backend Dependencies:**

    ```bash
    cd backend
    npm install
    cd ..
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm install
    cd ..
    ```

## Running the Application

You'll need two terminals to run both the backend and frontend servers.

1.  **Start the Backend Server:**
    Open a terminal, navigate to the `backend` directory, and run:

    ```bash
    cd backend
    npm start
    ```

    This will typically start the backend server on `http://localhost:3003`.

2.  **Start the Frontend Development Server:**
    Open a new terminal, navigate to the `frontend` directory, and run:

    ```bash
    cd frontend
    npm run dev
    ```

    This will start the Next.js development server, usually on `http://localhost:3000`.

3.  **Access the Application:**
    Open your web browser and go to `http://localhost:3000`.

## Enabling Azure AD SSO Authentication

This application includes support for Azure Active Directory (Azure AD) Single Sign-On (SSO) using the Microsoft Authentication Library (MSAL) for React. It is currently **disabled** for local development to simplify setup. Follow these steps to re-enable it:

### 1. Azure AD App Registration

- You must have an active Azure AD application registration.
- From your app registration in the Azure portal, you will need the following:
  - **Application (client) ID**
  - **Directory (tenant) ID**
  - **Redirect URI** (e.g., `http://localhost:3000` for local development, or your deployed application's URI)

### 2. Configure MSAL

- Open the MSAL configuration file: `frontend/config/authConfig.js`.
- Update the `msalConfig` object with your Azure AD app registration details:

  ```javascript
  // frontend/config/authConfig.js
  export const msalConfig = {
    auth: {
      clientId: "YOUR_APPLICATION_CLIENT_ID", // Replace with your Application (client) ID
      authority: "https://login.microsoftonline.com/YOUR_DIRECTORY_TENANT_ID", // Replace with your Directory (tenant) ID
      redirectUri: "http://localhost:3000", // Or your configured redirect URI
    },
    cache: {
      cacheLocation: "sessionStorage", // Or "localStorage"
      storeAuthStateInCookie: false,
    },
  };

  export const loginRequest = {
    scopes: ["User.Read"], // Basic scope, add others as needed
  };
  ```

### 3. Uncomment Authentication Code

You will need to uncomment the MSAL-related code in the following files:

- **`frontend/app/layout.js`**:

  - Uncomment `MsalProvider` import and usage.
  - Uncomment `PublicClientApplication` import and `msalInstance` initialization.

- **`frontend/app/signin/page.js`**:

  - Uncomment imports for `useMsal`, `loginRequest`.
  - Uncomment the MSAL logic within the `Page` component to handle login.

- **`frontend/components/authGuard.js`**:

  - Ensure this component is correctly implemented and uncomment its usage if it was commented out (typically in `frontend/app/page.js` or `frontend/app/home/page.js`).

- **`frontend/app/page.js` (or `frontend/app/home/page.js` if that's your main entry point after login):**

  - Uncomment any `AuthGuard` component wrapping your main page content.
  - Uncomment any logic that uses `useMsal` or checks authentication status.

- **`frontend/components/hero.js`**:

  - The `view` state is currently initialized to `true` (e.g., `const [view, setView] = useState(true);`) to bypass authentication for local development.
  - You will need to change this so that `view` is determined by the actual authentication status. For example, you might use the `useIsAuthenticated` hook from `@azure/msal-react`:

    ```javascript
    import { useIsAuthenticated } from "@azure/msal-react";
    // ...
    const isAuthenticated = useIsAuthenticated();
    const [view, setView] = useState(false); // Initial state

    useEffect(() => {
      setView(isAuthenticated);
    }, [isAuthenticated]);
    ```

    Adjust this logic based on how authentication was originally integrated.

### 4. Test Authentication

- After making these changes, restart your frontend development server.
- You should now be redirected to the Azure AD sign-in page when accessing the application.

---

This README should provide a good starting point for anyone looking to use or contribute to your project.
