export async function POST(req: Request): Promise<Response> {
  const signature = req.headers.get("x-ls-signature");
  if (!signature) {
    console.warn(
      "[legalserver webhook] Missing x-ls-signature header — request unauthenticated",
    );
  }

  const body = await req.json();
  console.log("[legalserver webhook] Received event", JSON.stringify(body));

  // TODO: emit Inngest event
  // await inngest.send({ name: "legalserver/webhook.received", data: body });

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
