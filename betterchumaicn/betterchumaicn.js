function base64Decode(input) {
  // Define Base64 characters
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  // Remove any characters not in the Base64 characters list
  // and replace any '=' padding with ''
  let str = input.replace(/[^A-Za-z0-9+/]/g, "").replace(/=+$/, "");

  // Decoding
  let output = "";
  for (
    let bc = 0, bs = 0, buffer, i = 0;
    (buffer = str.charAt(i++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  // Handle UTF-8 decoding
  return decodeURIComponent(escape(output));
}

const b64ContentHTML = __CONTENT_HTML__;

const contentHTML = base64Decode(b64ContentHTML);

$done({
  response: {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
    body: contentHTML,
  },
});
