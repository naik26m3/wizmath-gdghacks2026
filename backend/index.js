import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateGeoGebraConstruction, repairGeoGebraConstruction, answerTutorQuestion, generateActivityDescription } from './services/geminiService.js';

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, '../frontend');

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(frontendPath));

app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'wizmath-backend' });
});

app.post('/api/generate', async (req, res) => {
    const { prompt, currentCommands } = req.body ?? {};

    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({
            error: 'Prompt is required.',
        });
    }

    if (prompt.length > 2000) {
        return res.status(400).json({
            error: 'Prompt is too long.',
        });
    }

    try {
        const construction = await generateGeoGebraConstruction(prompt.trim(), currentCommands);
        return res.json(construction);
    } catch (error) {
        console.error('Failed to generate GeoGebra command:', error);
        return res.status(500).json({
            error: 'Failed to generate GeoGebra command.',
        });
    }
});

app.post('/api/repair', async (req, res) => {
    const { originalPrompt, commands, failedCommands, settings } = req.body ?? {};

    if (typeof originalPrompt !== 'string' || !Array.isArray(commands) || !Array.isArray(failedCommands)) {
        return res.status(400).json({
            error: 'originalPrompt, commands, and failedCommands are required.',
        });
    }

    if (originalPrompt.trim().length === 0 || originalPrompt.length > 2000) {
        return res.status(400).json({
            error: 'Original prompt must be between 1 and 2000 characters.',
        });
    }

    if (failedCommands.length === 0) {
        return res.status(400).json({
            error: 'At least one failed command is required.',
        });
    }

    try {
        const repaired = await repairGeoGebraConstruction({
            originalPrompt,
            commands,
            failedCommands,
            settings,
        });
        return res.json(repaired);
    } catch (error) {
        console.error('Failed to repair GeoGebra commands:', error);
        return res.status(500).json({
            error: 'Failed to repair GeoGebra commands.',
        });
    }
});

app.post('/api/tutor', async (req, res) => {
    const { question, activity, history } = req.body ?? {};

    if (typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ error: 'Question is required.' });
    }
    if (question.length > 2000) {
        return res.status(400).json({ error: 'Question is too long.' });
    }

    try {
        const answer = await answerTutorQuestion({
            question: question.trim(),
            activity: activity ?? {},
            history: Array.isArray(history) ? history : [],
        });
        return res.json({ answer });
    } catch (error) {
        console.error('Failed to answer tutor question:', error);
        return res.status(500).json({ error: 'Failed to answer the question.' });
    }
});

app.post('/api/describe', async (req, res) => {
    const { title, commands, userHint } = req.body ?? {};

    if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required.' });
    }
    if (title.length > 200) {
        return res.status(400).json({ error: 'Title is too long.' });
    }

    try {
        const description = await generateActivityDescription({
            title: title.trim(),
            commands: Array.isArray(commands) ? commands : [],
            userHint: typeof userHint === 'string' ? userHint : '',
        });
        return res.json({ description });
    } catch (error) {
        console.error('Failed to generate description:', error);
        return res.status(500).json({ error: 'Failed to generate description.' });
    }
});

app.listen(PORT, () => {
    console.log(`WizMath backend running at http://localhost:${PORT}`);
});
