/**
 * Test Groq Vision API Integration
 * 
 * This script tests the Groq multimodal LLM integration
 * Run: node examples/test-groq.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * Test Groq vision analysis with a sample image
 */
async function testGroqVision() {
    console.log('Testing Groq Vision API...\n');
    
    // Check for API key
    if (!process.env.GROQ_API_KEY) {
        console.error('ERROR: GROQ_API_KEY environment variable not set');
        console.log('Please set it with: export GROQ_API_KEY="your-api-key"');
        process.exit(1);
    }
    
    try {
        const Groq = require('groq-sdk');
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
        
        console.log('✓ Groq client initialized');
        
        // Test with a sample image URL (you can replace with your own)
        const testImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg';
        
        console.log('Analyzing test image...');
        console.log('Image URL:', testImageUrl);
        console.log('');
        
        const completion = await groq.chat.completions.create({
            model: "llama-3.2-90b-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Analyze this image and describe what you see. Provide details about: 1) Main subjects, 2) Activity or actions, 3) Context and setting, 4) Any notable details. Rate your confidence (0-1) in this analysis."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: testImageUrl
                            }
                        }
                    ]
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });
        
        const response = completion.choices[0]?.message?.content || '';
        
        console.log('=== Analysis Result ===');
        console.log(response);
        console.log('\n=== Metadata ===');
        console.log('Model:', completion.model);
        console.log('Tokens used:', completion.usage?.total_tokens || 'N/A');
        console.log('Finish reason:', completion.choices[0]?.finish_reason || 'N/A');
        
        console.log('\n✓ Test completed successfully!');
        
    } catch (err) {
        console.error('ERROR:', err.message);
        
        if (err.message.includes('API key')) {
            console.log('\nTip: Make sure your GROQ_API_KEY is valid');
            console.log('Get your API key at: https://console.groq.com/');
        }
        
        process.exit(1);
    }
}

/**
 * Test with a local image file
 */
async function testWithLocalImage(imagePath) {
    console.log('Testing with local image:', imagePath);
    
    if (!fs.existsSync(imagePath)) {
        console.error('ERROR: Image file not found:', imagePath);
        process.exit(1);
    }
    
    try {
        const Groq = require('groq-sdk');
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
        
        // Read image and convert to base64
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
        
        console.log('Image loaded, size:', (imageBuffer.length / 1024).toFixed(2), 'KB');
        console.log('Analyzing...\n');
        
        const completion = await groq.chat.completions.create({
            model: "llama-3.2-90b-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Analyze this screenshot and describe any significant activity, user interactions, or notable content. Focus on: 1) What applications or windows are visible, 2) What actions the user appears to be taking, 3) Any suspicious or unusual activity, 4) Overall activity level (low/medium/high). Provide a confidence score (0-1) for your analysis."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });
        
        const response = completion.choices[0]?.message?.content || '';
        
        console.log('=== Analysis Result ===');
        console.log(response);
        console.log('\n✓ Analysis completed!');
        
    } catch (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
}

/**
 * List available Groq models
 */
async function listModels() {
    console.log('Fetching available Groq models...\n');
    
    try {
        const Groq = require('groq-sdk');
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
        
        const models = await groq.models.list();
        
        console.log('=== Available Models ===');
        models.data.forEach(model => {
            console.log(`- ${model.id}`);
            if (model.id.includes('vision')) {
                console.log('  ✓ Vision-capable');
            }
        });
        
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // Default: test with sample URL
        await testGroqVision();
    } else if (args[0] === '--models') {
        // List available models
        await listModels();
    } else if (args[0] === '--image' && args[1]) {
        // Test with local image
        await testWithLocalImage(args[1]);
    } else {
        console.log('Usage:');
        console.log('  node test-groq.js              # Test with sample image URL');
        console.log('  node test-groq.js --models     # List available models');
        console.log('  node test-groq.js --image <path>  # Test with local image');
    }
}

// Run if executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    testGroqVision,
    testWithLocalImage,
    listModels
};
