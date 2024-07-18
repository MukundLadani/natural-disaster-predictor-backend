import axios from "axios";

async function getWeatherData(latitude, longitude, location) {
	const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,sunshine_duration,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_probability_max,wind_speed_10m_max,shortwave_radiation_sum&past_days=7&forecast_days=14`;

	try {
		const response = await axios.get(url);
		const responseData = response.data;
		responseData.location = location;
		return responseData;
	} catch (error) {
		if (error.response && error.response.status === 429) {
			console.log(
				"You have made too many requests in a short period. Please try again later."
			);
		} else {
			console.log("Error retrieving weather data. Please try again later.");
		}
		console.error("Error sending location data:", error);
		throw error; // Re-throw the error for further handling if necessary
	}
}

export { getWeatherData };
