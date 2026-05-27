export async function POST(request) {
  const body = await request.json();
  
  const response = await fetch("https://api.jdoodle.com/v1/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: process.env.NEXT_PUBLIC_JDOODLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_JDOODLE_CLIENT_SECRET,
      script: body.script,
      language: body.language,
      versionIndex: body.versionIndex,
    }),
  });

  const data = await response.json();
  return Response.json(data);
}