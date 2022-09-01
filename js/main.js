let currentResolution = 'high';
let currentSigma = .5;
const rootDirectory = 'resources/'
const sigmaThresholdSuffix = '_sigma_threshold.png';
const highResPrefix = 'High_res_'

function log(msg) {
    console.log(msg);
}

function setDay(day) {
    let forecast = document.getElementById('forecast-day');
    forecast.textContent = day;
    toggleDaySelection();
    updateDay(0, false);
}

function toggleDaySelection() {
    let daySelection = document.getElementById('day-selection');
    daySelection.style.display = daySelection.style.display === 'block' ? 'none' : 'block';
}

function updateModel(type) {
    let modelButton = document.getElementById('button-model-dropdown');
    modelButton.textContent = type;
}

function updateDay(delta, modifyForecast) {
    console.log(delta);
    let dateInitialize = document.getElementById('init');
    let forecastDateLabel = document.getElementById('main-forecast-date');
    let forecast = document.getElementById('forecast-day');
    let currentDateArr = dateInitialize.textContent.split(' ');
    let currentDate = new Date(`${currentDateArr[1]} ${currentDateArr[2]} ${currentDateArr[0]}`);
    let currentDay = parseInt(forecast.textContent);
    if(currentDay + delta >= 1 && currentDay + delta <= 10) {
        let dayOffset = currentDay + delta;
        if(modifyForecast) {
            forecast.textContent = `${dayOffset}`;
        }
        currentDate.setDate(currentDate.getDate() + dayOffset - 1);
        let newDateArr = currentDate.toDateString().split(' ');
        forecastDateLabel.textContent = `${newDateArr[1]} ${newDateArr[2]}, ${newDateArr[3]}`;
    }
}

function updateMean(increment) {
    let threshold = document.getElementById('threshold');
    let meanLabel = document.getElementById('mean-label');
    let currentThreshold = threshold.textContent;
    if(increment === 'up' && currentThreshold < 2) {
        currentSigma = (parseFloat(currentThreshold) + .5);
        threshold.textContent = `${currentSigma.toFixed(1)}`;
        meanLabel.textContent = `Average + ${currentSigma} σ`;
        updateThresholdImage();
    } else if(increment === 'down' && currentThreshold > 0) {
        currentSigma = (parseFloat(currentThreshold) - .5);
        threshold.textContent = `${currentSigma.toFixed(1)}`;
        meanLabel.textContent = `Average + ${currentSigma} σ`;
        updateThresholdImage();
    }
}

function updateDate(increment) {
    let currentDateId = document.getElementById('init');
    let forecastDateLabel = document.getElementById('main-forecast-date');
    let currentDateArr = currentDateId.textContent.split(' ');
    let currentDate = new Date(`${currentDateArr[1]} ${currentDateArr[2]} ${currentDateArr[0]}`);
    if(increment === 'up') {
        currentDate.setDate(currentDate.getDate() + 1);
    } else if(increment === 'down') {
        currentDate.setDate(currentDate.getDate() - 1);
    }
    let newDateArr = currentDate.toDateString().split(' ');
    let newDateLabel = `${newDateArr[1]} ${newDateArr[2]}, ${newDateArr[3]}`;
    currentDateId.textContent = `${newDateArr[3]} ${newDateArr[1]} ${newDateArr[2]}`;
    forecastDateLabel.textContent = newDateLabel;
    updateDay(0);
}

function updateThresholdImage() {
    let thresholdImage = document.getElementById('threshold-image');
    let newURL = 'resource/';
    if(currentResolution === 'high') {
        newURL = rootDirectory + highResPrefix + currentSigma + sigmaThresholdSuffix;
    } else {
        newURL = rootDirectory + currentSigma + sigmaThresholdSuffix;
    }
    thresholdImage.src = newURL;
}

function updateResolution(quality) {
    let buttonHighRes = document.getElementById('button-high-res');
    let buttonLowRes = document.getElementById('button-low-res');
    if(quality === 'high' && currentResolution === 'low') {
        currentResolution = 'high';
        buttonHighRes.style.fontWeight = 'bold';
        buttonLowRes.style.fontWeight = 'normal';
        buttonHighRes.style.backgroundColor = '#0d6efd';
        buttonLowRes.style.backgroundColor = '#212121';
        updateThresholdImage()
    } else if(quality === 'low' && currentResolution === 'high') {
        currentResolution = 'low';
        buttonLowRes.style.fontWeight = 'bold';
        buttonHighRes.style.fontWeight = 'normal';
        buttonLowRes.style.backgroundColor = '#0d6efd';
        buttonHighRes.style.backgroundColor = '#212121';
        updateThresholdImage()
    }

}

// Day Selection
document.getElementById('forecast-day').addEventListener('click', function() {
    toggleDaySelection();
});

// Model Selection
document.getElementById('option-dense').addEventListener('click', function() {
    updateModel('Dense');
});

document.getElementById('option-convolutional').addEventListener('click', function() {
    updateModel('Convolutional');
});

document.getElementById('option-voting').addEventListener('click', function() {
    updateModel('Voting');
});

// Resolution Selection
document.getElementById('button-high-res').addEventListener('click', function() {
    updateResolution('high');
});

document.getElementById('button-low-res').addEventListener('click', function() {
    updateResolution('low');
});

// Increment Buttons
document.getElementById('forecast-up').addEventListener('click', function() {
    updateDay(1, true);
});

document.getElementById('forecast-down').addEventListener('click', function() {
    updateDay(-1, true);
});

document.getElementById('threshold-up').addEventListener('click', function() {
    updateMean('up');
});

document.getElementById('threshold-down').addEventListener('click', function() {
    updateMean('down');
});

document.getElementById('init-up').addEventListener('click', function() {
    updateDate('up');
});

document.getElementById('init-down').addEventListener('click', function() {
    updateDate('down');
});




















