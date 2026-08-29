// Preferred wind range for a session (accessible by helper functions)
const MIN_WIND_AVERAGE = 10; // knots
const MAX_WIND_GUST = 30; // knots

document.addEventListener('DOMContentLoaded', () => {
    const version = new Date().getTime();
    const weatherTable = document.getElementById('weather-table-body');			
    weatherTable.innerHTML = ''; 

	// Upper limits for display of wind/wave data
	const UPPER_WIND_SPEED = 50; // knots
	const UPPER_WAVE_HEIGHT = 3.0; // metres
	const UPPER_WAVE_PERIOD = 20.0; // seconds
	const UPPER_WAVE_POWER = 0.5 * Math.pow(UPPER_WAVE_HEIGHT, 2) * UPPER_WAVE_PERIOD;

    // Core logic to process and render the weather rows
    function renderWeatherData(data) {
        data.forEach(entry => {
            const row = weatherTable.insertRow();

            if (entry.daylight === 'night') row.classList.add('night-row');

            const cellTime = row.insertCell(0);
            const cellWind = row.insertCell(1);
            const cellWave = row.insertCell(2);

            const tideIndicator = entry.lowtide === 'low' ? ' 🏝️' : '';

            cellTime.textContent = formatDateString(entry.datetime) + tideIndicator;
            cellWind.textContent = formatWindString(entry.wind_direction, entry.wind_speed, entry.wind_gusts);
            cellWave.textContent = formatWaveString(entry.swell_period, entry.wave_height);

			const bar1Percent = Math.min((entry.wind_speed / UPPER_WIND_SPEED) * 100, 100);
			const bar2Percent = Math.min((entry.wind_gusts / UPPER_WIND_SPEED) * 100, 100);
			
			cellWind.classList.add('bar-chart-cell');
			
			// Calculate a fluid opacity between 0.15 (barely there) and 1.0 (maximum warning)
			const minOpacity = 0.10;
			const calculatedOpacity = minOpacity + ((entry.wind_gusts / UPPER_WIND_SPEED) * (1 - minOpacity));
			const safeOpacity = Math.min(Math.max(calculatedOpacity, minOpacity), 1.0).toFixed(2);

			// Inject a single color with dynamic alpha transparency
			cellWind.style.setProperty('--bar1-color', `rgba(235, 190, 0, ${safeOpacity})`);
			// Do the same for gusts with a slightly lighter/more transparent version
			cellWind.style.setProperty('--bar2-color', `rgba(255, 242, 140, ${safeOpacity})`);
			
			// Inject the gradient sizes
			cellWind.style.setProperty('--bar1-width', `${bar1Percent}%`);
			cellWind.style.setProperty('--bar2-width', `${bar2Percent}%`);

			const waveHeightPercent = Math.min((entry.wave_height / UPPER_WAVE_HEIGHT) * 100, 100);
			const swellPeriodPercent = Math.min((entry.swell_period / UPPER_WAVE_PERIOD) * 100, 100);
			const waveCombinedPercent = Math.min(waveHeightPercent + swellPeriodPercent, 100);

			//Calculate the approximate wave power (kW/m)
			const waveHeight = entry.wave_height;
			const wavePeriod = entry.wave_period;
			const wavePower = 0.5 * Math.pow(waveHeight, 2) * wavePeriod;

			// For Waves
			cellWave.classList.add('bar-chart-cell');

			// Calculate fluid opacity based on wave height
			const minWaveOpacity = 0.20;
			const calculatedWaveOpacity = minWaveOpacity + ((wavePower / UPPER_WAVE_POWER) * (1 - minWaveOpacity));
			const safeWaveOpacity = Math.min(Math.max(calculatedWaveOpacity, minWaveOpacity), 1.0).toFixed(2);

			// Inject the colors with the dynamic opacity
			cellWave.style.setProperty('--bar1-color', `rgba(30, 144, 255, ${safeWaveOpacity})`);
			cellWave.style.setProperty('--bar2-color', `rgba(145, 195, 235, ${safeWaveOpacity})`);
			
			cellWave.style.setProperty('--bar1-width', `${waveHeightPercent}%`);
			cellWave.style.setProperty('--bar2-width', `${waveCombinedPercent}%`);
			
			// Check for daytime onshore wind to apply green bar to time cell
			if (isGoodWind(entry.daylight, entry.wind_direction, entry.wind_speed, entry.wind_gusts)) {
				row.classList.add('windy-row');
			}

			// Check for full low-tide session to apply green row background
			const session = isSession(entry.daylight, entry.lowtide, entry.wind_direction, entry.wind_speed, entry.wind_gusts, entry.wave_period, entry.wave_height);
			if (session) {
				row.classList.add('session-row');
			}
        });
    }

    // ENVIRONMENT CHECK: Safe loading fallback
    if (window.location.protocol === 'file:') {
        console.log('Local file detected. Loading snapshot data...');
        if (typeof localWeatherData !== 'undefined') {
            renderWeatherData(localWeatherData);
        } else {
            console.error('Could not find localWeatherData array.');
        }
    } else {
        fetch(`processed_weather_data.json?v=${version}`)
            .then(response => response.json())
            .then(data => renderWeatherData(data))
            .catch(error => console.error('Error fetching weather data:', error));
    }
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

/*
//Unused but potentially useful
function convertKnotsToBeaufort(knots) {
    if (knots < 1) return '0'; // Calm
    if (knots <= 3) return '1'; // Light air
    if (knots <= 6) return '2'; // Light breeze
    if (knots <= 10) return '3'; // Gentle breeze
    if (knots <= 16) return '4'; // Moderate breeze
    if (knots <= 21) return '5'; // Fresh breeze
    if (knots <= 27) return '6'; // Strong breeze
    if (knots <= 33) return '7'; // Near gale
    if (knots <= 40) return '8'; // Gale
    if (knots <= 47) return '9'; // Strong gale
    if (knots <= 55) return '10'; // Storm
    if (knots <= 63) return '11'; // Violent storm
    return '12'; // Hurricane
}
*/

function formatWindString(direction, speed, gusts) {
	let windEmoji = '';
	if (speed > 18) {
		windEmoji = ' 💨💨';
	} else if (speed > 12) {
		windEmoji = ' 💨';
	}
	
	const directionString = convertDegreesToCompass(direction);
    return `${directionString} | ${speed} (${gusts}) ${windEmoji}`;
}

function formatWaveString(period, height) {
	let waveEmoji = ''; // Declare variable with let

	if (period > 12 && height > 0.5) {
		// Ideal: Long period, medium+ height groundswell
		waveEmoji = ' 🌊🌊';
	} else if (period > 10 && height > 0.3) {
		// Good: Long period, smaller height groundswell
		waveEmoji = ' 🌊';
	} else if (period > 3.5 && height > 0.7) {
		// Tighter, more selective rule for short period wind swell
		waveEmoji = ' 🌊';
	} else {
		// No significant wave for foiling
		waveEmoji = '';
	}

	return `${height}m | ${period}s ${waveEmoji}`;
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

// returns true if the wind direction is onshore
function isOnshore(direction) {
	if (direction > 90 && direction < 280) {
		return true;
	} else {
		return false;
	}
}

// returns true if the wind speed and direction are good
function isGoodWind(daylight, direction, speed, gusts) {
	if (daylight === 'night') return false;

    const averageWind = (speed + gusts) / 2;
	const isGoodWindSpeed = averageWind >= MIN_WIND_AVERAGE && gusts <= MAX_WIND_GUST;

    return isOnshore(direction) && isGoodWindSpeed;
}

// Identify a low tide session
function isSession(daylight, tide, direction, speed, gusts, period, height) {
    // My proven Hayling Island formula
    if (tide === 'low' && isGoodWind(daylight, direction, speed, gusts)) {
        return true;
    }
    return false;
}

/*
// Original session logic - returns state from: night, wind, wave, boring
function getRowState(daylight,tide,direction,speed,gusts,period,height) {
	// Calculate the average wind speed
	const averageWind = (speed + gusts) / 2

	// Determine the table row presentation class based on conditions
	if (daylight == 'night') {
		return 'night';
	} else if (tide == 'low' && onshore(direction) && averageWind > 10)  {
		return 'wind';
	} else if (tide == 'low' && onshore(direction) && period > 12)  {
		return 'wave';
	} else {
		return 'boring';
	}
}
*/


