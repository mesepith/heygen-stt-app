// This is a Next.js API Route. It runs securely on the server.

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const baseApiUrl = process.env.NEXT_PUBLIC_BASE_API_URL || "https://api.heygen.com";

export async function POST() {
  // Check if the API key is available on the server.
  if (!HEYGEN_API_KEY) {
    return new Response("Server is missing HEYGEN_API_KEY.", {
      status: 500,
    });
  }

  try {
    // Make a request to the Heygen API to create a new streaming token.
    // This is where your secret API key is used.
    const res = await fetch(`${baseApiUrl}/v1/streaming.create_token`, {
      method: "POST",
      headers: {
        "x-api-key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Heygen API Error:", errorText);
      return new Response(`Failed to retrieve access token: ${errorText}`, {
        status: res.status,
      });
    }

    const data = await res.json();

    // Check if the token was successfully created.
    if (!data?.data?.token) {
      console.error("Invalid response from Heygen token endpoint:", data);
      return new Response("Failed to parse token from Heygen response.", {
        status: 500,
      });
    }
    
    // Send the temporary token back to the client (frontend).
    return new Response(data.data.token, {
      status: 200,
    });

  } catch (error) {
    console.error("Error retrieving access token:", error);
    return new Response("An internal server error occurred.", {
      status: 500,
    });
  }
}