# surfsup
### a hobbiest project to identify good times to go wing foiling based on forecast data (at west beach on hayling island uk)
possibly a look-ahead table for the next few days
possibly to include push notifications to cover the next 48 hours ("Surf's Up!")

basic rules:
- within daylight hours
- within two hours of low tide (sandbar exposed)
- wind gusting over 14 knots
- wind direction not from the north (offshore, in range 90 to 270 degrees, could use a lookup to convert to NESW or just learn to read degrees)

additional rules could include:
- surf forecast for sea swell info (wave height and period)
- midday sessions being downgraded as likely to be a choppy mess
- favouring conditions where the wind speed and gust speed are within a close range of each other (5 knots)

## Data Sources

### Weather
https://open-meteo.com/

https://api.open-meteo.com/v1/forecast?latitude=50.78&longitude=-0.99&current=is_day,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=sunrise,sunset,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&wind_speed_unit=kn&timezone=Europe%2FLondon

### Tide Times and Heights
https://easytide.admiralty.co.uk/?PortID=0066

https://environment.data.gov.uk/flood-monitoring/doc/tidegauge

https://environment.data.gov.uk/flood-monitoring/tidegauge/index.html#filter=7&station=E71839

https://admiraltyapi.developer.azure-api.net/api-details#api=uk-tidal-api&operation=Stations_GetStation


