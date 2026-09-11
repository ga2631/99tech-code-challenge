# Git Topic Initialization Rule

Whenever the user requests to start a new task (e.g., "build feature A", "fix bug B", "refactor logic C"), you (Antigravity Agent) MUST strictly follow these steps to ensure a safe Git workflow before writing or modifying any code:

1. **Pre-check Working Tree:** Use the Terminal tool to execute `git status --porcelain`.
2. **Enforce Clean State Block:** If the output of `git status --porcelain` is NOT empty (meaning there are uncommitted or unpushed modifications), you MUST HALT immediately. Alert the user that they have pending changes and ask for confirmation on how to handle them (commit & push, stash, or discard). DO NOT proceed to the next step.
3. **Determine Branch Naming:** ONLY if the working tree is completely clean, analyze the user's request to select a valid `<type>` (`feat`, `fix`, `docs`, `refactor`, `chore`) based on the project standards. Translate the task into a concise `<topic-name>` (English, strictly lowercase, kebab-case).
4. **Execute Initialization:** Use the Terminal tool to EXECUTE the following exact command chain:
   `git checkout -b <type>/<topic-name> && git commit --allow-empty -m "<type>(<topic-name>): initialize topic <topic-name>"`

You MUST wait for this command chain to execute successfully before proceeding to create or modify any project files.
