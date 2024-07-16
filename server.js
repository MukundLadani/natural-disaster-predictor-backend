import express from "express";
import cors from "cors";
import helmet from "helmet"; // Import helmet for CSP management
import { runWeather } from "./gemini-start.js";
const app = express();
app.use(cors());

app.use(express.json());

// Content Security Policy (CSP) configuration
const cspConfig = {
	directives: {
		defaultSrc: ["'self'"], // Restrict all resources by default
		fontSrc: [
			"'self'",
			"https://fonts.googleapis.com",
			"https://fonts.gstatic.com",
		], // Allow fonts from Google Fonts
		// Add other directives as needed (e.g., scriptSrc, imgSrc)
	},
	reportOnly: false, // Set to true for reporting violations without blocking (during development)
};

// Set CSP headers using Helmet
app.use(helmet.contentSecurityPolicy(cspConfig));

// Route to handle location weather requests
app.post("/location-weather", async (req, res) => {
	// Extract location from request body
	const location = req.body;

	// Validate request body
	if (!location) {
		return res
			.status(400)
			.send({ message: "Missing location in request body" });
	}

	try {
		// Retrieve location details
		const details = await runWeather(location);
		res.json(details); // Send location details in JSON response
	} catch (error) {
		if (
			error instanceof GoogleGenerativeAIFetchError &&
			error.message.includes("503 Service Unavailable")
		) {
			return { error: "Weather service overloaded. Please try again later." }; // Handle overloaded weather service
		} else if (error.name === "ValidationError") {
			// Example: Handle validation errors
			return { error: "Invalid input data. Please check and try again." };
		}

		console.error("Error retrieving location details:", error);
		res.status(500).send({ message: "Internal server error" });
	}
});

// Route to handle the root path (optional)
app.get("/", (req, res) => {
	res.send("Hello from the server!"); // Or redirect to another page
});

const PORT = process.env.PORT || 3000; // Use environment variable or default port

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
