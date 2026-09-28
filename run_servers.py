import subprocess
import sys
import time
import os
import webbrowser

def main():
    print("==================================================================")
    print(" BHUMI-SYNC: AI-Powered Urban Land Record Harmonization Platform")
    print(" Ministry of Rural Development • Smart India Hackathon (SIH26013)")
    print("==================================================================")
    print("\n[1/3] Initializing Database & Backend Server (FastAPI on :8000)...")
    
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=os.path.dirname(os.path.abspath(__file__))
    )

    time.sleep(2)
    print("\n[2/3] Launching Frontend Development Server (Vite on :5173)...")

    frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir
    )

    time.sleep(3)
    url = "http://localhost:5173"
    print(f"\n[3/3] Application Live at: {url}")
    print("      Backend API & Swagger Docs at: http://127.0.0.1:8000/api/docs")
    print("\nPress Ctrl+C in this terminal to stop both servers.\n")

    try:
        webbrowser.open(url)
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping BHUMI-SYNC servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
