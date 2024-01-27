const responseHeaders = $response.headers;

// strip off `expires` header
delete responseHeaders["expires"];

$done({
  headers: {
    ...responseHeaders,
    "Cache-Control": "public, max-age=31356000",
  },
});
