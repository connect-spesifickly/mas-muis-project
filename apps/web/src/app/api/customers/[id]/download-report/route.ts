import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    console.log("API Route: Customer ID:", id);

    // Get authorization header from the request
    const authHeader = request.headers.get("authorization");
    console.log("API Route: Auth header:", authHeader ? "Present" : "Missing");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    // Forward the request to the backend API
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const backendUrlFull = `${backendUrl}/api/customers/${id}/download-report`;
    console.log("API Route: Backend URL:", backendUrlFull);

    try {
      const response = await fetch(backendUrlFull, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      console.log("API Route: Backend response status:", response.status);
      console.log("API Route: Backend response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "API Route: Backend API error:",
          response.status,
          errorText
        );
        return NextResponse.json(
          { error: `Backend API error: ${response.status} - ${errorText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log("API Route: Backend data received:", !!data);
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error("API Route: Fetch error:", fetchError);
      const errorMessage =
        fetchError instanceof Error ? fetchError.message : "Unknown error";
      return NextResponse.json(
        { error: `Failed to connect to backend: ${errorMessage}` },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("API Route: General error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
