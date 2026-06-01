#!/usr/bin/env python3
"""Helper script to bootstrap and run the FastAPI backend.

Why this script?
- **Zero‑setup for you**: It creates a virtual environment (if missing),
  installs the packages from ``backend/requirements.txt`` and then launches
  ``uvicorn`` with the FastAPI app defined in ``backend/app/main.py``.
- **Interview‑ready explanation**:  You can point to this script and say,
  "I automate environment provisioning and server start‑up so I can spend
  time on business logic instead of manual `pip install` steps."
- **Cross‑platform**: Works on Windows (uses ``Scripts`` folder) and *nix
  (uses ``bin``).  The script is pure Python – no extra shell files.
"""
import subprocess
import sys
import os
import pathlib

def run(cmd: str, env=None):
    """Run a shell command, raising on failure.
    ``env`` can be a custom environment mapping; otherwise inherits the
    current process environment.
    """
    print(f"$ {cmd}")
    subprocess.run(cmd, shell=True, check=True, env=env)

def main():
    # 1️⃣ Determine project root (the folder containing this script's parent).
    project_root = pathlib.Path(__file__).resolve().parents[1]
    venv_path = project_root / "venv"

    # 2️⃣ Create virtual environment if it does not exist.
    if not venv_path.exists():
        print("Creating virtual environment at", venv_path)
        run(f"python -m venv {venv_path}")
    else:
        print("Virtual environment already exists.")

    # 3️⃣ Compute the path to the pip executable inside the venv.
    if os.name == "nt":  # Windows
        pip_exe = venv_path / "Scripts" / "pip.exe"
        python_exe = venv_path / "Scripts" / "python.exe"
    else:
        pip_exe = venv_path / "bin" / "pip"
        python_exe = venv_path / "bin" / "python"

    # 4️⃣ Install (or upgrade) the required packages.
    requirements_file = project_root / "backend" / "requirements.txt"
    print("Installing dependencies from", requirements_file)
    run(f"{python_exe} -m pip install -U pip setuptools")
    run(f"{python_exe} -m pip install -r {requirements_file}")

    # 5️⃣ Launch the FastAPI app with uvicorn.
    #    ``--reload`` gives hot‑reloading during development – great for demo.
    app_path = "backend.app.main:app"
    print("Starting FastAPI server…")
    run(f"{python_exe} -m uvicorn {app_path} --host 0.0.0.0 --port 8000 --reload")

if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        sys.exit(e.returncode)
