const headers = {
  "Content-Type": "text/plain; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow",
};

export function GET() {
  return new Response("Gone", {
    status: 410,
    headers,
  });
}

export function HEAD() {
  return new Response(null, {
    status: 410,
    headers,
  });
}
