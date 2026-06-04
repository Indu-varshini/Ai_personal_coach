import subprocess
import sys
import os

def main():
    print("Starting AI Personal Coach Servers...")
    
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")
    backend_script = os.path.join(root_dir, "backend", "run_server.py")
    
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    
    try:
        # Start frontend server
        frontend_process = subprocess.Popen(
            [npm_cmd, "run", "dev"], 
            cwd=frontend_dir
        )
        
        # Start backend server
        backend_process = subprocess.Popen(
            [sys.executable, backend_script],
            cwd=root_dir
        )
        
        print("\nBoth servers are running in the same terminal!")
        print("Press Ctrl+C to stop both servers.\n")
        
        # Wait for processes to complete
        frontend_process.wait()
        backend_process.wait()
        
    except KeyboardInterrupt:
        print("\nShutting down servers gracefully...")
        try:
            frontend_process.terminate()
            backend_process.terminate()
            frontend_process.wait(timeout=5)
            backend_process.wait(timeout=5)
        except Exception as e:
            print(f"Error during shutdown: {e}")
        finally:
            print("Servers stopped.")

if __name__ == "__main__":
    main()
