// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to important DOM elements
    const micButton = document.getElementById('micButton');
    const promptTextarea = document.getElementById('prompt');
    const generateForm = document.getElementById('generateForm');
    const imageContainer = document.getElementById('imageContainer');
    const spinner = document.getElementById('spinner');
    const refineToggle = document.getElementById('refineToggle');
    const imageCountSelect = document.getElementById('imageCount');

    // Variable to store the speech recognition object
    let recognition;

    // Check if the browser supports speech recognition
    if ('webkitSpeechRecognition' in window) {
        // Create a new speech recognition instance
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;  // Stop listening after a single result
        recognition.interimResults = false;  // Only return final results

        // Handle the result of speech recognition
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            promptTextarea.value = transcript;  // Set the textarea value to the recognized speech
            processPrompt(transcript);  // Process the prompt immediately
        };

        // Handle the end of speech recognition
        recognition.onend = () => {
            // Reset the microphone button appearance
            micButton.classList.remove('listening');
            micButton.querySelector('i').classList.remove('fa-stop');
            micButton.querySelector('i').classList.add('fa-microphone');
        };

        // Handle any errors in speech recognition
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        // Add click event listener to the microphone button
        micButton.addEventListener('click', () => {
            if (micButton.classList.contains('listening')) {
                recognition.stop();  // Stop listening if already listening
            } else {
                recognition.start();  // Start listening
                // Update button appearance to indicate listening state
                micButton.classList.add('listening');
                micButton.querySelector('i').classList.remove('fa-microphone');
                micButton.querySelector('i').classList.add('fa-stop');
            }
        });
    } else {
        // Hide the microphone button if speech recognition is not supported
        micButton.style.display = 'none';
        console.warn('Speech recognition not supported in this browser');
    }

    // Variable to store the typing timer
    let typingTimer;
    const doneTypingInterval = 500; // 0.5 seconds

    // Function to process the prompt and generate images
    async function processPrompt(prompt) {
        try {
            // Show loading spinner and hide image container
            spinner.classList.remove('hidden');
            imageContainer.classList.add('hidden');
            imageContainer.innerHTML = '';  // Clear previous images

            let finalPrompt = prompt;
            const imageCount = parseInt(imageCountSelect.value);

            // Refine the prompt if the refine toggle is checked
            if (refineToggle.checked) {
                // Send a request to refine the prompt
                const refineResponse = await fetch('/refine_prompt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        'prompt': prompt,
                        'n': 1
                    })
                });

                if (!refineResponse.ok) {
                    throw new Error('Failed to refine prompt');
                }

                const refineData = await refineResponse.json();
                finalPrompt = refineData.refined_prompts[0];

                // Update the textarea with the refined prompt
                promptTextarea.value = finalPrompt;
            }

            // Send a request to generate images based on the final prompt
            const generateResponse = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'prompt': finalPrompt,
                    'n': imageCount
                })
            });

            if (!generateResponse.ok) {
                throw new Error('Failed to generate image');
            }

            const generateData = await generateResponse.json();
            const image_urls = generateData.image_urls;

            // Update the image container layout based on the number of images
            if (image_urls.length === 1) {
                imageContainer.className = 'mt-8 flex justify-center';
            } else {
                imageContainer.className = 'mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4';
            }

            // Create and append image elements for each generated image
            image_urls.forEach((url, index) => {
                const imageWrapper = document.createElement('div');
                imageWrapper.className = 'relative';

                const imgElement = document.createElement('img');
                imgElement.src = url;
                imgElement.alt = 'Generated Image';
                imgElement.className = 'max-w-full h-auto rounded-lg shadow-lg';

                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'absolute top-2 right-2 flex gap-2';

                const downloadButton = document.createElement('button');
                downloadButton.innerHTML = '<i class="fas fa-download"></i>';
                downloadButton.className = 'btn btn-circle btn-sm btn-primary';
                downloadButton.addEventListener('click', () => downloadImage(url, `generated_image_${index + 1}.png`));

                buttonContainer.appendChild(downloadButton);

                imageWrapper.appendChild(imgElement);
                imageWrapper.appendChild(buttonContainer);
                imageContainer.appendChild(imageWrapper);
            });

            // Hide spinner and show image container
            spinner.classList.add('hidden');
            imageContainer.classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            spinner.classList.add('hidden');
            alert('An error occurred. Please try again.');
        }
    }

    // Function to handle typing events
    function handleTyping() {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            const prompt = promptTextarea.value.trim();
            if (prompt) {
                processPrompt(prompt);
            }
        }, doneTypingInterval);
    }

    // Add event listeners for typing events
    promptTextarea.addEventListener('input', handleTyping);
    promptTextarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            clearTimeout(typingTimer);
            processPrompt(promptTextarea.value);
        }
    });

    // Function to download a generated image
    async function downloadImage(url, filename) {
        try {
            // Fetch the image through a proxy to avoid CORS issues
            const response = await fetch(`/proxy_image?url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch image');
            }
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            // Create a temporary link and trigger the download
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.click();

            // Clean up the blob URL
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Failed to download image. Please try again.');
        }
    }

    // Log a message to confirm the script has loaded
    console.log("Image Generator app loaded");
});