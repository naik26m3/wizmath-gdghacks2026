# WizMath GDG Hacks 2026

Low-code math concept builder powered by Gemini and GeoGebra.

## Run the demo

1. Create `backend/.env` with:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

2. Start the backend:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. Open the app:

   ```text
   http://localhost:3000
   ```

The frontend sends prompts to `POST /api/generate`, receives GeoGebra commands, and executes them in the embedded GeoGebra applet.
