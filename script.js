document.addEventListener('DOMContentLoaded', () => {
    // Generate a unique version string based on the current date
    const version = new Date().getTime();
	
    fetch('processed_weather_data.json?v=${version}')
        .then(response => response.json())
        .then(data => {

            const weatherTable = document.getElementById('weather-table-body');			
			
			data.forEach(entry => {
				
				// boring, session, night
				rowState = getRowState(entry.daylight,entry.lowtide,entry.wind_direction,entry.wind_speed,entry.wind_gusts);
						
				const row = weatherTable.insertRow();

				sessionEmoji = '';
				if (rowState === 'session') {
					row.classList.add('session-row');
					sessionEmoji = ' 🤟';
				} else if (rowState === 'night') {
					row.classList.add('night-row');
				}

				const cell1 = row.insertCell(0);
				const cell2 = row.insertCell(1);
				const cell3 = row.insertCell(2);
				const cell4 = row.insertCell(3);

				cell1.textContent = formatDateString(entry.datetime) + getTideEmoji(entry.lowtide) +  sessionEmoji;
				cell2.textContent = convertDegreesToCompass(entry.wind_direction);
				cell3.textContent = convertKnotsToBeaufort(entry.wind_speed);
				cell4.textContent = entry.wind_speed + ' [' + entry.wind_gusts + ']';

			});
			
        })
        .catch(error => console.error('Error fetching weather data:', error));
});



function convertDegreesToCompass(degrees) {
    const directions = [
        { dir: 'N', emoji: '⬇️' },
        { dir: 'NNE', emoji: '↙️' },
        { dir: 'NE', emoji: '↙️' },
        { dir: 'ENE', emoji: '⬅️' },
        { dir: 'E', emoji: '⬅️' },
        { dir: 'ESE', emoji: '↖️' },
        { dir: 'SE', emoji: '↖️' },
        { dir: 'SSE', emoji: '⬆️' },
        { dir: 'S', emoji: '⬆️' },
        { dir: 'SSW', emoji: '↗️' },
        { dir: 'SW', emoji: '↗️' },
        { dir: 'WSW', emoji: '➡️' },
        { dir: 'W', emoji: '➡️' },
        { dir: 'WNW', emoji: '↘️' },
        { dir: 'NW', emoji: '↘️' },
        { dir: 'NNW', emoji: '⬇️' }
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return `${directions[index].emoji} ${directions[index].dir}`;
}

function convertKnotsToBeaufort(knots) {
    if (knots < 1) return '0'; // Calm
    if (knots <= 3) return '1'; // Light air
    if (knots <= 6) return '2'; // Light breeze
    if (knots <= 10) return '3'; // Gentle breeze
    if (knots <= 16) return '4 💨'; // Moderate breeze
    if (knots <= 21) return '5 💨'; // Fresh breeze
    if (knots <= 27) return '6 💨💨'; // Strong breeze
    if (knots <= 33) return '7 💨💨'; // Near gale
    if (knots <= 40) return '8 💨💨💨'; // Gale
    if (knots <= 47) return '9 💨💨💨'; // Strong gale
    if (knots <= 55) return '10'; // Storm
    if (knots <= 63) return '11'; // Violent storm
    return '12'; // Hurricane
}

function calculateAverageWind(speed,gusts) {
	averageWind =  Math.round((speed + gusts) /2);
    return averageWind;
}

function formatDateString(dateString) {
    const date = new Date(dateString);
    const options = {
		weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleString('en-GB', options);
}

function getDaylightEmoji(daylight) {
	if (daylight == 'day') {
		daylightEmoji = ' 🌞';
	} else {
		daylightEmoji = ' 🌑';
	}
	
	return daylightEmoji;
}

// returns state from: boring, session, night
function getRowState(daylight,tide,direction,speed,gusts) {
	average_wind = (speed + gusts) / 2
	if (daylight == 'night') {
		return 'night';
	} else if (tide == 'low' && onshore(direction) && average_wind > 10)  {
		return 'session';
	} else {
		return 'boring';
	}
}

// returns true if the wind direction is onshore
function onshore(direction) {
	if (direction > 90 && direction < 280) {
		return true;
	} else {
		return false;
	}
}

function getTideEmoji(tide) {
	if (tide == 'low') {
		emoji = ' 🌅';
	} else {
		emoji = '';
	}
	return emoji;
}
