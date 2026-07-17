export async function onRequestGet(context) {
  return new Response(JSON.stringify({ message: "Hello from Functions!" }), {
    headers: { "Content-Type": "application/json" },
  });
}
