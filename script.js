// DOM Elements
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const newPromptBtn = document.getElementById('newPromptBtn');
const promptForm = document.getElementById('promptForm');
const resultContainer = document.getElementById('resultContainer');
const generatedPrompt = document.getElementById('generatedPrompt');
const loadingSpinner = document.getElementById('loadingSpinner');

// Event Listeners
generateBtn.addEventListener('click', handleGeneratePrompt);
copyBtn.addEventListener('click', copyToClipboard);
newPromptBtn.addEventListener('click', resetForm);

// Handle form submission
async function handleGeneratePrompt() {
    // Get form values
    const goal = document.getElementById('goal').value.trim();
    const format = document.getElementById('format').value;
    const tone = document.getElementById('tone').value;
    const style = document.getElementById('style').value;
    const additional = document.getElementById('additional').value.trim();
    
    // Validate input
    if (!goal) {
        alert('Please describe what you want ChatGPT to do.');
        return;
    }
    
    // Show loading state
    promptForm.style.display = 'none';
    resultContainer.style.display = 'block';
    loadingSpinner.style.display = 'block';
    generatedPrompt.innerHTML = '';
    
    try {
        // Send request to backend API
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ goal, format, tone, style, additional })
        });
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Display the result
        generatedPrompt.textContent = data.prompt;
        
    } catch (error) {
        console.error('Error generating prompt:', error);
        generatedPrompt.innerHTML = `<p class="error">Sorry, there was an error generating your prompt. Please try again later.<br>Error: ${error.message}</p>`;
    } finally {
        // Hide loading spinner
        loadingSpinner.style.display = 'none';
    }
}

// Copy prompt to clipboard
function copyToClipboard() {
    const text = generatedPrompt.textContent;
    
    if (!text) return;
    
    // Use the Clipboard API if available
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Visual feedback for successful copy
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy text to clipboard');
            });
    } else {
        // Fallback for browsers that don't support Clipboard API
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';  // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            } else {
                alert('Failed to copy text to clipboard');
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text to clipboard');
        }
        
        document.body.removeChild(textarea);
    }
}

// Reset the form to create a new prompt
function resetForm() {
    // Show the form and hide results
    promptForm.style.display = 'block';
    resultContainer.style.display = 'none';
    
    // Optional: clear form fields
    // document.getElementById('goal').value = '';
    // document.getElementById('additional').value = '';
}

// Simulate the API for standalone demo (will be replaced by actual backend)
if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
    console.log('Running in development mode with API simulation');
    
    // Override fetch to provide a simulated response
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (url === '/api/generate') {
            return new Promise((resolve) => {
                // Simulate server delay
                setTimeout(() => {
                    const body = JSON.parse(options.body);
                    
                    // Build a simulated response
                    const simulatedPrompt = generateSimulatedPrompt(body);
                    
                    resolve({
                        ok: true,
                        json: () => Promise.resolve({ prompt: simulatedPrompt })
                    });
                }, 1500); // Simulated delay
            });
        }
        return originalFetch(url, options);
    };
}

// Generate a simulated prompt for local development
function generateSimulatedPrompt(formData) {
    const { goal, format, tone, style, additional } = formData;
    
    let formatDesc;
    switch(format) {
        case 'paragraph': formatDesc = 'in paragraph form'; break;
        case 'bullet-list': formatDesc = 'as a bullet-point list'; break;
        case 'numbered-list': formatDesc = 'as a numbered list'; break;
        case 'table': formatDesc = 'in a well-organized table format'; break;
        case 'code': formatDesc = 'as working code with comments'; break;
        case 'tweet': formatDesc = 'in a concise tweet-sized format (280 characters max)'; break;
        case 'essay': formatDesc = 'as a well-structured essay with introduction, body, and conclusion'; break;
        case 'conversation': formatDesc = 'as a dialogue or conversation between characters'; break;
        default: formatDesc = '';
    }
    
    let toneDesc = tone !== 'neutral' ? `using a ${tone} tone` : '';
    let styleDesc = style !== 'balanced' ? `with a ${style} writing style` : '';
    
    let additionalText = additional ? `\n\nAdditional requirements:\n${additional}` : '';
    
    return `I want you to ${goal} ${formatDesc ? formatDesc : ''} ${toneDesc ? toneDesc : ''} ${styleDesc ? styleDesc : ''}.${additionalText}\n\nPlease make your response clear, well-organized, and directly addressing my request.`;
}