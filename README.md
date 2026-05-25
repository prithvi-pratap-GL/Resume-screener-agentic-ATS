# Screen-U - Recruitment Intelligence

Screen-U is a web application designed to automate and supercharge the initial resume screening process. It operates as a clean, utilitarian SaaS platform for recruiters, enabling them to make faster, data-driven decisions.

The system takes a candidate's resume, compares it against a highly configurable **Job Role**, calculates a detailed match score, and then generates tailored content like interview questions for promising candidates or constructive feedback for those who don't meet the threshold.

![Screen-U Screenshot](https://user-images.githubusercontent.com/10284319/203939499-3685d6f2-18b8-4665-8f6c-e06915d3238a.png)

## ✨ Features

- **Job Role Management**: Create, read, update, and delete job roles. Each role has its own dedicated scoring configuration, allowing for nuanced evaluations for different positions (e.g., Junior vs. Senior).
- **Configurable Scoring Engine**:
    - **Skill Weighting**: Assign importance to different skills (e.g., Python: 90%, Kubernetes: 40%).
    - **Experience Bands**: Define score multipliers based on years of experience.
    - **Penalty Rules**: Deduct points for red flags like long employment gaps or job-hopping.
    - **Bias Safeguards**: Anonymize candidate details like name, university, and graduation year to reduce screening bias.
- **AI-Powered Skill Suggestions**: Scrapes job boards (LinkedIn, Indeed, etc.) to suggest relevant, market-aligned skills for your job roles.
- **Bulk Resume Screening**: Upload multiple resumes (.pdf, .docx, .txt) at once and screen them against a selected job role.
- **Automated Content Generation**:
    - Generates technical and behavioral interview questions for shortlisted candidates.
    - Creates polite rejection feedback with actionable suggestions for non-qualifying candidates.
    - Provides a concise summary of each candidate's strengths and weaknesses for recruiters.
- **Demo Mode**: The application is seeded with a demo "Senior ML Engineer" role on first run so you can start screening immediately.

## 🛠️ Tech Stack

- **Frontend**: React
- **Backend**: Flask (Python)
- **AI/ML**: Hugging Face Inference API for NLP tasks.
- **Web Scraping**: BeautifulSoup / Scrapy

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

- Python 3.8+
- Node.js 16+ and npm

### Backend Setup

1.  **Navigate to the backend directory:**
    ```sh
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```sh
    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # For Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install the required Python packages:**
    ```sh
    pip install -r requirements.txt
    ```

4.  **Run the Flask development server:**
    ```sh
    flask run
    ```
    The backend API will be running at `http://127.0.0.1:5000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```sh
    cd frontend
    ```

2.  **Install the required npm packages:**
    ```sh
    npm install
    ```

3.  **Run the React development server:**
    ```sh
    npm start
    ```
    The frontend application will open in your browser at `http://localhost:3000`.

## ⚙️ API Endpoints

The core API endpoints include:

- `GET, POST /api/roles`: Manage the list of job roles.
- `GET, PUT, DELETE /api/roles/<id>`: Manage a specific job role and its nested scoring configuration.
- `POST /api/screen`: The main screening endpoint. Accepts `multipart/form-data` with a `resume` file and `job_role_id`.
- `POST /api/roles/<role_id>/suggest-skills`: Triggers the web scraper to find skills for a given job title.

## 🔮 Future Implementation Goals

- **Database Integration**: Persist roles, candidates, and results in a database like PostgreSQL or SQLite.
- **Enhanced Batch Processing**: Improve the UI for managing and tracking large batches of resumes.
- **Resume Builder Agent**: Add an interactive tool to help candidates improve their own resumes based on a target job description.

---

*This README was generated based on the project's requirements and source code.*