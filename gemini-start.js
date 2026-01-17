import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const today = new Date();
const month = today.getMonth(); // 0-indexed (January = 0, December = 11)
const year = today.getFullYear();

const monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

const currentMonth = monthNames[month];

async function runWeather(data) {
	const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
	const location = data.location;

	const dataString = JSON.stringify(data);
	// const prompt =
	// 	`Based on the below forecast data, can you analyse and tell me how the weather will be mostly in ${currentMonth},${year} month in ${location} and what can be the potential natural risks? Please provide me only short conclusion` +
	// 	dataString;

	const prompt = `Based on the below forecast data, can you analyse and tell me how the weather will be mostly in ${currentMonth},${year} month in ${location} and what can be the potential natural risks? Please provide me only a short conclusion and avoid using **.\n\n**Analysis:** ${dataString}`;
	try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Execution Error:", error.message);
        // Fallback to 2.5 if 2.0 is somehow restricted in your region
        if (error.status === 404) {
            console.log("Attempting fallback to gemini-2.5-flash...");
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const fallbackResult = await fallbackModel.generateContent(prompt);
            return fallbackResult.response.text();
        }
        throw error;
    }

	// const prompt2 =
	// 	"Give me short conclusion part about prediction from the following text. Also, don't give me any headings like '*Conclusions*' just give me paragarph" +
	// 	text;

	// const result2 = await model.generateContent(prompt2);
	// const response2 = await result2.response;
	// const text2 = response2.text();

	// return text;
}

export { runWeather };
