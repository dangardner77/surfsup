document.addEventListener('DOMContentLoaded', () => {
    fetch('processed_weather_data.json')
        .then(response => response.json())
        .then(data => {

            const weatherTable = document.getElementById('weather-table-body');			
			
			data.forEach(entry => {
						
				const row = weatherTable.insertRow();

				const cell1 = row.insertCell(0);
				const cell2 = row.insertCell(1);
				const cell3 = row.insertCell(2);
				const cell4 = row.insertCell(3);
				const cell5 = row.insertCell(4);

				cell1.textContent = formatDateString(entry.datetime) + ' ' + getDaylightEmoji(entry.daylight);
				cell2.textContent = getLowTide(entry.lowtide);
				cell3.textContent = convertDegreesToCompass(entry.wind_direction) + ' (' + entry.wind_direction + '°)';
				cell4.textContent = convertKnotsToBeaufort(entry.wind_speed);
				cell5.textContent = entry.wind_speed + ' gusting ' + entry.wind_gusts;
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



function getDaylightEmoji(daynight) {
	if (daynight == 'day') {
		daynightEmoji = '🌞';
	} else {
		daynightEmoji = '🌑';
	}
	
	return daynightEmoji;
}

function getLowTide(lowtide) {
	if (lowtide == 'low') {
		emoji = '🌅';
	} else {
		emoji = '';
	}
	return emoji;
}
