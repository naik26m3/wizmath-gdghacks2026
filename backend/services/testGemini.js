import 'dotenv/config'; // Loads .env file
import { generateGeoGebraCommand } from './geminiService.js';

async function test() {
    const userPrompt = "Draw a red circle";
    console.log(`User requested: "${userPrompt}"`);
    
    try {
        console.log("Asking Gemini...");
        const command = await generateGeoGebraCommand(userPrompt);
        console.log(`\n✅ Gemini generated this GeoGebra command:\n${command}`);
    } catch (err) {
        console.error("Failed to test:", err.message);
        console.log("\n⚠️ Did you create a .env file with your GEMINI_API_KEY inside the backend folder?");
    }
}

test();
