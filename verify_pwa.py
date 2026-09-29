import urllib.request

endpoints = [
    '/index.html',
    '/app.css',
    '/app.js',
    '/sw.js',
    '/manifest.json',
    '/icon.svg'
]

base_url = "https://alexmohit825.github.io/StreamGuard"

print("=== StreamGuard Live Production PWA Validation ===")
for ep in endpoints:
    url = f"{base_url}{ep}"
    req = urllib.request.urlopen(url)
    content = req.read()
    print(f"[PROD VERIFIED 200 OK] {ep:<16} | Bytes: {len(content):<6} | Type: {req.headers.get('Content-Type')}")

print("=== Production Deployment 100% Live & Validated ===")
