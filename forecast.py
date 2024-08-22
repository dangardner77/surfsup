import requests
import json

# Fetch the weather data from the API
url = "https://api.open-meteo.com/v1/forecast?latitude=50.78&longitude=-0.99&current=is_day,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=sunrise,sunset,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&wind_speed_unit=kn&timezone=Europe%2FLondon"
response = requests.get(url)
data = response.json()

# Extract relevant information
current_weather = data['current']
hourly_forecast = data['hourly']
daily_forecast = data['daily']

# Generate HTML content
html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Forecast</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 20px;
        }}
        h1 {{
            color: #333;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
        }}
        th, td {{
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }}
        th {{
            background-color: #f2f2f2;
        }}
    </style>
</head>
<body>
    <h1>Weather Forecast</h1>
    <h2>Current Weather</h2>
    <p>Is Day: {current_weather['is_day']}</p>
    <p>Wind Speed: {current_weather['wind_speed_10m']} kn</p>
    <p>Wind Direction: {current_weather['wind_direction_10m']}°</p>
    <p>Wind Gusts: {current_weather['wind_gusts_10m']} kn</p>

    <h2>Hourly Forecast</h2>
    <table>
        <tr>
            <th>Time</th>
            <th>Wind Speed (kn)</th>
            <th>Wind Direction (°)</th>
            <th>Wind Gusts (kn)</th>
        </tr>

    </table>


</body>
</html>
"""

# Save the HTML content to a file
with open("weather_forecast.html", "w") as file:
    file.write(html_content)

print("HTML file 'weather_forecast.html' has been generated.")
