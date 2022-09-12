const rootDirectory = 'resources/'
const sigmaThresholdSuffix = '_sigma_threshold';
const sigmaDaySuffix = '_sigma_Day';
const highResPrefix = 'High_res_'
const lowResPrefix = 'Low_res_'
const extension = '.png'
const dayButtons = document.querySelectorAll('.btn-light');
const lightPreview = document.querySelectorAll('.preview-switch');
const resolution = document.querySelectorAll('.button-resolution');
 






let currentResolution = 'high';
let currentSigma = .5;
let initializationDate = new Date();
let forecastDay = 1;
let previewsEnabled = false;

// On-Load Functionality
window.onload = function() {
    initializePreview();
    initializeTheme();
    initializeDates();
}

function log(msg) {
    console.log(msg);
}

function setWidth(context, size) {
    context.style.width = size + 'px'
}

function initializePreview() {
    let themeCheckbox = document.getElementById('preview-switch-id');
    let isChecked = localStorage.getItem("preview");
    previewsEnabled = isChecked === 'true';
    themeCheckbox.checked = previewsEnabled;
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
    if(isChecked) {
        let thumbnails = document.getElementById('preview-thumbnails');
        let buttonsOnly = document.getElementById('no-preview');
        thumbnails.style.display = 'block';
        buttonsOnly.style.display = 'none';
    } else {
        let thumbnails = document.getElementById('preview-thumbnails');
        let buttonsOnly = document.getElementById('no-preview');
        thumbnails.style.display = 'none';
        buttonsOnly.style.display = 'block';
    }
}

function updateTheme(isChecked) {
    let controlPanel = document.getElementById('control-panel-id');
    let controlPanelSection = document.getElementById('control-panel-section-id');
    let mainHeader = document.getElementById('main-header-id');
    let mapSection = document.getElementById('map-section-id');
    let pageBody = document.getElementById('page-body-id');
    let ctrlOff = document.getElementById('init');
    let forecastDay = document.getElementById('forecast-day');
    let daySlider = document.getElementById('day-slider-id');
    let thresholdSlider = document.getElementById('threshold-slider-id');
    let modelButton = document.getElementById('button-model-dropdown');
    let thresholdButton = document.getElementById('threshold');
    let userManual = document.getElementById('users-manual');
   
   


    
    
   
    


    if (isChecked) {
        // Set Dark Theme
        controlPanel.style.backgroundColor = '#212121';
        controlPanel.style.border = '5px solid black';
        controlPanelSection.style.backgroundColor = '#292929';
        mainHeader.style.backgroundColor = '#1c2678';
        mapSection.style.backgroundColor = '#212121';
        pageBody.style.backgroundColor = '#40444b';
        pageBody.style.color = 'white';
        ctrlOff.style.backgroundColor = '#0d6efd';
        ctrlOff.style.borderColor = '#0d6efd';
        thresholdButton.style.backgroundColor = '#0d6efd';
        userManual.style.backgroundColor = '#0d6efd';
        modelButton.style.backgroundColor = '#0d6efd';
        forecastDay.style.backgroundColor = '#0d6efd';
        forecastDay.style.borderColor = '#0d6efd';
      
        daySlider.style.accentColor = '#0d6efd';
        thresholdSlider.style.accentColor = '#0d6efd';
        modelButton.style.borderColor = '#0a53be';
        dayButtons.forEach((dayButtons) => {
            dayButtons.style.borderColor = "#0a53be";
            dayButtons.classList.remove('light-hover');
        });
        lightPreview.forEach((lightPreview) => {
            lightPreview.classList.remove('light-switch');
        });

        // resolution.forEach((resolution) => {
        //     resolution.classList.remove('res-light');
        // });
        

    } else {
        // Set Light Theme
        controlPanel.style.backgroundColor = '#fff';
        controlPanel.style.border = '0';
        controlPanelSection.style.backgroundColor = '#efefef';
        ctrlOff.style.backgroundColor = '#77c743';
        ctrlOff.style.borderColor = '#77c743';
        modelButton.style.backgroundColor = '#77c743';
        modelButton.style.borderColor = '#77c743';
        thresholdButton.style.backgroundColor = '#77c743';
        thresholdButton.style.border = '#77c743';
        forecastDay.style.backgroundColor = '#77c743';
        forecastDay.style.borderColor = '#77c743';
        
        userManual.style.backgroundColor = '#77c743';
        userManual.style.borderColor = '#77c743';
        mainHeader.style.backgroundColor = '#2d871933';
        mapSection.style.backgroundColor = '#efefef';
        daySlider.style.accentColor = '#569630';
        thresholdSlider.style.accentColor = '#569630';
        pageBody.style.backgroundColor = '#2d871933';
        pageBody.style.color = 'black';
        dayButtons.forEach((dayButtons) => {
            dayButtons.style.borderColor = "#77c743";
            dayButtons.classList.add('light-hover');
        });
       
        lightPreview.forEach((lightPreview) => {
            lightPreview.classList.add('light-switch');
        });
        
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

    let preview = '';
}

function updateModel(type) {
    let modelButton = document.getElementById('button-model-dropdown');
    modelButton.textContent = type;
}

function updateDay(delta, modifyForecast) {
    let dateInitialize = document.getElementById('init');
    let forecastDateLabel = document.getElementById('main-forecast-date');
    let forecast = document.getElementById('forecast-day');
    let daySelection = document.getElementById('day-selection');
    daySelection.style.display = 'none';
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
        updateForecastSlider(dayOffset)
    }
}

function updateMean(newSigma) {
    let threshold = document.getElementById('threshold');
    let meanLabel = document.getElementById('mean-label');
    if(newSigma <= 2 && newSigma >= 0) {
        currentSigma = parseFloat(newSigma);
        threshold.textContent = `${currentSigma.toFixed(1)}`;
        meanLabel.textContent = `PRISM Non-Zero Average + ${currentSigma} σ`;
        updateThresholdSlider();
        updateThresholdImage();
    }
}

function updateThresholdSlider() {
    let thresholdSlider = document.getElementById('threshold-slider-id');
    thresholdSlider.value = currentSigma;
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
    initializationDate = '20191227_';
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
        if (quality === 'high' && currentResolution === 'low') {
            currentResolution = 'high';
            buttonHighRes.style.fontWeight = 'bold';
            buttonLowRes.style.fontWeight = 'normal';
            buttonHighRes.style.backgroundColor = '#0d6efd';
            buttonLowRes.style.backgroundColor = '#212121';
            updateThresholdImage();
        } else if (quality === 'low' && currentResolution === 'high') {
            currentResolution = 'low';
            buttonLowRes.style.fontWeight = 'bold';
            buttonHighRes.style.fontWeight = 'normal';
            buttonLowRes.style.backgroundColor = '#0d6efd';
            buttonHighRes.style.backgroundColor = '#212121';
            updateThresholdImage();
        }

      

    }

function updateForecastSlider(day) {
    let forecastSlider = document.getElementById('day-slider-id');
    forecastSlider.value = day;
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

document.getElementById('forecast-down').addEventListener('click', function() {
    updateDay(-1, true);
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


















