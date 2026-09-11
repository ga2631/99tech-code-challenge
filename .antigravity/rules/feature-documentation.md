# Feature Documentation Rule

Whenever you (Antigravity Agent) finish implementing a new feature, bug fix, or technical task, you MUST generate a dedicated technical documentation file for it before concluding your session. DO NOT append to a general log file.

Strictly follow these steps:

1. **Determine the File Path:** Extract the `<topic-name>` from the current Git branch. Check if the directory `docs/features/` exists (create it if not). Create a new Markdown file at `docs/features/<topic-name>.md`.
2. **Draft Comprehensive Documentation:** Write a detailed technical document into this new file. The document MUST strictly follow this structure:
   - **# Feature: [Topic Name]**
   - **1. End-to-End System Flow:** Clearly explain the complete execution flow. Start from the User Interface/Client (Frontend/Vue 3 state & components), route through the API layer (Backend/NodeJS endpoints), and detail the processing in the Database or ETL engine (PostgreSQL/DuckDB/Medallion layers).
   - **2. Database & Schema Changes:** Document any new tables, columns, constraints, or EAV/JSONB structures introduced during this task.
   - **3. Technical Optimizations:** Explain any specific performance, security, or memory optimizations applied (e.g., NodeJS memory safety handling, efficient SQL queries, DuckDB batch processing, or frontend rendering optimizations). If none, state "N/A".
   - **4. Impacted Files:** Provide a list of all newly created or significantly modified files and briefly state their responsibilities.
3. **Save and Notify:** Write the content to the file. Notify the user that the feature implementation and its dedicated documentation (`docs/features/<topic-name>.md`) are complete and ready for review before they commit and push.
