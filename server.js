const express = require('express');
const path = require('path');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Routes
app.post('/api/generate', async (req, res) => {
    try {
        const { goal, format, tone, style, additional } = req.body;
        
        // Validate input
        if (!goal) {
            return res.status(400).json({ error: 'Goal is required' });
        }
        
        // Create system prompt for the ChatGPT API
        const systemPrompt = `You are an expert at crafting effective prompts for ChatGPT. 
Your job is to take the user's request and transform it into a clear, well-structured prompt 
that will get the best possible response from ChatGPT.

Follow these guidelines:
1. Write the prompt in first person (from the user's perspective)
2. Be specific and clear about exactly what is wanted
3. Structure the prompt logically
4. Include any relevant context or constraints
5. Optimize the prompt to get the most helpful and relevant response possible

Format the prompt as plain text that can be copied and pasted directly to ChatGPT.`;

        // Create user prompt based on form inputs
        let userPrompt = `Please create an optimized ChatGPT prompt based on the following requirements:

Goal: ${goal}

Output Format: ${format}

Tone: ${tone}

Writing Style: ${style}`;

        // Add additional requirements if provided
        if (additional) {
            userPrompt += `\n\nAdditional Requirements: ${additional}`;
        }
        
        userPrompt += `\n\nPlease craft a prompt that I can copy and paste directly into ChatGPT to get the best possible response for my needs. The prompt should be clear, detailed, and formatted for optimal results.`;
        
        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // You can use gpt-4 for better results if available
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 500
        });
        
        // Extract and send the generated prompt
        const generatedPrompt = response.choices[0].message.content.trim();
        res.json({ prompt: generatedPrompt });
        
    } catch (error) {
        console.error('Error generating prompt:', error);
        res.status(500).json({ 
            error: 'Failed to generate prompt',
            message: error.message 
        });
    }
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});