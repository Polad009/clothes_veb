import sys
import io
import os
import base64
import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import rembg
from PIL import Image

PORT = 5155
HOST = "127.0.0.1"

print("[AI Rembg Server] Initializing U2-Net session...")
SESSION = rembg.new_session("u2net")

# Warm up
try:
    dummy = Image.new("RGBA", (64, 64), (255, 255, 255, 255))
    rembg.remove(dummy, session=SESSION)
    print("[AI Rembg Server] Model pre-warmed and ready in RAM!")
except Exception as e:
    print(f"[AI Rembg Server] Pre-warm note: {e}")

def process_image_bytes(input_bytes: bytes) -> bytes:
    img = Image.open(io.BytesIO(input_bytes)).convert("RGBA")
    # Clean with rembg
    clean_img = rembg.remove(img, session=SESSION)
    buf = io.BytesIO()
    clean_img.save(buf, format="PNG")
    return buf.getvalue()

class BgHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
            return
        self.send_response(404)
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if self.path == "/remove-bg":
            try:
                content_len = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_len)
                
                # Check if JSON
                content_type = self.headers.get("Content-Type", "")
                if "application/json" in content_type:
                    data = json.loads(body.decode("utf-8"))
                    raw_data = data.get("image", "")
                    if "," in raw_data:
                        raw_data = raw_data.split(",", 1)[1]
                    img_bytes = base64.b64decode(raw_data)
                else:
                    img_bytes = body

                t0 = time.time()
                clean_png_bytes = process_image_bytes(img_bytes)
                duration = round(time.time() - t0, 3)
                print(f"[AI Rembg Server] Image cleaned successfully in {duration}s")

                b64_res = "data:image/png;base64," + base64.b64encode(clean_png_bytes).decode("ascii")
                resp = json.dumps({"success": True, "image": b64_res, "duration": duration}).encode("utf-8")

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Length", str(len(resp)))
                self.end_headers()
                self.wfile.write(resp)
            except Exception as e:
                print(f"[AI Rembg Server] Error processing image: {e}")
                err_resp = json.dumps({"success": False, "error": str(e)}).encode("utf-8")
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(err_resp)
            return

        self.send_response(404)
        self.end_headers()

    def log_message(self, format, *args):
        # Concise logging
        pass

if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "--file":
        in_path = sys.argv[2]
        out_path = sys.argv[3] if len(sys.argv) > 3 else "output_clean.png"
        with open(in_path, "rb") as f:
            res = process_image_bytes(f.read())
        with open(out_path, "wb") as f:
            f.write(res)
        print(f"Saved cleaned image to {out_path}")
        sys.exit(0)

    server = HTTPServer((HOST, PORT), BgHandler)
    print(f"[AI Rembg Server] Serving background removal at http://{HOST}:{PORT}/remove-bg")
    server.serve_forever()
