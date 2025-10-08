import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

const server = new McpServer(
    {
        name: "Weather",
        version: "1.0.0",
        description: "A simple weather MCP server",
        capabilities: {
            resouces: {},
            tools: {}
        },
    }
);

async function makeNWSRequest<T>(url: string): Promise<T | null> {
    const headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/geo+json",
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json()) as T;
    } catch (error) {
        console.error(`Error making NWS request to ${url}:`, error);
        return null;
    }
}

interface AlertFeature {
    properties: {
        event: string;
        areaDesc?: string;
        severity?: string;
        status?: string;
        headline?: string;
    };
}

function formatAlert(feature: AlertFeature): string {
    const props = feature.properties;
    return [
        `Event: ${props.event || "Unknown"}`,
        `Area: ${props.areaDesc || "Unknown"}`,
        `Severity: ${props.severity || "Unknown"}`,
        `Status: ${props.status || "Unknown"}`,
        `Headline: ${props.headline || "Unknown"}`,
        "---"
    ].join("\n");
}

interface ForecastPeriod {
    name?: string;
    temperature?: number;
    temperatureUnit?: string;
    windSpeed?: string;
    windDirection?: string;
    shortForecast?: string;
}

interface AlertResponse {
    features: AlertFeature[];
}

interface PointsResponse {
    properties: {
        forecast?: string;
    };
}

interface ForecastResponse {
    properties: {
        periods: ForecastPeriod[];
    };
}

interface ForecastRequest {
    properties: {
        periods: ForecastPeriod[];
    };
}

server.tool(
    "getAlerts",
    "Get weather alerts for a state",
    {
        state: z.string().length(2).describe("The two-letter state code"),
    },
    async ({ state }) => {
        const stateCode = state.toUpperCase();
        const alertUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
        const alertsData = await makeNWSRequest<AlertResponse>(alertUrl);

        if (!alertsData) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to retrieve alerts data",
                    },
                ],
            }
        }

        const features = alertsData.features || [];
        if (features.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No active alerts for ${stateCode}",
                    },
                ],
            }
        }
        const formattedAlerts = features.map(formatAlert);
        const alertsText = `Active alerts for ${stateCode}:\n${formattedAlerts.join("\n\n")}`;
        return {
            content: [
                {
                    type: "text",
                    text: alertsText,
                },
            ],
        };
    });

server.tool(
    "getForecast",
    "Get the weather forecast for a location",
    {
        latitude: z.number().min(-90).max(90).describe("The latitude of the location"),
        longitude: z.number().describe("The longitude of the location"),
    },
    async ({ latitude, longitude }) => {
        const pointUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
        const pointData = await makeNWSRequest<PointsResponse>(pointUrl);
        if (!pointData) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}",
                    },
                ],
            };
        }

        const forecastUrl = pointData.properties?.forecast;
        if (!forecastUrl) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to retrieve forecast data for coordinates: ${latitude}, ${longitude}",
                    },
                ],
            };
        }

        const forecastData = await makeNWSRequest<ForecastResponse>(forecastUrl);
        if (!forecastData) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to retrieve forecast data for coordinates: ${latitude}, ${longitude}",
                    },
                ],
            };
        }

        const periods = forecastData.properties?.periods || [];
        if (periods.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No forecast data available for coordinates: ${latitude}, ${longitude}",
                    },
                ],
            };
        }
    
        const formattedPeriods = periods.map((period: ForecastPeriod) => [
            `${period.name || "Unknown"}: ${period.temperature} ${period.temperatureUnit}`,
            `Wind: ${period.windSpeed} ${period.windDirection}`,
            `Forecast: ${period.shortForecast || "Unknown"}`,
            "---"
        ].join("\n"));
        const forecastText = `Forecast for ${latitude}, ${longitude}:\n${formattedPeriods.join("\n\n")}`;
        return {
            content: [
                {
                    type: "text",
                    text: forecastText,
                },
            ],
        };
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Weather MCP server started");
}

main().catch((error ) => {
    console.error("Error starting weather MCP server:", error);
    process.exit(1);
});