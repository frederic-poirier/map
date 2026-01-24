import json
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer

PHOTON_PORT = 5000
OTP_PORT = 8080

def port_open(port):
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.5):
            return True
    except OSError:
        return False

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/health":
            self.send_response(404)
            self.end_headers()
            return

        status = {
            "photon": "up" if port_open(PHOTON_PORT) else "down",
            "otp": "up" if port_open(OTP_PORT) else "down",
            "tunnel": "unknown"  # le tunnel est observé par cloudflared
        }

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(status).encode())

    def log_message(self, *_):
        pass

if __name__ == "__main__":
    HTTPServer(("127.0.0.1", 9000), Handler).serve_forever()

