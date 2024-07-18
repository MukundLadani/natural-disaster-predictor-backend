import express from "express";
import cors from "cors";
import helmet from "helmet"; // Import helmet for CSP management
import { getWeatherData } from "./getweather.js";
import { runWeather } from "./gemini-start.js";
import rateLimit from "express-rate-limit";

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

const limiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000, //
	max: 10,
	standardHeaders: true,
	statusCode: 429, // 429 status code for too many requests
	message: "You have exceeded the rate limit. Please try again later.",
});

app.use(limiter);

// Route to handle location weather requests
app.post("/location-weather", limiter, async (req, res) => {
	// Extract location from request body
	const location = req.body;
	// Validate request body
	if (!location) {
		return res
			.status(400)
			.send({ message: "Missing location in request body" });
	}
	try {
		// Retrieve location details and weather forecast
		const locationdata = await getWeatherData(
			location.latitude,
			location.longitude,
			location.location
		);
		try {
			// Retrieve location prediction summary
			const details = await runWeather(locationdata);
			res.json(details); // Send location details in JSON response
		} catch (error) {
			if (error.name === "ValidationError") {
				// Example: Handle validation errors
				return { error: "Invalid input data. Please check and try again." };
			} else if (error.statusCode(429)) {
				return { error: "Too many requests! Try later on" };
			}
			console.error("Error in retrieving predictions of location", error);
			res.status(500).send({ message: "Internal server error" });
		}
	} catch (error) {
		console.error("Error retrieving location details from API", error);
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
