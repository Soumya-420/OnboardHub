# OnboardHub Backend API

This is the Express.js backend for OnboardHub. It acts as a bridge between the Frontend and the GitHub API, handling repository analysis and issue fetching.

## 🚀 How to Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Server**:
    ```bash
    npm start
    ```
    The server runs on `http://localhost:5000`.

## 📡 API Endpoints

### 1. Analyze Repository
**POST** `/api/analyze`

Detects the tech stack, package manager, and generates setup commands.

- **Body**:
  ```json
  { "repoUrl": "https://github.com/owner/repo" }
  ```
- **Response**:
  ```json
  {
    "repo": "owner/repo",
    "stars": 120,
    "forks": 30,
    "primaryLanguage": "JavaScript",
    "techStack": ["Node.js", "React"],
    "setupCommands": ["npm install", "npm run dev"]
  }
  ```

### 2. Fetch Issues
**GET** `/api/issues`

Fetches issues based on difficulty level.

- **Query Parameters**:
  - `owner`: GitHub Owner
  - `repo`: Repository Name
  - `level`: `beginner` | `intermediate` | `pro`
- **Response**: List of issues.

## 🛠 Tech Stack
- **Node.js**: Runtime
- **Express**: Web Framework
- **Axios**: HTTP Client for GitHub API
