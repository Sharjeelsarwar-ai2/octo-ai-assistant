
import "dotenv/config";

const key = process.env.AI_API_KEY;

if (!key) {
    console.log("API key missing from backend/.env");
    process.exit(1);
}

try {
    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models",
        {
            headers: {
                "x-goog-api-key": key
            }
        }
    );

    console.log("HTTP status:", response.status);

    const body = await response.json();

    if (!response.ok) {
        console.log("Google API error:", JSON.stringify(body.error ?? body));
    } else {
        console.log("Authentication successful.");
        console.log(
            "Available models:",
            (body.models ?? []).slice(0, 5).map(m => m.name)
        );
    }
} catch (error) {
    console.log("Network error:", error.message);
}
