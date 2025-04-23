import { APIGatewayProxyHandler } from "aws-lambda";
import axios from "axios";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent",
};

export const proxyRequest: APIGatewayProxyHandler = async (event) => {
  // Handle OPTIONS requests for CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    const targetUrl = process.env.TARGET_URL;
    if (!targetUrl) {
      throw new Error("TARGET_URL environment variable is not set");
    }

    // Construct URL with query parameters
    const url = new URL(targetUrl + event.path);
    if (event.queryStringParameters) {
      Object.entries(event.queryStringParameters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, value);
        }
      });
    }

    // Forward the request to the target URL
    const response = await axios({
      method: event.httpMethod,
      url: url.toString(),
      headers: {
        ...event.headers,
        host: url.host,
      },
      data: event.body,
      validateStatus: () => true, // Don't throw on any status code
    });

    // Return the response with CORS headers
    return {
      statusCode: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers["content-type"] || "application/json",
      },
      body:
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data),
    };
  } catch (error) {
    console.error("Proxy error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
