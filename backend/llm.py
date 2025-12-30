# llm.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def ask_llm(message: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "Groq API key not found in environment variables."
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Try different models
    models = ["llama-3.1-8b-instant", "llama3-8b-8192", "mixtral-8x7b-32768"]
    
    for model in models:
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "system", 
                    "content": "You are a helpful assistant. Format your responses exactly like ChatGPT with clean structure:\n\n- Use relevant emojis at the start of each main section (🌍, 🧠, 🔒, 💡, ⚡, 📚, etc.)\n- Create clear section headings with emojis\n- Use # for main headings and ## for subheadings\n- Use bullet points for lists\n- Add proper spacing between sections\n- Use ** for bold text and * for italic\n- Keep responses well-organized and visually appealing\n- Break information into digestible chunks\n- Use emojis to make content more engaging and easier to scan\n- Always structure content with titles, headings, and subheadings when applicable"
                },
                {"role": "user", "content": message}
            ],
            "max_tokens": 1000,
            "temperature": 0.7
        }
        
        try:
            response = requests.post("https://api.groq.com/openai/v1/chat/completions", 
                                   headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
        except:
            continue
    
    return "All LLM models failed. Try asking about weather instead!"