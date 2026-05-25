# Project Requirements: Screen-U - Recruitment Intelligence

## 1. High-Level Description
Screen-U is a web application that automates and supercharges the initial resume screening process. It will operate as a clean, utilitarian SaaS platform for recruiters. The system takes a candidate's resume and compares it against a highly configurable **Job Role**, which defines specific scoring rules.

The application will analyze the resume, calculate a detailed match score, and then either generate tailored interview questions for promising candidates or provide constructive feedback for those who don't meet the threshold. A key feature is its ability to scrape job boards to inform and suggest relevant skills for a role.

## 2. Tech Stack
- **Frontend:** React
- **Backend:** Flask (Python)
- **AI/ML:** Hugging Face Inference API
- **Web Scraping:** A library like BeautifulSoup or Scrapy.

## 3. UI/UX Requirements
The user interface will be based on the detailed designs provided in `ui_description.md` and the accompanying HTML files.
- **Product Name:** Screen-U
- **Aesthetic:** Clean, professional, and data-dense, with a primary accent color of `#185FA5`.
- **Layout:** A two-column shell with a fixed left sidebar for navigation and a main content area.
- **Key Pages:**
    - **Dashboard:** A candidate pipeline view with summary metrics, a filterable candidate table, and a detailed candidate panel.
    - **Resume Upload:** A drag-and-drop zone for bulk uploading of resumes.
    - **Job Roles:** A CRUD interface for defining job roles and their specific screening criteria.
    - **Scoring Rules Configurator:** An interactive page to fine-tune the scoring engine for each job role.
    - **Interview Generator:** A view to configure and generate a full set of interview questions.
    - **Reports:** An analytics dashboard with funnels, charts, and data exports.

## 4. Core Features

### 4.1. Job Role Management (Role-Based Evaluation)
This is the core of the application. The system's judgment will be based on rules defined per role.
- **CRUD for Job Roles:** Recruiters can create, read, update, and delete Job Roles.
- **Each Job Role will have its own `Scoring Configuration`**, ensuring a Junior and Senior role are judged by different standards.
- A Job Role definition will include: Role title, department, description, and its associated `Scoring Configuration`.

### 4.2. Configurable Scoring Engine
Based on `scoring_rules_configurator.html`, each Job Role will have a detailed set of rules:
- **Skill Weights:** An interactive UI to set the importance of required skills (e.g., Python: 90%, Kubernetes: 40%).
- **Experience Bands:** Configurable score multipliers based on years of experience (e.g., 0-2 years = x0.6, 8+ years = x1.1).
- **Penalty Rules:** Score deductions for negative signals like long employment gaps, job-hopping, or missing a relevant degree.
- **Auto-Shortlist Threshold:** A configurable match score (e.g., 75%) that a candidate must meet to be automatically shortlisted.
- **Bias Safeguards:** Toggles to enable anonymization features like hiding names, suppressing university prestige, and removing graduation years to reduce bias.

### 4.3. Web Scraping for Skill Suggestions
- **Feature:** When creating or editing a Job Role, the recruiter can trigger a web scraping function.
- **Functionality:** The user inputs a job title (e.g., "Senior Data Scientist"). The backend scrapes job sites like **LinkedIn, Indeed, and Naukri** for similar roles and returns a list of frequently mentioned skills.
- **Outcome:** This provides an data-driven way for recruiters to ensure their required skills are aligned with the market. The recruiter can then easily add these suggested skills to the Skill Weights configuration.

### 4.4. Resume Screening Workflow
- **Input:** A recruiter uploads one or more resumes and selects the `Job Role` to screen against.
- **Backend Process:**
    1.  The system fetches the `Scoring Configuration` for the selected `Job Role`.
    2.  It parses the resume text.
    3.  **(LLM Call 1 & Scoring):** It analyzes the resume to extract skills, experience, etc., and calculates a score based on the detailed rules (weights, bands, penalties).
    4.  The final score is a weighted average of sub-scores like `Skills match`, `Experience fit`, and `Profile quality`.
- **Output:** The candidate appears in the pipeline with a detailed score breakdown.

### 4.5. Automated Decision & Content Generation
- **If `match_score` >= `Auto-Shortlist Threshold`:**
    - The candidate is marked as "Shortlisted".
    - **(LLM Call 2):** The system generates advanced technical and behavioral interview questions based on the job role's required skills and the candidate's specific experience.
- **If `match_score` < `Auto-Shortlist Threshold`:**
    - The candidate is marked for rejection.
    - **(LLM Call 3):** The system generates a polite rejection reasoning and actionable improvement suggestions.

### 4.6. Recruiter Summary
- **(LLM Call 4):** For every candidate, the system generates a concise summary highlighting strengths, weaknesses, and overall fit for the specific role, designed for a busy recruiter.

## 5. API Design

- `POST /api/roles/<role_id>/suggest-skills`:
    - **Request:** `{ "job_title": "Senior Data Scientist" }`
    - **Response:** `{ "suggested_skills": ["SQL", "Tableau", "Machine Learning", "Communication"] }`

- `POST /api/screen`:
    - **Request:** `multipart/form-data` with `resume` (file) and `job_role_id` (string).
    - **Response:** A JSON object with the detailed analysis, score breakdown (`overall`, `skills`, `experience`), and outcome (questions or rejection feedback).

- **CRUD Endpoints for Job Roles & Scoring:**
    - `GET, POST /api/roles`
    - `GET, PUT, DELETE /api/roles/<id>`
    - The `Scoring Configuration` will be a nested object within the `Job Role` model, so it can be updated via the `PUT /api/roles/<id>` endpoint.

## 6. Future Implementation Goals
- **Resume Builder Agent:** An interactive tool to help candidates improve their resumes.
- **Database Integration:** For persistence of roles, candidates, and results.
- **Batch Processing:** Enhanced UI for managing large batches of resumes.
