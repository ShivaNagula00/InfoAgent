import requests

def get_weather(city: str):
    try:
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}"
        geo = requests.get(url).json()

        if "results" not in geo:
            return f"City '{city}' not found"

        lat = geo["results"][0]["latitude"]
        lon = geo["results"][0]["longitude"]

        weather_url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&current_weather=true"
        )

        weather = requests.get(weather_url).json()
        temp = weather["current_weather"]["temperature"]

        return f"Current temperature in {city} is {temp}°C"
    except Exception as e:
        return f"Error getting weather for {city}: {str(e)}"