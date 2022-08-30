function log(msg) {
    console.log(msg);
}

function setDay(day) {
    let forecast = document.getElementById('forecast-day');
    forecast.textContent = day;
    toggleDaySelection();
}

function toggleDaySelection() {
    let daySelection = document.getElementById('day-selection');
    daySelection.style.display = daySelection.style.display === 'block' ? 'none' : 'block';
}

function updateModel(type) {
    let modelButton = document.getElementById('button-model-dropdown');
    modelButton.textContent = type;
}

function updateDay(increment) {
    let forecastDateLabel = document.getElementById('main-forecast-date');
    let forecast = document.getElementById('forecast-day');
    let currentDateArr = forecastDateLabel.textContent.split(' ');
    let currentDate = new Date(currentDateArr[1] + ' ' + currentDateArr[2] + ' ' + currentDateArr[0]);
    let currentDay = forecast.textContent;
    if(increment === 'up' && currentDay < 10) {
        forecast.textContent = (parseInt(currentDay) + 1) + '';
        currentDate.setDate(currentDate.getDate() + 1);
    } else if(increment === 'down' && currentDay > 1) {
        forecast.textContent = (parseInt(currentDay) - 1) + '';
        currentDate.setDate(currentDate.getDate() - 1);
    }
    let newDateArr = currentDate.toDateString().split(' ');
    //forecastDateLabel.textContent = newDateArr[1] + ' ' + newDateArr[2] + ', ' + newDateArr[3];
}

function updateMean(increment) {
    let threshold = document.getElementById('threshold');
    //let lowerMeanLabel = document.getElementById('lower-mean-label');
    let upperMeanLabel = document.getElementById('upper-mean-label');
    let currentThreshold = threshold.textContent;
    if(increment === 'up' && currentThreshold < 2.5) {
        threshold.textContent = (parseFloat(currentThreshold) + .5).toFixed(1) + '';
        upperMeanLabel.textContent = 'Average + ' + (2 * (parseFloat(currentThreshold) + .5)) + ' σ';

    } else if(increment === 'down' && currentThreshold > .5) {
        threshold.textContent = (parseFloat(currentThreshold) - .5).toFixed(1) + '';
        upperMeanLabel.textContent = 'Average + ' + (2 * (parseFloat(currentThreshold) - .5)) + ' σ';
    }
}

function updateDate(increment) {
    let currentDateId = document.getElementById('init');
    let forecastDateLabel = document.getElementById('main-forecast-date');
    let currentDateArr = currentDateId.textContent.split(' ');
    let currentDate = new Date(currentDateArr[1] + ' ' + currentDateArr[2] + ' ' + currentDateArr[0]);
    if(increment === 'up') {
        currentDate.setDate(currentDate.getDate() + 1);
    } else if(increment === 'down') {
        currentDate.setDate(currentDate.getDate() - 1);
    }
    let newDateArr = currentDate.toDateString().split(' ');
    let newDateLabel = newDateArr[1] + ' ' + newDateArr[2] + ', ' + newDateArr[3];
    let newDate = newDateArr[3] + ' ' + newDateArr[1] + ' ' + newDateArr[2];
    currentDateId.textContent = newDate;
    forecastDateLabel.textContent = newDateLabel;
}

// Day Selection
document.getElementById('forecast-day').addEventListener('click', function() {
    toggleDaySelection();
});

// Model Selection
document.getElementById('option-dense').addEventListener('click', function() {
    updateModel('Dense');
});

document.getElementById('option-cluster').addEventListener('click', function() {
    updateModel('Cluster');
});

// Increment Buttons
document.getElementById('forecast-up').addEventListener('click', function() {
    updateDay('up');
});

document.getElementById('forecast-down').addEventListener('click', function() {
    updateDay('down');
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




















