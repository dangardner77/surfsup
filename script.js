document.addEventListener('DOMContentLoaded', () => {
    const version = new Date().getTime();
    const weatherTable = document.getElementById('weather-table-body');			
    weatherTable.innerHTML = ''; 

    // Core logic to process and render the weather rows
    function renderWeatherData(data) {
        data.forEach(entry => {
            const row = weatherTable.insertRow();

            if (entry.daylight === 'night') row.classList.add('night-row');
            if (entry.lowtide === 'low') row.classList.add('tide-low-row');

            const cellTime = row.insertCell(0);
            const cellWindDir = row.insertCell(1);
            const cellWindSpeed = row.insertCell(2);
            const cellWaves = row.insertCell(3);

            const tideIndicator = entry.lowtide === 'low' ? ' 🏝️' : '';

            cellTime.textContent = formatDateString(entry.datetime) + tideIndicator;
            cellWindDir.textContent = convertDegreesToCompass(entry.wind_direction);
            cellWindSpeed.textContent = formatWindString(entry.wind_speed, entry.wind_gusts);
            cellWaves.textContent = formatWaveString(entry.swell_period, entry.wave_height);

			const isOnshore = (entry.wind_direction > 90 && entry.wind_direction < 280);
			if (isOnshore) {
				cellWindDir.classList.add('wind-onshore');
			} else {
				cellWindDir.classList.add('wind-offshore');
			}

            if (entry.daylight !== 'night') {

				// Scale everything to a max of 50 knots for headroom
			    const maxWindScale = 50;
			    const basePercent = Math.min((entry.wind_speed / maxWindScale) * 100, 100);
			    const gustPercent = Math.min((entry.wind_gusts / maxWindScale) * 100, 100);
			    
			    cellWindSpeed.classList.add('bar-chart-cell');
			    
			    // Set up our intensity tiers
			    let baseColor, gustColor;
			    
			    if (entry.wind_speed > 18) {
			        // 🔴 ANGRY NATURE! (Deep Amber / Orange-Yellow)
			        baseColor = '#ffb300'; 
			        gustColor = '#ffe082';
			    } else if (entry.wind_speed > 12) {
			        // 🟡 POWER! (Vivid Crisp Yellow)
			        baseColor = '#f4e869'; 
			        gustColor = '#fff9a6';
			    } else {
			        // ⚪ Light Wind (Muted Pastel Soft Yellow)
			        baseColor = '#fef9db'; 
			        gustColor = '#fffdf0';
			    }
			    
			    // Inject the selected intensity tier into the CSS variables
			    cellWindSpeed.style.setProperty('--bar-color-base', baseColor);
			    cellWindSpeed.style.setProperty('--bar-color-gust', gustColor);
			    cellWindSpeed.style.setProperty('--base-width', `${basePercent}%`);
			    cellWindSpeed.style.setProperty('--gust-width', `${gustPercent}%`);

				
				// Max wave caps for scaling
				const maxWaveHeight = 2.0; // metres
				const maxWavePeriod = 15.0; // seconds

				const waveHeightPercent = Math.min((entry.wave_height / maxWaveHeight) * 100, 100);
				const swellPeriodPercent = Math.min((entry.swell_period / maxWavePeriod) * 100, 100);
				const waveCombinedPercent = Math.min(waveHeightPercent + swellPeriodPercent, 100);

				// For Waves
				cellWaves.classList.add('bar-chart-cell');
				cellWaves.style.setProperty('--bar-color-base', '#aed5f4');
				cellWaves.style.setProperty('--bar-color-gust', '#d6eaf8');
				cellWaves.style.setProperty('--base-width', `${waveHeightPercent}%`);
				cellWaves.style.setProperty('--gust-width', `${waveCombinedPercent}%`);
			}
			

			
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

function formatWindString(speed, gusts) {
    return `${speed} (${gusts})`;
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

	const waveString = height + 'm (' + period + 's)' + waveEmoji;
	
	return waveString;
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


// Identify a session
function isSession(daylight, tide, direction, speed, gusts, period, height) {
    if (daylight === 'night') return false;
    
    const averageWind = (speed + gusts) / 2;
    // My proven Hayling Island formula
    if (tide === 'low' && onshore(direction) && (averageWind > 10)) {
        return true;
    }
    return false;
}

/*
// returns state from: night, wind, wave, boring
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

// returns true if the wind direction is onshore
function onshore(direction) {
	if (direction > 90 && direction < 280) {
		return true;
	} else {
		return false;
	}
}
