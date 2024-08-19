# surfsup
### a hobbiest project to identify good times to go wing foiling based on forecast data (at west beach on hayling island uk)
possibly a look-ahead table for the next few days
possibly to include push notifications to cover the next 48 hours ("Surf's Up!")

basic rules:
- within daylight hours
- within two hours of low tide (sandbar exposed)
- wind gusting over 14 knots
- wind direction not from the north (offshore)

additional rules could include:
- surf forecast for sea swell info (wave height and period)
- midday sessions being downgraded as likely to be a choppy mess
- favouring conditions where the wind speed and gust speed are within a close range of each other (5 knots)

## Data Sources
https://open-meteo.com/

https://api.open-meteo.com/v1/forecast?latitude=50.78&longitude=-0.99&current=is_day,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=sunrise,sunset,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&wind_speed_unit=kn&timezone=Europe%2FLondon
