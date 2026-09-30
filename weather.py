#weather json formatter

import requests
import json
import pandas as pd
from datetime import datetime, timedelta

def fetch_data(api_url):
    response = requests.get(api_url)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to fetch data: {response.status_code}")

# Fetch weather data from open-meteo.com
wind_url = "https://api.open-meteo.com/v1/forecast?latitude=50.78&longitude=-0.99&current=is_day,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=sunrise,sunset,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&wind_speed_unit=kn&timezone=Europe%2FLondon"
wind_data = fetch_data(wind_url)
wind_hours = len(wind_data['hourly']['time'])

# Fetch wave data from open-meteo.com
wave_url = "https://marine-api.open-meteo.com/v1/marine?latitude=50.78&longitude=-0.99&hourly=wave_height,wave_period,swell_wave_height,swell_wave_period"
wave_data = fetch_data(wave_url)
wave_hours = len(wave_data['hourly']['time'])

if wind_hours == wave_hours:
    hours = wind_hours
else:
    raise ValueError("Mismatch in wind and wave data hours")

# Create list object for JSON data output
output_data = []

# Create DataFrame
#df = pd.DataFrame(wind_data, columns=['date', 'tide_1', 'tide_2', 'tide_3', 'tide_4'])
# Load the CSV file into a DataFrame
df = pd.read_csv('tide_data.csv')

# Set the 'date' column as the index
df.set_index('date', inplace=True)
#print(df) #DEBUG

def get_tide_events(date):
    """
    Extracts all tide events (both High and Low) for a given date,
    returning a sorted list of dictionaries with type and datetime object.
    """
    tide_events = []
    if date in df.index:
        for tide in df.loc[date, ['tide_1', 'tide_2', 'tide_3', 'tide_4']]:
            if isinstance(tide, str) and ( 'Low' in tide or 'High' in tide ):
                # Example tide string format: "High 04:15" or "Low 10:30"
                parts = tide.split()
                tide_type = parts[0]  # 'High' or 'Low'
                time_str = parts[1]   # 'HH:MM'
                
                # Combine date string and time string into a full datetime
                dt = datetime.strptime(f"{date} {time_str}", "%Y-%m-%d %H:%M")
                
                tide_events.append({
                    'type': tide_type,
                    'time': time_str,
                    'datetime': dt
                })
                
    # Sort chronologically in case columns are out of order
    tide_events.sort(key=lambda x: x['datetime'])
    return tide_events

def get_tide_state(current_dt, tide_events):
    """
    Determines tide phase for a given hourly datetime:
    - 'low': Peak Low tide ± 2 hours (Sandbar window)
    - 'high': Peak High tide ± 1 hour (Slack water)
    - 'ebb': Falling tide between High +1h and Low -2h
    - 'flood': Rising tide between Low +2h and High -1h
    """
    if not tide_events:
        return "unknown"

    # Find the nearest single tide event
    closest_event = min(tide_events, key=lambda e: abs(current_dt - e['datetime']))
    time_diff = abs(current_dt - closest_event['datetime'])

    # 1. Low Tide Window (±2 hours)
    if closest_event['type'] == 'Low' and time_diff <= timedelta(hours=2):
        return "low"

    # 2. High Tide Window (±1 hour)
    if closest_event['type'] == 'High' and time_diff <= timedelta(hours=1):
        return "high"

    # 3. Determine if water level is falling (ebb) or rising (flood)
    prev_event = None
    next_event = None
    
    for e in tide_events:
        if e['datetime'] <= current_dt:
            prev_event = e
        elif e['datetime'] > current_dt and next_event is None:
            next_event = e
            break

    if prev_event and prev_event['type'] == 'High':
        return "ebb"
    elif prev_event and prev_event['type'] == 'Low':
        return "flood"

    return "unknown"

# Function to get sunrise time for a specific date from the wind API data
def get_sunrise(date):
    daily_data = wind_data['daily']
    if date in daily_data['time']:
        index = daily_data['time'].index(date)
        date_string = daily_data['sunrise'][index]
        return datetime.strptime(date_string, "%Y-%m-%dT%H:%M")
    return None

# Function to get sunset time for a specific date from the wind API data
def get_sunset(date):
    daily_data = wind_data['daily']
    if date in daily_data['time']:
        index = daily_data['time'].index(date)
        date_string = daily_data['sunset'][index]
        return datetime.strptime(date_string, "%Y-%m-%dT%H:%M")
    return None

# Build a master list of all tide events across the dataset
all_tide_events = []
for date in df.index:
    all_tide_events.extend(get_tide_events(date))

# Ensure the master list is strictly ordered by datetime
all_tide_events.sort(key=lambda x: x['datetime'])


# Iterate through each hour in the hourly forecast
for hour_index in range(hours):

    timestamp_str = wind_data['hourly']['time'][hour_index]
    timestamp_date_obj = datetime.strptime(timestamp_str, "%Y-%m-%dT%H:%M")
    date = timestamp_str[:10]

    # Daylight determination
    sunrise = get_sunrise(date)
    sunset = get_sunset(date)
    if sunrise and sunset:
        daylight = 'day' if (sunrise <= timestamp_date_obj <= sunset) else 'night'
    else:
        daylight = 'night'

    # Single-line tide phase lookup ('low', 'high', 'ebb', or 'flood')
    tide_state = get_tide_state(timestamp_date_obj, all_tide_events)

    # Build JSON output row
    output_row = {
        'datetime': timestamp_str,
        'daylight': daylight,
        'tide_state': tide_state,  # Replaces 'lowtide' string
        'wind_direction': wind_data['hourly']['wind_direction_10m'][hour_index],
        'wind_speed': wind_data['hourly']['wind_speed_10m'][hour_index],
        'wind_gusts': wind_data['hourly']['wind_gusts_10m'][hour_index],
        'wave_height': wave_data['hourly']['wave_height'][hour_index],
        'wave_period': wave_data['hourly']['wave_period'][hour_index],
        'swell_height': wave_data['hourly']['swell_wave_height'][hour_index],
        'swell_period': wave_data['hourly']['swell_wave_period'][hour_index]
    }
        
    output_data.append(output_row)

with open('processed_weather_data.json', 'w') as json_file:
    json.dump(output_data, json_file, indent=4)

#print("Data has been written to data.json") #DEBUG
    
