# AI Image Generator

This project is a web application that generates images based on text prompts using AI. It features a user-friendly interface where users can input prompts, refine them using AI, and generate multiple images.

## Features

- Text-to-image generation
- Voice input for prompts
- AI-powered prompt refinement
- Multiple image generation
- Image download functionality

## Requirements

- Python 3.7+
- FastAPI
- Uvicorn
- Jinja2
- OpenAI library
- HTTPX

## Setup

1. Install the required packages:
   ```pip install -r requirements.txt```

2. Set up environment variables:
   - `GROQ_API_KEY`: Your Groq API key
   - `TOGETHER_API_KEY`: Your Together API key

3. Run the application:
   ```python main.py```

4. Open a web browser and navigate to `http://localhost:8000`

## Usage

1. Enter a text prompt in the textarea or use the microphone button for voice input.
2. Select the number of images you want to generate (1-4).
3. Toggle the "Refine" switch to use AI for prompt refinement.
4. Press Enter or submit the form to generate images.
5. Download generated images using the download button on each image.

## Note

This application requires active internet connection and valid API keys to function properly.

## Deployment on Render

This project is set up for easy deployment on Render. Follow these steps:

1. Fork this repository to your GitHub account.
2. Create a new Web Service on Render.
3. Connect your GitHub account and select the forked repository.
4. Render will automatically detect the configuration from `render.yaml`.
5. Add your `GROQ_API_KEY` and `TOGETHER_API_KEY` as environment variables in the Render dashboard.
6. Deploy the service.

Your AI Image Generator will be live at the URL provided by Render.
