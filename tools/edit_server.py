"""Local preview + inline text editing for the portfolio.

Run:  python3 tools/edit_server.py      then open  http://localhost:8811/?edit
Click any text, type, and press Cmd+S. The change is written into index.html
(the old file is kept as index.html.bak). Only listens on 127.0.0.1.
"""
import http.server, os, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8811

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        if self.path != '/__save':
            return self.send_error(404)
        n = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(n).decode('utf-8')
        if '<main id="main">' not in body or len(body) < 5000:
            return self.send_error(400, 'refusing to write a page without <main>')
        dst = os.path.join(ROOT, 'index.html')
        shutil.copyfile(dst, dst + '.bak')
        with open(dst, 'w', encoding='utf-8') as f:
            f.write(body)
        self.send_response(204); self.end_headers()
        print('saved index.html', len(body), 'bytes')

http.server.ThreadingHTTPServer(('127.0.0.1', PORT), H).serve_forever()
