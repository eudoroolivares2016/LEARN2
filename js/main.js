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
    let forecast = document.getElementById('forecast-day');
    let currentDay = forecast.textContent;
    if(increment === 'up' && currentDay < 10) {
        forecast.textContent = (parseInt(currentDay) + 1) + '';
    } else if(increment === 'down' && currentDay > 1) {
        forecast.textContent = (parseInt(currentDay) - 1) + '';
    }
}

function updateMean(increment) {
    let threshold = document.getElementById('threshold');
    let currentThreshold = threshold.textContent;
    if(increment === 'up' && currentThreshold < 2.5) {
        threshold.textContent = (parseFloat(currentThreshold) + .5).toFixed(1) + '';
    } else if(increment === 'down' && currentThreshold > .5) {
        threshold.textContent = (parseFloat(currentThreshold) - .5).toFixed(1) + '';
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




















