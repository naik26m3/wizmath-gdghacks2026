import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEO_GEBRA_JSON_SHAPE = `{
  "commands": ["one GeoGebra command per array item"],
  "settings": {
    "resetBeforeRun": false,
    "showAxes": null,
    "showGrid": null,
    "xAxisStep": null,
    "yAxisStep": null,
    "xAxisUnit": "",
    "yAxisUnit": "",
    "axisRatio": null,
    "coordSystem": null
  }
}`;

const GEO_GEBRA_RULES = `CRITICAL RULES:
1. Return ONLY valid JSON. Do not include markdown formatting, explanations, or backticks.
2. Put only valid GeoGebra construction commands in "commands".
3. Axis distance/unit/grid/viewport requests belong in "settings", not in GeoGebra commands.
4. Use Slider(<Min>, <Max>, <Increment>, <Speed>, <Width>, false, true, false, false) for numeric sliders.
5. Commands must be ordered: define variables, sliders, and points before any object that uses them.
6. Avoid reserved or confusing names: c, l, i, e, pi. Use angleSlider, circleRadius, centerX, circle1 as examples of safe names. Never use "radius" as a name — it conflicts with GeoGebra internals.
7. null in settings means "leave GeoGebra default; do not change this setting."
8. Point names MUST start with an UPPERCASE letter: O, A, B, CenterPt, StartPt. A name starting with a lowercase letter (like centerPoint, origin, pt) creates a NUMBER or VECTOR, not a Point. Circle() and Segment() will silently fail when given a vector instead of a point.
9. Never put app/view actions in commands, including ZoomIn, ZoomOut, Pan, SetVisibleInView, SetAxesSteps, or SetAxesRatio.
10. For "x axis into 30 degrees each", use "xAxisStep": 30 and "xAxisUnit": "°".
11. For trig graphs intended to use degrees on the x-axis, use degree input in the function, e.g. f(x) = sin(x°), not f(x) = sin(x).
12. coordSystem must be an array [xmin, xmax, ymin, ymax] when requested.
13. Use "axisRatio": 1 when circles or squares need to look geometrically accurate on screen.
14. Avoid dependent slider limits such as Slider(0, denominator, 1). Make sliders fixed-range, then use If(...) or visibility conditions for visuals.
15. For circular fraction models, use Sector(circle, point1, point2) to create curved pie slices with a proper arc boundary. Do NOT use Polygon(O, pt1, pt2) — it creates flat triangles, not real sector shapes. Only Sector(A, angle1, angle2) is invalid syntax; Sector(conic, pt1, pt2) is fully valid.
16. NEVER use Sequence() to create geometric objects (segments, polygons, points) when those objects need any styling (SetColor, SetFilling, SetLineThickness, SetConditionToShowObject, SetShowLabel). Sequence results cannot be styled. Create individually named objects instead: ray1, ray2, ..., wedge1, wedge2, ...
17. For circles whose center or radius is controlled by a slider, ALWAYS use the implicit equation form like circle1: (x - cx)^2 + (y - cy)^2 = r^2 directly. Do NOT use Circle(point, radius) when the center or radius is slider-driven — Circle() silently fails when given a vector (which is what lowercase-named slider-built points become).
18. NEVER apply SetColor, SetFilling, SetLineThickness, or SetShowLabel to a Sequence result or a list variable. These commands only work on individually named objects. If you used Sequence, your solution is wrong — rewrite using named objects.
19. SetFontSize(object, size) requires a numeric size (e.g., 18), not a string like "Large".
20. NEVER use these names for sliders or variables — they are reserved or conflict with GeoGebra internals: radius, rad, deg, pi, e, c, l, i. The name "rad" in particular is silently treated as the radians unit, so "rad = Slider(...)" will fail and turn into an equation. Safe names for a radius slider: circleRadius, rSlider, radiusSlider, r1.
21. For points on a circle, ALWAYS use Cartesian form: (r * cos(angle), r * sin(angle)). NEVER use semicolon polar notation (r; angle) — it is not valid in GeoGebra commands or inside Sequence.
22. SetColor accepts only a quoted color name: SetColor(obj, "Blue"). It does NOT accept RGB integers like SetColor(obj, 0, 102, 204).
23. FORBIDDEN PATTERNS — these always produce errors. Never use them:
    BAD: radius = 3                          → GOOD: circleRadius = 3
    BAD: centerPoint = (0, 0)               → GOOD: O = (0, 0)  (uppercase = Point)
    BAD: Sequence(Polygon(...), k, 1, n)    → GOOD: wedge1 = Sector(whole, ...), wedge2 = Sector(whole, ...)
    BAD: (r; k * 2π / n)  polar notation   → GOOD: (r * cos(k * 360° / n), r * sin(k * 360° / n))
    BAD: SetFontSize(label, "Large")        → GOOD: SetFontSize(label, 18)
    BAD: SetColor(obj, 0, 102, 204)         → GOOD: SetColor(obj, "Blue")
24. For fraction circle models: pre-generate individually named objects from ray1/wedge1 up to rayN/wedgeN, where N is the denominator slider's maximum value. The few-shot example shows the pattern for N=12. If the user wants a max denominator of 20, generate ray1 through ray20 and wedge1 through wedge20 following the exact same pattern — do NOT stop at 12 and do NOT use Sequence for the extras.`;

const GEO_GEBRA_FEW_SHOTS = `Few-shot examples:

User: Create a slider that changes the phase of a sine wave.
You:
{
  "commands": [
    "angleSlider = Slider(0, 6.28, 0.01, 1, 150, false, true, false, false)",
    "f(x) = sin(x + angleSlider)",
    "SetColor(f, \\"Blue\\")"
  ],
  "settings": {
    "resetBeforeRun": true,
    "showAxes": true,
    "showGrid": true,
    "xAxisStep": null,
    "yAxisStep": null,
    "xAxisUnit": "",
    "yAxisUnit": "",
    "axisRatio": null,
    "coordSystem": [-6.28, 6.28, -2, 2]
  }
}

User: Draw a red circle at origin with radius 5.
You:
{
  "commands": [
    "circle1 = Circle((0, 0), 5)",
    "SetColor(circle1, \\"Red\\")"
  ],
  "settings": {
    "resetBeforeRun": false,
    "showAxes": true,
    "showGrid": null,
    "xAxisStep": null,
    "yAxisStep": null,
    "xAxisUnit": "",
    "yAxisUnit": "",
    "axisRatio": 1,
    "coordSystem": [-6, 6, -6, 6]
  }
}

User: set the x axis into 30 degree each, then graph a sin function
You:
{
  "commands": [
    "f(x) = sin(x°)",
    "SetColor(f, \\"Blue\\")"
  ],
  "settings": {
    "resetBeforeRun": false,
    "showAxes": true,
    "showGrid": true,
    "xAxisStep": 30,
    "yAxisStep": 1,
    "xAxisUnit": "°",
    "yAxisUnit": "",
    "axisRatio": null,
    "coordSystem": [-360, 360, -2, 2]
  }
}

User: Show a circle divided into equal slices using a Denominator slider (1 to 12). A Numerator slider (0 to 12) shades that many slices blue. Display the fraction as a label.
You:
{
  "commands": [
    "denominator = Slider(1, 12, 1, 1, 150, false, true, false, false)",
    "numerator = Slider(0, 12, 1, 1, 150, false, true, false, false)",
    "SetCaption(denominator, \\"Denominator\\")",
    "SetCaption(numerator, \\"Numerator\\")",
    "O = (0, 0)",
    "whole = Circle(O, 4)",
    "SetColor(whole, \\"Black\\")",
    "SetLineThickness(whole, 3)",
    "ray1 = Segment(O, (4 cos(0 * 360° / denominator), 4 sin(0 * 360° / denominator)))",
    "SetConditionToShowObject(ray1, 1 <= denominator)",
    "wedge1 = Sector(whole, (4 cos(0 * 360° / denominator), 4 sin(0 * 360° / denominator)), (4 cos(1 * 360° / denominator), 4 sin(1 * 360° / denominator)))",
    "SetConditionToShowObject(wedge1, 1 <= Min(numerator, denominator))",
    "SetColor(wedge1, \\"Blue\\")",
    "SetFilling(wedge1, 0.6)",
    "ray2 = Segment(O, (4 cos(1 * 360° / denominator), 4 sin(1 * 360° / denominator)))",
    "SetConditionToShowObject(ray2, 2 <= denominator)",
    "wedge2 = Sector(whole, (4 cos(1 * 360° / denominator), 4 sin(1 * 360° / denominator)), (4 cos(2 * 360° / denominator), 4 sin(2 * 360° / denominator)))",
    "SetConditionToShowObject(wedge2, 2 <= Min(numerator, denominator))",
    "SetColor(wedge2, \\"Blue\\")",
    "SetFilling(wedge2, 0.6)",
    "ray3 = Segment(O, (4 cos(2 * 360° / denominator), 4 sin(2 * 360° / denominator)))",
    "SetConditionToShowObject(ray3, 3 <= denominator)",
    "wedge3 = Sector(whole, (4 cos(2 * 360° / denominator), 4 sin(2 * 360° / denominator)), (4 cos(3 * 360° / denominator), 4 sin(3 * 360° / denominator)))",
    "SetConditionToShowObject(wedge3, 3 <= Min(numerator, denominator))",
    "SetColor(wedge3, \\"Blue\\")",
    "SetFilling(wedge3, 0.6)",
    "ray4 = Segment(O, (4 cos(3 * 360° / denominator), 4 sin(3 * 360° / denominator)))",
    "SetConditionToShowObject(ray4, 4 <= denominator)",
    "wedge4 = Sector(whole, (4 cos(3 * 360° / denominator), 4 sin(3 * 360° / denominator)), (4 cos(4 * 360° / denominator), 4 sin(4 * 360° / denominator)))",
    "SetConditionToShowObject(wedge4, 4 <= Min(numerator, denominator))",
    "SetColor(wedge4, \\"Blue\\")",
    "SetFilling(wedge4, 0.6)",
    "ray5 = Segment(O, (4 cos(4 * 360° / denominator), 4 sin(4 * 360° / denominator)))",
    "SetConditionToShowObject(ray5, 5 <= denominator)",
    "wedge5 = Sector(whole, (4 cos(4 * 360° / denominator), 4 sin(4 * 360° / denominator)), (4 cos(5 * 360° / denominator), 4 sin(5 * 360° / denominator)))",
    "SetConditionToShowObject(wedge5, 5 <= Min(numerator, denominator))",
    "SetColor(wedge5, \\"Blue\\")",
    "SetFilling(wedge5, 0.6)",
    "ray6 = Segment(O, (4 cos(5 * 360° / denominator), 4 sin(5 * 360° / denominator)))",
    "SetConditionToShowObject(ray6, 6 <= denominator)",
    "wedge6 = Sector(whole, (4 cos(5 * 360° / denominator), 4 sin(5 * 360° / denominator)), (4 cos(6 * 360° / denominator), 4 sin(6 * 360° / denominator)))",
    "SetConditionToShowObject(wedge6, 6 <= Min(numerator, denominator))",
    "SetColor(wedge6, \\"Blue\\")",
    "SetFilling(wedge6, 0.6)",
    "ray7 = Segment(O, (4 cos(6 * 360° / denominator), 4 sin(6 * 360° / denominator)))",
    "SetConditionToShowObject(ray7, 7 <= denominator)",
    "wedge7 = Sector(whole, (4 cos(6 * 360° / denominator), 4 sin(6 * 360° / denominator)), (4 cos(7 * 360° / denominator), 4 sin(7 * 360° / denominator)))",
    "SetConditionToShowObject(wedge7, 7 <= Min(numerator, denominator))",
    "SetColor(wedge7, \\"Blue\\")",
    "SetFilling(wedge7, 0.6)",
    "ray8 = Segment(O, (4 cos(7 * 360° / denominator), 4 sin(7 * 360° / denominator)))",
    "SetConditionToShowObject(ray8, 8 <= denominator)",
    "wedge8 = Sector(whole, (4 cos(7 * 360° / denominator), 4 sin(7 * 360° / denominator)), (4 cos(8 * 360° / denominator), 4 sin(8 * 360° / denominator)))",
    "SetConditionToShowObject(wedge8, 8 <= Min(numerator, denominator))",
    "SetColor(wedge8, \\"Blue\\")",
    "SetFilling(wedge8, 0.6)",
    "ray9 = Segment(O, (4 cos(8 * 360° / denominator), 4 sin(8 * 360° / denominator)))",
    "SetConditionToShowObject(ray9, 9 <= denominator)",
    "wedge9 = Sector(whole, (4 cos(8 * 360° / denominator), 4 sin(8 * 360° / denominator)), (4 cos(9 * 360° / denominator), 4 sin(9 * 360° / denominator)))",
    "SetConditionToShowObject(wedge9, 9 <= Min(numerator, denominator))",
    "SetColor(wedge9, \\"Blue\\")",
    "SetFilling(wedge9, 0.6)",
    "ray10 = Segment(O, (4 cos(9 * 360° / denominator), 4 sin(9 * 360° / denominator)))",
    "SetConditionToShowObject(ray10, 10 <= denominator)",
    "wedge10 = Sector(whole, (4 cos(9 * 360° / denominator), 4 sin(9 * 360° / denominator)), (4 cos(10 * 360° / denominator), 4 sin(10 * 360° / denominator)))",
    "SetConditionToShowObject(wedge10, 10 <= Min(numerator, denominator))",
    "SetColor(wedge10, \\"Blue\\")",
    "SetFilling(wedge10, 0.6)",
    "ray11 = Segment(O, (4 cos(10 * 360° / denominator), 4 sin(10 * 360° / denominator)))",
    "SetConditionToShowObject(ray11, 11 <= denominator)",
    "wedge11 = Sector(whole, (4 cos(10 * 360° / denominator), 4 sin(10 * 360° / denominator)), (4 cos(11 * 360° / denominator), 4 sin(11 * 360° / denominator)))",
    "SetConditionToShowObject(wedge11, 11 <= Min(numerator, denominator))",
    "SetColor(wedge11, \\"Blue\\")",
    "SetFilling(wedge11, 0.6)",
    "ray12 = Segment(O, (4 cos(11 * 360° / denominator), 4 sin(11 * 360° / denominator)))",
    "SetConditionToShowObject(ray12, 12 <= denominator)",
    "wedge12 = Sector(whole, (4 cos(11 * 360° / denominator), 4 sin(11 * 360° / denominator)), (4 cos(12 * 360° / denominator), 4 sin(12 * 360° / denominator)))",
    "SetConditionToShowObject(wedge12, 12 <= Min(numerator, denominator))",
    "SetColor(wedge12, \\"Blue\\")",
    "SetFilling(wedge12, 0.6)",
    "fractionLabel = Text(Min(numerator, denominator) + \\"/\\" + denominator, (5, 4))"
  ],
  "settings": {
    "resetBeforeRun": true,
    "showAxes": false,
    "showGrid": false,
    "xAxisStep": null,
    "yAxisStep": null,
    "xAxisUnit": "",
    "yAxisUnit": "",
    "axisRatio": 1,
    "coordSystem": [-6, 8, -6, 6]
  }
}

User: Add a circle that can move up and down with a slider.
You:
{
  "commands": [
    "ySlider = Slider(-5, 5, 0.1, 1, 150, false, true, false, false)",
    "SetCaption(ySlider, \\"Y Position\\")",
    "circle1: x^2 + (y - ySlider)^2 = 4",
    "SetColor(circle1, \\"Blue\\")",
    "SetLineThickness(circle1, 3)"
  ],
  "settings": {
    "resetBeforeRun": true,
    "showAxes": true,
    "showGrid": true,
    "xAxisStep": null,
    "yAxisStep": null,
    "xAxisUnit": "",
    "yAxisUnit": "",
    "axisRatio": 1,
    "coordSystem": [-7, 7, -7, 7]
  }
}

User: Movable circle: two sliders for x and y position, one for radius, blue outline.
You:
{
  "commands": [
    "xPos = Slider(-5, 5, 0.1, 1, 150, false, true, false, false)",
    "yPos = Slider(-5, 5, 0.1, 1, 150, false, true, false, false)",
    "circleRadius = Slider(0.2, 4, 0.1, 1, 150, false, true, false, false)",
    "SetCaption(xPos, \\"X Position\\")",
    "SetCaption(yPos, \\"Y Position\\")",
    "SetCaption(circleRadius, \\"Radius\\")",
    "circle1: (x - xPos)^2 + (y - yPos)^2 = circleRadius^2",
    "SetColor(circle1, \\"Blue\\")",
    "SetLineThickness(circle1, 3)"
  ],
  "settings": {
    "resetBeforeRun": true,
    "showAxes": true,
    "showGrid": true,
    "xAxisStep": null,
    "yAxisStep": null,
    "xAxisUnit": "",
    "yAxisUnit": "",
    "axisRatio": 1,
    "coordSystem": [-7, 7, -7, 7]
  }
}`;

function buildGenerationSystemInstruction() {
    return `You are an expert GeoGebra assistant.
Your job is to translate natural language math teaching requests into GeoGebra commands and applet settings.

JSON shape:
${GEO_GEBRA_JSON_SHAPE}

${GEO_GEBRA_RULES}

${GEO_GEBRA_FEW_SHOTS}

You will receive a JSON object with two fields:
- "userRequest": what the user wants to do
- "currentCommands": the GeoGebra commands currently active on the canvas

If currentCommands is empty, build from scratch.
If currentCommands has content, modify or extend it based on userRequest.
Always return the FULL updated command list, not just the changes.`;
}

function buildRepairSystemInstruction() {
    return `You repair GeoGebra command lists after the frontend has tried them in GeoGebra.
Return ONLY valid JSON. Do not include markdown formatting, explanations, or backticks.

JSON shape:
${GEO_GEBRA_JSON_SHAPE}

Repair-specific rules:
1. Remove or replace failed commands.
2. Preserve the user's original teaching intent.
3. Return a complete corrected command list, not only the failed commands.
4. Prefer simple, robust constructions over clever commands.

${GEO_GEBRA_RULES}

${GEO_GEBRA_FEW_SHOTS}`;
}

const FALLBACK_MODEL = 'gemini-2.5-flash';

async function generateWithRetry({ model, contents, systemInstruction, temperature, maxAttempts = 3 }) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const currentModel = attempt > 1 && model !== FALLBACK_MODEL ? FALLBACK_MODEL : model;

        try {
            const response = await ai.models.generateContent({
                model: currentModel,
                contents,
                config: {
                    systemInstruction,
                    temperature,
                },
            });

            const raw = response.text ?? '';
            const json = raw
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            return JSON.parse(json);
        } catch (error) {
            lastError = error;
            if (attempt === maxAttempts) {
                throw lastError;
            }
            const delay = error.status === 503 ? 3000 : 1000 * attempt;
            console.log(`[gemini] attempt ${attempt} failed (${error.status ?? 'parse error'}), retrying with ${currentModel === model ? FALLBACK_MODEL : model} in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

function validatePrompt(prompt, label = 'Prompt') {
    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
        throw new Error(`${label} cannot be empty`);
    }

    const trimmed = prompt.trim();
    if (trimmed.length > 2000) {
        throw new Error(`${label} is too long`);
    }

    return trimmed;
}

/**
 * Translates a natural language math prompt into GeoGebra commands.
 * 
 * @param {string} userPrompt - The user's natural language request (e.g., "Draw a red circle with radius 5")
 * @param {string[]} currentCommands - Commands currently active on the canvas
 * @returns {Promise<object>} - GeoGebra commands plus applet-level settings
 */
export async function generateGeoGebraConstruction(userPrompt, currentCommands = []) {
    try {
        const prompt = validatePrompt(userPrompt);
        const safeCurrentCommands = normalizeCommandInput(currentCommands);

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY");
        }

        const construction = await generateWithRetry({
            model: 'gemini-2.5-pro',
            contents: JSON.stringify({
                userRequest: prompt,
                currentCommands: safeCurrentCommands,
            }),
            systemInstruction: buildGenerationSystemInstruction(),
            temperature: 0.1,
        });

        return normalizeConstruction(construction);
    } catch (error) {
        console.error("Error connecting to Gemini:", error);
        throw new Error("Failed to generate GeoGebra construction");
    }
}
export async function generateGeoGebraCommand(userPrompt) {
    const construction = await generateGeoGebraConstruction(userPrompt);
    return construction.commands.join('\n');
}

/**
 * Tutor mode: a student is exploring a published activity and asks a question.
 * Gemini answers in plain language — it does NOT generate GeoGebra commands.
 */
export async function answerTutorQuestion({ question, activity, history = [] }) {
    try {
        const prompt = validatePrompt(question, 'Question');
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY");
        }

        const activityTitle = typeof activity?.title === 'string' ? activity.title : 'an activity';
        const activityDescription = typeof activity?.description === 'string' ? activity.description : '';
        const activityCommands = Array.isArray(activity?.commands) ? activity.commands : [];

        const systemInstruction = `You are Arcane, a friendly math tutor for the WizMath app.
A student is exploring an interactive math activity and may ask you questions about the math concept it demonstrates.

Activity title: "${activityTitle}"
${activityDescription ? `Activity description: ${activityDescription}` : ''}

The activity is built from these GeoGebra commands (for context only — do NOT mention GeoGebra syntax to the student):
${activityCommands.join('\n')}

How to respond:
- Explain the math concept in plain language a high-school student can follow.
- Be concise: 2-4 sentences for most questions.
- Be encouraging and supportive.
- Connect your explanation to what the student would see when they move the sliders or interact with the activity.
- Do NOT teach GeoGebra syntax. Do NOT give code. Just explain the math.
- If the student asks something unrelated to math, gently steer them back to the activity.

Return ONLY the answer text — no JSON, no markdown, no formatting.`;

        const turns = [];
        for (const m of history.slice(-8)) {
            if (m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'ai')) {
                turns.push({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] });
            }
        }
        turns.push({ role: 'user', parts: [{ text: prompt }] });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: turns,
            config: {
                systemInstruction,
                temperature: 0.7,
            },
        });

        const text = (response.text ?? '').trim();
        if (!text) throw new Error('Empty response from Gemini');
        return text;
    } catch (error) {
        console.error('Error answering tutor question:', error);
        throw new Error('Failed to answer tutor question');
    }
}

export async function repairGeoGebraConstruction({ originalPrompt, commands, failedCommands, settings }) {
    try {
        const prompt = validatePrompt(originalPrompt, 'Original prompt');
        const safeCommands = Array.isArray(commands) ? commands : [];
        const safeFailedCommands = Array.isArray(failedCommands) ? failedCommands : [];

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY");
        }

        const construction = await generateWithRetry({
            model: 'gemini-2.5-flash',
            contents: JSON.stringify({
                originalPrompt: prompt,
                commands: safeCommands,
                failedCommands: safeFailedCommands,
                settings: settings ?? null,
            }),
            systemInstruction: buildRepairSystemInstruction(),
            temperature: 0.05,
        });

        return normalizeConstruction(construction);
    } catch (error) {
        console.error("Error repairing GeoGebra commands:", error);
        throw new Error("Failed to repair GeoGebra commands");
    }
}
function normalizeConstruction(construction) {
    const commands = Array.isArray(construction.commands)
        ? construction.commands.filter(command => typeof command === 'string' && command.trim()).map(command => command.trim())
        : [];

    if (commands.length === 0) {
        throw new Error("Gemini returned no GeoGebra commands");
    }

    const settings = construction.settings && typeof construction.settings === 'object'
        ? construction.settings
        : {};

    return {
        commands,
        command: commands.join('\n'),
        settings: {
            resetBeforeRun: settings.resetBeforeRun === true,
            showAxes: typeof settings.showAxes === 'boolean' ? settings.showAxes : null,
            showGrid: typeof settings.showGrid === 'boolean' ? settings.showGrid : null,
            xAxisStep: toNumberOrNull(settings.xAxisStep),
            yAxisStep: toNumberOrNull(settings.yAxisStep),
            xAxisUnit: typeof settings.xAxisUnit === 'string' ? settings.xAxisUnit : '',
            yAxisUnit: typeof settings.yAxisUnit === 'string' ? settings.yAxisUnit : '',
            axisRatio: toNumberOrNull(settings.axisRatio),
            coordSystem: normalizeCoordSystem(settings.coordSystem),
        },
    };
}

function normalizeCommandInput(commands) {
    if (!Array.isArray(commands)) {
        return [];
    }

    return commands
        .filter(command => typeof command === 'string' && command.trim())
        .map(command => command.trim())
        .slice(0, 500);
}

function toNumberOrNull(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function normalizeCoordSystem(value) {
    if (!Array.isArray(value) || value.length !== 4) {
        return null;
    }

    const numbers = value.map(Number);
    return numbers.every(Number.isFinite) ? numbers : null;
}
