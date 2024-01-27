const responseHeaders = $response.headers;

// strip off `expires` header
delete responseHeaders["expires"];
delete responseHeaders["Expires"];

$done({
  headers: {
    ...responseHeaders,
    "Cache-Control": "public, max-age=31356000",
  },
});
