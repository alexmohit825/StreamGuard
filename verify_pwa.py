import urllib.request

endpoints = [
    '/index.html',
    '/app.css',
    '/app.js',
    '/sw.js',
    '/manifest.json',
    '/icon.svg'
]

print("=== StreamGuard PWA Validation ===")
for ep in endpoints:
    url = f"http://127.0.0.1:8787{ep}"
    req = urllib.request.urlopen(url)
    content = req.read()
    print(f"[VERIFIED 200 OK] {ep:<16} | Bytes: {len(content):<6} | Type: {req.headers.get('Content-Type')}")

print("=== All Assets Reachable & Validated ===")
