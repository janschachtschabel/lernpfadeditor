// Default template structure
const defaultTemplate = {
    metadata: {
        title: "Example Template",
        description: "A basic template example",
        version: "1.0"
    },
    problem: {
        description: "Basic problem description",
        goals: ["Goal 1", "Goal 2"]
    },
    solution: {
        description: "Basic solution description",
        steps: ["Step 1", "Step 2"]
    }
};

// Initialize editor with default template
document.addEventListener('DOMContentLoaded', () => {
    const templateEditor = document.getElementById('templateEditor');
    templateEditor.value = JSON.stringify(defaultTemplate, null, 2);
});

async function processTemplate() {
    const statusElement = document.getElementById('status');
    const outputElement = document.getElementById('output');
    const processButton = document.getElementById('processButton');
    const apiKey = document.getElementById('apiKey').value;
    const userInput = document.getElementById('userInput').value;
    const templateContent = document.getElementById('templateEditor').value;

    if (!apiKey) {
        statusElement.textContent = 'Error: Please enter your OpenAI API key';
        statusElement.className = 'status-box error';
        return;
    }

    if (!userInput) {
        statusElement.textContent = 'Error: Please enter processing instructions';
        statusElement.className = 'status-box error';
        return;
    }

    try {
        // Parse template to validate JSON
        const template = JSON.parse(templateContent);

        // Disable button and show processing status
        processButton.disabled = true;
        statusElement.textContent = 'Processing template...';
        statusElement.className = 'status-box';

        // Make API request
        const response = await fetch('/api/process-template', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                template,
                userInput,
                apiKey
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to process template');
        }

        // Display results
        statusElement.textContent = 'Template processed successfully!';
        statusElement.className = 'status-box success';
        outputElement.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        statusElement.textContent = `Error: ${error.message}`;
        statusElement.className = 'status-box error';
        outputElement.textContent = '';
    } finally {
        processButton.disabled = false;
    }
}