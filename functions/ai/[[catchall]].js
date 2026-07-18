export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const aiEngineUrl = env.AI_ENGINE_URL || "https://ai-engin.onrender.com";

  let targetPath;
  if (url.pathname.startsWith("/ai/")) {
    targetPath = `/api/v1${url.pathname.slice(3)}`;
  } else {
    targetPath = url.pathname;
  }

  const targetUrl = `${aiEngineUrl}${targetPath}${url.search}`;

  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    if (key.toLowerCase() !== "host") {
      headers.set(key, value);
    }
  }

  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers,
    body: request.body,
    redirect: "follow",
  });

  try {
    const response = await fetch(modifiedRequest);
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("text/event-stream")) {
      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return response;
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: "AI Engine service unavailable" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
