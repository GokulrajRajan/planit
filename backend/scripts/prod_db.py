"""Runs a Flask command against the production database (Neon) instead of the local one.

Put the Neon connection string in backend/.env as PROD_DATABASE_URL=..., then from the backend folder:

    venv\\Scripts\\python.exe scripts\\prod_db.py db upgrade      (create or update the tables)
    venv\\Scripts\\python.exe scripts\\prod_db.py create-admin   (asks for a name, email and password)

The connection string is only read from backend/.env, never printed, and only this command uses it: the
local database stays the default everywhere else.
"""

import os
import sys
from pathlib import Path

from dotenv import dotenv_values

BACKEND = Path(__file__).resolve().parent.parent


def main() -> None:
    url = (dotenv_values(BACKEND / ".env").get("PROD_DATABASE_URL") or "").strip()
    if not url:
        sys.exit("Add PROD_DATABASE_URL=<your Neon connection string> to backend/.env first.")

    # app/config.py loads backend/.env too, but never overrides variables that are already set.
    os.environ["DATABASE_URL"] = url
    os.environ["FLASK_APP"] = "run.py"
    os.chdir(BACKEND)
    sys.path.insert(0, str(BACKEND))
    print("Using the production database (PROD_DATABASE_URL).", file=sys.stderr)

    from flask.cli import main as flask_main

    sys.argv = ["flask", *sys.argv[1:]]
    flask_main()


if __name__ == "__main__":
    main()
