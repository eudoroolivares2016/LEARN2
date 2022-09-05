const rootDirectory = 'resources/'
const sigmaThresholdSuffix = '_sigma_threshold';
const sigmaDaySuffix = '_sigma_Day';
const highResPrefix = 'High_res_'
const lowResPrefix = 'Low_res_'
const extension = '.png'

let currentResolution = 'high';
let currentSigma = .5;
let initializationDate = '20191227_';
let forecastDay = 1;

// On-Load Functionality
window.onload = function() {
    initializePreview();
    initializeTheme();
    initializeDates();
}

function log(msg) {
    console.log(msg);
}

function initializePreview() {
    let themeCheckbox = document.getElementById('preview-switch-id');
    let isChecked = localStorage.getItem("preview");
    themeCheckbox.checked = isChecked === 'true';
    updatePreview(isChecked === 'true');
}

function initializeTheme() {
    let themeCheckbox = document.getElementById('theme-switch-id');
    let isChecked = localStorage.getItem("theme");
    themeCheckbox.checked = isChecked === 'true';
    updateTheme(isChecked === 'true');
}

function initializeDates() {
    let forecastDateElement = document.getElementById('main-forecast-date');
    let initializeDateElement = document.getElementById('init');
    let today = new Date().toString().split(' ');
    let forecastDate = today[1] + ' ' + today[2] + ', ' + today[3];
    let initDate = today[3] + ' ' + today[1] + ' ' + today[2];

    forecastDateElement.textContent = forecastDate;
    initializeDateElement.textContent = initDate;
}

function updatePreview(isChecked) {
    //console.log(isChecked);
}

function updateTheme(isChecked) {
    let controlPanel = document.getElementById('control-panel-id');
    let controlPanelSection = document.getElementById('control-panel-section-id');
    let mainHeader = document.getElementById('main-header-id');
    let mapSection = document.getElementById('map-section-id');
    let pageBody = document.getElementById('page-body-id');

    if(isChecked) {
        // Set Dark Theme
        controlPanel.style.backgroundColor = '#212121';
        controlPanelSection.style.backgroundColor = '#292929';
        mainHeader.style.backgroundColor = '#1c2678';
        mapSection.style.backgroundColor = '#212121';
        pageBody.style.backgroundColor = '#40444b';
        pageBody.style.color = 'white';

    } else {
        // Set Light Theme
        controlPanel.style.backgroundColor = '#ff0000';
        controlPanelSection.style.backgroundColor = '#0dff00';
        mainHeader.style.backgroundColor = '#00ffd5';
        mapSection.style.backgroundColor = '#0019ff';
        mapSection.style.backgroundColor = '#0019ff';
        pageBody.style.backgroundColor = '#c800ff';
        pageBody.style.color = 'black';
    }
}

function setDay(day) {
    let forecast = document.getElementById('forecast-day');
    forecast.textContent = day;
    let daySelection = document.getElementById('day-selection');
    daySelection.style.display = 'none';
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

function updateMean(newSigma) {
    let threshold = document.getElementById('threshold');
    let meanLabel = document.getElementById('mean-label');
    if(newSigma <= 2 && newSigma >= 0) {
        currentSigma = parseFloat(newSigma);
        threshold.textContent = `${currentSigma.toFixed(1)}`;
        meanLabel.textContent = `PRISM Non-Zero Average + ${currentSigma} σ`;
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
    let forecastImage = document.getElementById('forecast-image');
    let thresholdImage = document.getElementById('threshold-image');
    let newForecastURL = rootDirectory;
    let newThresholdURL = rootDirectory;

    // temporary override
    forecastDay = 7;
    let currentSigmaTemp = 0.5;

    if(currentResolution === 'high') {
        newForecastURL += highResPrefix + 'Vote_' + initializationDate + currentSigmaTemp + sigmaDaySuffix + forecastDay + extension;
        newThresholdURL += highResPrefix + currentSigma + sigmaThresholdSuffix + extension;
    } else {
        newForecastURL += 'Vote_' + initializationDate + currentSigmaTemp + sigmaDaySuffix + forecastDay + extension;
        newThresholdURL += lowResPrefix + currentSigma + sigmaThresholdSuffix + extension;
    }
    forecastImage.src = newForecastURL;
    thresholdImage.src = newThresholdURL;
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
        updateThresholdImage();
    } else if(quality === 'low' && currentResolution === 'high') {
        currentResolution = 'low';
        buttonLowRes.style.fontWeight = 'bold';
        buttonHighRes.style.fontWeight = 'normal';
        buttonLowRes.style.backgroundColor = '#0d6efd';
        buttonHighRes.style.backgroundColor = '#212121';
        updateThresholdImage();
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

// Forecast Increment Buttons
document.getElementById('forecast-up').addEventListener('click', function() {
    updateDay(1, true);
});

// Forecast Slider
document.getElementById('day-slider-id').addEventListener('input', function() {
    setDay(this.value);
});

// Forecast Preview Slider
document.getElementById('preview-switch-id').addEventListener('change', function() {
    localStorage.setItem('preview', this.checked);
    updatePreview(this.checked);
});

document.getElementById('forecast-down').addEventListener('click', function() {
    updateDay(-1, true);
});

// Sigma Buttons
document.getElementById('threshold-up').addEventListener('click', function() {
    updateMean(currentSigma + .5);
});

document.getElementById('threshold-down').addEventListener('click', function() {
    updateMean(currentSigma - .5);
});

// Sigma Slider
document.getElementById('threshold-slider-id').addEventListener('input', function() {
    updateMean(this.value);
});

// Initialize Buttons
document.getElementById('init-up').addEventListener('click', function() {
    updateDate('up');
});

document.getElementById('init-down').addEventListener('click', function() {
    updateDate('down');
});

// Theme Switch
document.getElementById('theme-switch-id').addEventListener('change', function() {
    localStorage.setItem('theme', this.checked);
    updateTheme(this.checked);
});


















