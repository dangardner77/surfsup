#weather json formatter

import requests
import json
import pandas as pd
from datetime import datetime, timedelta


# Fetch weather data from open-meteo.com
url = "https://api.open-meteo.com/v1/forecast?latitude=50.78&longitude=-0.99&current=is_day,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=sunrise,sunset,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&wind_speed_unit=kn&timezone=Europe%2FLondon"
response = requests.get(url)
data = response.json()
#print(data['hourly']['time'][0]) #DEBUG

# Create list object for JSON data output
output_data = []


# Create DataFrame
df = pd.DataFrame(data, columns=['date', 'tide_1', 'tide_2', 'tide_3', 'tide_4'])
# Load the CSV file into a DataFrame
df = pd.read_csv('tide_data.csv')

# Set the 'date' column as the index
df.set_index('date', inplace=True)
#print(df) #DEBUG

# Function to get tide times for a specific date
def get_low_tides(date):
    low_tide_list = []
    if date in df.index:
        for tide in df.loc[date, ['tide_1', 'tide_2', 'tide_3', 'tide_4']]:
            if 'Low' in tide:
                low_tide_list.append(tide[4:])
    #print(low_tide_list) 
    return low_tide_list
 

# Function to get sunrise time for a specific date
def get_sunrise(date):
    daily_data = data['daily']
    if date in daily_data['time']:
        index = daily_data['time'].index(date)
        date_string = daily_data['sunrise'][index]
        date_object = datetime.strptime(date_string, "%Y-%m-%dT%H:%M")
        return date_object
    else:
        return "Date not found in data"

# Function to get sunset time for a specific date
def get_sunset(date):
    daily_data = data['daily']
    if date in daily_data['time']:
        index = daily_data['time'].index(date)
        date_string = daily_data['sunset'][index]
        date_object = datetime.strptime(date_string, "%Y-%m-%dT%H:%M")
        return date_object
    else:
        return "Date not found in data"



# Get the hourly array size
hours = len(data['hourly']['time'])
#print(hours) #DEBUG
            
            
# Iterate through each hour in the hourly forecast
for hour_index in range(hours):

    timestamp_str = data['hourly']['time'][hour_index]
    timestamp_date_obj = datetime.strptime(timestamp_str, "%Y-%m-%dT%H:%M")
    
    #get the date
    date = timestamp_str[:10]
    time = timestamp_str[11:]

    
    #lookup the sunrise and sunset time from the json data
    sunrise = get_sunrise(date)
    sunset = get_sunset(date)
    daylight = 'night'
    if timestamp_date_obj > sunrise and timestamp_date_obj < sunset:
       is_day = True
       daylight = 'day'
    else:
        is_day = False
    
    tide = ''

    
    #lookup the tide times for this date
    low_tides = get_low_tides(date)
    for low_tide in low_tides:
        #print('low tide at',low_tide) #DEBUG
        #create a datetime object for this low tide
        low_tide_str = date + 'T' + low_tide
        #print(low_tide_str) #DEBUG
        low_tide_obj = datetime.strptime(low_tide_str, "%Y-%m-%dT%H:%M")
        

        # Check if the time difference is within two hours
        within_low_tide = False
        time_difference = abs(timestamp_date_obj - low_tide_obj)
        if time_difference <= timedelta(hours=2):
            within_low_tide = True
            tide = "low"


    #add data to new json object
    output_row = {}
    output_row['datetime'] = timestamp_str
    output_row['daylight'] = daylight
    output_row['lowtide'] = tide
    output_row['wind_direction'] = data['hourly']['wind_direction_10m'][hour_index]
    output_row['wind_speed'] = data['hourly']['wind_speed_10m'][hour_index]
    output_row['wind_gusts'] = data['hourly']['wind_gusts_10m'][hour_index]
        
        
    output_data.append(output_row)
#print(output_data) #DEBUG

with open('processed_weather_data.json', 'w') as json_file:
    json.dump(output_data, json_file, indent=4)

#print("Data has been written to data.json") #DEBUG
    
