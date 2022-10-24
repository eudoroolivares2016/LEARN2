const rootDirectory = 'resources/'
const percentileThreshold = '_percentile_threshold';
const sigmaDaySuffix = '_sigma_Day';
const highResPrefix = 'High_res_'
const lowResPrefix = 'Low_res_'
const extension = '.png'
const dayButtons = document.querySelectorAll('.btn-light');
const lightPreview = document.querySelectorAll('.preview-switch');
const resolution = document.querySelectorAll('.button-resolution');

const INITIALIZE_HISTORY_LIMIT = 5;

// ratios of inner-map to full forecast and threshold images image
const xRatio = 2010 / 4599;
const yRatio = 3686 / 4768;
const yRatioHigh = 3570 / 4768;
const xRatioThreshold = 1642 / 3463;
const yRatioThreshold = 3007 / 4092;
const yRatioHighThreshold = 2915 / 4092;

const chartSettingsDark = {
    fontColor: 'white',
    backgroundColor: '#212121'
}
const chartSettingsLight = {
    fontColor: 'black',
    backgroundColor: '#585858'
}

let chartSettingsCurrent = chartSettingsDark;

let currentSigma = .5;
let forecastDayIndex = 1;
let currentInitialize = 5;

let previewsEnabled = false;
let isTodayStored = false;
let chartStacked = false;
let chartLoadedOnce = false;
let isPanelLocked = true;
let dark = true;
let fullStop = true;
let resetGrid = false;

let timeSeriesCanvas = null;
let timeSeriesCanvas2 = null;
let savedX = null;
let savedY = null;

let modelType = 'Voting';
let chartType = 'line';
let currentResolution = 'high';
let chartLocation = 'Right';
let maxDate = '';
let realDate = '';

let chartConfig = {};

let forecastImageCache = [];
let votingCache = [];
let convolutionalCache = [];
let denseCache = [];
let ecmwfCache = [];
let gefsCache = [];
let mapArray = [];
let allCSVArray = [];
let clickedCoordinates = [];
let csvCache = Array(10);

// On-Load Functionality
window.onload = function() {
    initializePreview();
    initializeTheme();
}

Array.prototype.max = function() {
    return Math.max.apply(null, this);
};

Array.prototype.min = function() {
    return Math.min.apply(null, this);
};

function loadCanvas() {
    let forecastCanvas = document.getElementById('forecast-canvas');
    let img = document.getElementById('forecast-image');

    let thresholdCanvas = document.getElementById('threshold-canvas');
    let thresholdImage = document.getElementById('threshold-image');

    let yHeight = currentResolution === 'high' ? 277 : 162;
    let yHeight2 = currentResolution === 'high' ? 254 : 163;

    let xOffset = img.width * (810 / 4599);
    let yOffset = img.height * (yHeight / 4768);

    let xOffset2 = thresholdImage.width * (791 / 3463);
    let yOffset2 = thresholdImage.height * (yHeight2 / 4092);

    let useYRatio = currentResolution === 'high' ? yRatioHigh : yRatio;
    let useYRatioThreshold = currentResolution === 'high' ? yRatioHighThreshold : yRatioThreshold;

    forecastCanvas.height = img.height * useYRatio;
    forecastCanvas.width = img.width * xRatio;
    forecastCanvas.style.left = (img.offsetLeft + 3 + xOffset) + 'px';
    forecastCanvas.style.top = (img.offsetTop + 3 + yOffset) + 'px';

    thresholdCanvas.height = thresholdImage.height * useYRatioThreshold;
    thresholdCanvas.width = thresholdImage.width * xRatioThreshold;
    thresholdCanvas.style.left = (thresholdImage.offsetLeft + 3 + xOffset2) + 'px';
    thresholdCanvas.style.top = (thresholdImage.offsetTop + 3 + yOffset2) + 'px';
}

function setChartLocation(location) {
    let locationButton = document.getElementById('button-chart-location-dropdown');
    locationButton.innerText = location;

    let leftChart = document.getElementById('time-series-id');
    let rightChart = document.getElementById('time-series-id-2');

    chartLocation = location;
    switch(chartLocation) {
        case 'Left':
            leftChart.style.display = 'block';
            rightChart.style.display = 'none';
            break;
        case 'Right':
            leftChart.style.display = 'none';
            rightChart.style.display = 'block';
            break;
        case 'Both':
            leftChart.style.display = 'block';
            rightChart.style.display = 'block';
            break;
    }
}

function toggleControlPanelLock() {
    let lockIcon = document.getElementById('lock-image-id');

    isPanelLocked = !isPanelLocked;

    lockIcon.src = isPanelLocked ? 'resources/locked.png' : 'resources/unlocked.png';

    if(!isPanelLocked) {
        $('#control-panel-section-id').stop().animate({'marginTop': getTopScrollPosition() + 'px', 'marginLeft':($(window).scrollLeft()) + 'px'}, 'fast' );
    }
}

function getChartArrays(x, y) {
    // Trimming Likeliness of Exceedance values to prevent a higher percentile value surpassing a lower one
    let tempArray = [];
    try {
        for(let i = 0; i < 10; i++) {
            for(let j = 4; j > 0; j--) {
                if(allCSVArray[(10 * j) + i][y][x] > allCSVArray[(10 * (j - 1) + i)][y][x]) {
                    allCSVArray[(10 * (j - 1) + i)][y][x] = allCSVArray[(10 * j) + i][y][x];
                }
            }
        }
        for(let i = 0; i < 5; i++) {
            tempArray.push(
                [
                    (allCSVArray[(10 * i)][y][x] * 100).toFixed(0),
                    (allCSVArray[(10 * i) + 1][y][x] * 100).toFixed(0),
                    (allCSVArray[(10 * i) + 2][y][x] * 100).toFixed(0),
                    (allCSVArray[(10 * i) + 3][y][x] * 100).toFixed(0),
                    (allCSVArray[(10 * i) + 4][y][x] * 100).toFixed(0),
                    (allCSVArray[(10 * i) + 5][y][x] * 100).toFixed(0),
                    (allCSVArray[(10 * i) + 6][y][x] * 100).toFixed(0),
                    (allCSVArray[(10 * i) + 7][y][x] * 100).toFixed(0),
                    (allCSVArray[(10 * i) + 8][y][x] * 100).toFixed(0),
                    (allCSVArray[(10 * i) + 9][y][x] * 100).toFixed(0)
                ]
            );
        }
    } catch(e) {
        return [];
    }
    return tempArray;
}

function capitalizeFirstLetter(str) {
    return str[0].toUpperCase() + str.slice(1);
}

function updateChart(type, shouldStack) {
    if(!chartLoadedOnce) {
        return;
    }
    chartSettingsCurrent = dark ? chartSettingsDark : chartSettingsLight;

    let ctx = document.getElementById('time-series-chart-id');
    let ctx2 = document.getElementById('time-series-chart-id-2');
    let dropdown = document.getElementById('button-chart-type-dropdown');

    dropdown.innerText = shouldStack ? 'Stacked' : capitalizeFirstLetter(type);

    chartType = type;
    chartStacked = shouldStack;

    chartConfig.type = chartType;

    for(let i = 0; i < chartConfig.data.datasets.length; i++) {
        chartConfig.data.datasets[i].fill = getFill(i);
    }

    if(timeSeriesCanvas != null) {
        timeSeriesCanvas.destroy();
    }
    if(timeSeriesCanvas2 != null) {
        timeSeriesCanvas2.destroy();
    }

    timeSeriesCanvas = new Chart(
        ctx,
        chartConfig
    );
    timeSeriesCanvas2 = new Chart(
        ctx2,
        chartConfig
    );
}

const fillColors = [
    'rgb(0,197,255)',
    'rgb(0,255,64)',
    'rgb(186,255,0)',
    'rgb(255,111,0)',
    'rgb(255,0,0)'
]

function getFill(index) {
    if(chartStacked) {
        return {
            target: index === 4 ? 'origin' : '+1',
            below: fillColors[index]
        }
    } else {
        return {}
    }
}

const forecastLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
function showTimeSeries(x, y, res) {
    if(x == null || y == null || resetGrid === true) {
        return;
    }
    chartSettingsCurrent = dark ? chartSettingsDark : chartSettingsLight;
    updateCanvas(x, y);
    chartLoadedOnce = true;
    try {
        if(mapArray[y][x] < 0) {
            cleanTimeSeries();
            return;
        }
    } catch(e) {}
    savedX = x;
    savedY = y;
    let ctx = document.getElementById('time-series-chart-id');
    let ctx2 = document.getElementById('time-series-chart-id-2');
    let leftChart = document.getElementById('time-series-id');
    let rightChart = document.getElementById('time-series-id-2');

    switch(chartLocation) {
        case 'Left':
            leftChart.style.display = 'block';
            rightChart.style.display = 'none';
            break;
        case 'Right':
            leftChart.style.display = 'none';
            rightChart.style.display = 'block';
            break;
        case 'Both':
            leftChart.style.display = 'block';
            rightChart.style.display = 'block';
            break;
    }

    let chartArrays = getChartArrays(x, y);
    const chartData = {
        labels: forecastLabels,
        datasets: [{
            label: '50th Percentile',
            backgroundColor: 'rgb(0,197,255)',
            borderColor: 'rgb(0,196,255)',
            borderWidth: 1.5,
            data: chartArrays[0],
            fill: getFill(0)
        },
            {
                label: '60th Percentile',
                backgroundColor: 'rgb(0,255,64)',
                borderColor: 'rgb(0,255,64)',
                borderWidth: 1.5,
                data: chartArrays[1],
                fill: getFill(1)
            },
            {
                label: '70th Percentile',
                backgroundColor: 'rgb(186,255,0)',
                borderColor: 'rgb(186,255,0)',
                borderWidth: 1.5,
                data: chartArrays[2],
                fill: getFill(2)
            },
            {
                label: '80th Percentile',
                backgroundColor: 'rgb(255,111,0)',
                borderColor: 'rgb(255,111,0)',
                borderWidth: 1.5,
                data: chartArrays[3],
                fill: getFill(3)
            },
            {
                label: '90th Percentile',
                backgroundColor: 'rgb(255,0,0)',
                borderColor: 'rgb(255,0,0)',
                borderWidth: 1.5,
                data: chartArrays[4],
                fill: getFill(4)
            },
        ],
    };
    let latitude = 0;
    let longitude = 0;

    if(res === 'high') {
        latitude = 49.5 - (y * 16.5 / 67) - ((16.5 / 67) / 2);
        longitude = -124.5 + (x * 8 / 37) + ((8 / 37) / 2);
    } else {
        latitude = 49.5 - (y * 16.5 / 12) - .6875;
        longitude = -124.5 + (x * 8 / 7) + ((8 / 7) / 2);
    }
    chartConfig = {
        type: chartType,
        data: chartData,
        options: {
            animation: {
                duration: 0
            },
            chartArea: {
                backgroundColor: 'rgba(255, 255, 255, 1)'
            },
            plugins: {
                title: {
                    font: {
                        size: 24
                    },
                    color: chartSettingsCurrent.fontColor,
                    display: true,
                    text: '(Lat, Lon): (' + latitude.toFixed(2) + ', ' + longitude.toFixed(2) + ')',
                },
                legend: {
                    labels: {
                        font: {
                            size: 14
                        },
                        color: chartSettingsCurrent.fontColor
                    }
                },
                tooltip: {
                    titleFont: {
                        size: 24
                    },
                    bodyFont: {
                        size: 18
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: '#40444b'
                    },
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Likelihood of Exceedance',
                        color: chartSettingsCurrent.fontColor,
                        font: {
                            size: 20
                        },
                    },
                    ticks: {
                        color: chartSettingsCurrent.fontColor,
                        font: {
                            size: 14
                        },
                    }
                },
                x: {
                    grid: {
                        color: '#40444b'
                    },
                    title: {
                        display: true,
                        text: 'Forecast Day',
                        color: chartSettingsCurrent.fontColor,
                        font: {
                            size: 20
                        },
                    },
                    ticks: {
                        color: chartSettingsCurrent.fontColor,
                        font: {
                            size: 14
                        },
                    }
                }
            }
        }
    };
    if(timeSeriesCanvas != null) {
        timeSeriesCanvas.destroy();
    }
    if(timeSeriesCanvas2 != null) {
        timeSeriesCanvas2.destroy();
    }

    timeSeriesCanvas = new Chart(
        ctx,
        chartConfig
    );
    timeSeriesCanvas2 = new Chart(
        ctx2,
        chartConfig
    );

    timeSeriesCanvas.config.options.onClick = timeSeriesCanvas2.config.options.onClick = (e) => {
        const canvasPosition = Chart.helpers.getRelativePosition(e, timeSeriesCanvas);

        const dataX = timeSeriesCanvas2.scales.x.getValueForPixel(canvasPosition.x);
        const dataY = timeSeriesCanvas2.scales.y.getValueForPixel(canvasPosition.y);
        setDay(dataX + 1);
    }
}

function paintCanvas(x, y, ctx, canvas) {
    let xStep = 0;
    let yStep = 0;
    if(currentResolution === 'high') {
        xStep = canvas.width / 37;
        yStep = canvas.height / 67;
    } else {
        xStep = canvas.width / 7;
        yStep = canvas.height / 12;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.rect(x * xStep, y * yStep, xStep, yStep);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#030303';
    ctx.rect(x * xStep + 2, y * yStep + 2, xStep - 4, yStep - 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#030303';
    ctx.rect(x * xStep - 2, y * yStep - 2, xStep + 4, yStep + 4);
    ctx.stroke();
}

function updateCanvas(x, y) {
    let canvasForecast = document.getElementById('forecast-canvas');
    let canvasThreshold = document.getElementById('threshold-canvas');

    let ctx = canvasForecast.getContext('2d');
    let ctx2 = canvasThreshold.getContext('2d');

    paintCanvas(x, y, ctx, canvasForecast);
    paintCanvas(x, y, ctx2, canvasThreshold);
}

function updateValueBox(x, y, res) {
    if(resetGrid === true) {
        return;
    }
    try {
        clickedCoordinates = [x, y];
        let exceedanceValue = document.getElementById('exceedance-id');
        let coordinates = document.getElementById('coordinate-id');
        try {
            exceedanceValue.innerHTML = mapArray[y][x] < 0 ? '--' : (100 * mapArray[y][x]).toFixed(0) + '%';
        } catch(e) {}

        let latitude = 0;
        let longitude = 0;

        if(res === 'high') {
            latitude = 49.5 - (y * 16.5 / 67) - ((16.5 / 67) / 2);
            longitude = -124.5 + (x * 8 / 37) + ((8 / 37) / 2);
        } else {
            latitude = 49.5 - (y * 16.5 / 12) - .6875;
            longitude = -124.5 + (x * 8 / 7) + ((8 / 7) / 2);
        }

        coordinates.innerHTML = `(${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;

        let thresholdValue = document.getElementById('threshold-value-id');
        thresholdValue.innerHTML = csvCache[(currentSigma * 2) + resolutionOffset()][y][x] < 0 ? '--' : csvCache[(currentSigma * 2) + resolutionOffset()][y][x] + ' in';
    } catch(e) {}
}

function resolutionOffset() {
    return currentResolution === 'high' ? 5 : 0;
}

function loadAllCSVFiles(_callback) {
    // Wait for the initial CSV to load
    $.get('resources/Low_res_60th_percentile_threshold.csv', undefined, function(data) {
        data = data.replace('\r', '');
        let arrayOuter = data.split('\n');
        let array = [];
        for(let i = 0; i < arrayOuter.length; i++) {
            if(arrayOuter[i].length > 0) {
                array.push(arrayOuter[i].split(','));
            }
        }
        csvCache[1] = array;
        _callback();
    });

    // Load the rest of the CSVs in the background
    loadCSVFile('resources/Low_res_50th_percentile_threshold.csv', 0);
    loadCSVFile('resources/Low_res_70th_percentile_threshold.csv', 2);
    loadCSVFile('resources/Low_res_80th_percentile_threshold.csv', 3);
    loadCSVFile('resources/Low_res_90th_percentile_threshold.csv', 4);

    loadCSVFile('resources/High_res_50th_percentile_threshold.csv', 5);
    loadCSVFile('resources/High_res_60th_percentile_threshold.csv', 6);
    loadCSVFile('resources/High_res_70th_percentile_threshold.csv', 7);
    loadCSVFile('resources/High_res_80th_percentile_threshold.csv', 8);
    loadCSVFile('resources/High_res_90th_percentile_threshold.csv', 9);
}

function loadCSVFile(fileName, index) {
    $.get(fileName, undefined, function(data) {
        data = data.replace('\r', '');
        let arrayOuter = data.split('\n');
        let array = [];
        for(let i = 0; i < arrayOuter.length; i++) {
            if(arrayOuter[i].length > 0) {
                array.push(arrayOuter[i].split(','));
            }
        }
        csvCache[index] = array;
    });
}

function cleanTimeSeries() {
    const chartData = {
        labels: forecastLabels,
        datasets: [{
            label: '50th Percentile',
            backgroundColor: 'rgb(0,197,255)',
            borderColor: 'rgb(0,196,255)',
            borderWidth: 1.5,
        },
            {
                label: '60th Percentile',
                backgroundColor: 'rgb(0,255,64)',
                borderColor: 'rgb(0,255,64)',
                borderWidth: 1.5,
            },
            {
                label: '70th Percentile',
                backgroundColor: 'rgb(186,255,0)',
                borderColor: 'rgb(186,255,0)',
                borderWidth: 1.5,
            },
            {
                label: '80th Percentile',
                backgroundColor: 'rgb(255,111,0)',
                borderColor: 'rgb(255,111,0)',
                borderWidth: 1.5,
            },
            {
                label: '90th Percentile',
                backgroundColor: 'rgb(255,0,0)',
                borderColor: 'rgb(255,0,0)',
                borderWidth: 1.5,
            },
        ],
    };

    const config = {
        type: chartType,
        data: chartData,
        options: {
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 14
                        },
                        color: chartSettingsCurrent.fontColor
                    }
                },
                tooltip: {
                    titleFont: {
                        size: 24
                    },
                    bodyFont: {
                        size: 18
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Likelihood of Exceedance',
                        color: chartSettingsCurrent.fontColor,
                        font: {
                            size: 20
                        },
                    },
                    ticks: {
                        color: chartSettingsCurrent.fontColor,
                        font: {
                            size: 14
                        },
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Forecast Day',
                        color: chartSettingsCurrent.fontColor,
                        font: {
                            size: 20
                        },
                    },
                    ticks: {
                        color: chartSettingsCurrent.fontColor,
                        font: {
                            size: 14
                        },
                    }
                }
            }
        }
    };
    if(timeSeriesCanvas != null) {
        timeSeriesCanvas.destroy();
    }
    if(timeSeriesCanvas2 != null) {
        timeSeriesCanvas2.destroy();
    }

    timeSeriesCanvas = new Chart(
        document.getElementById('time-series-chart-id'),
        config
    );
    timeSeriesCanvas2 = new Chart(
        document.getElementById('time-series-chart-id-2'),
        config
    );
}

function getDateOffset() {
    return INITIALIZE_HISTORY_LIMIT - currentInitialize;
}

function readCSV(shouldSet = false) {
    let param = {
        prefix: getPrefix(),
        suffix: sigmaToPercentile(true),
        model: getModelPrefix(),
        offset: getDateOffset()
    }
    $.get(window.location.href + 'aws3', param, function(date) {
        let csvParam = {
            file: param.prefix + getModelPrefix() + fitVotePrefix(date) + date + '_',
            suffix: param.suffix
        };
        updateDayLabel(date);
        $.get(window.location.href + 'aws2', csvParam, function(data) {
            allCSVArray = data;
            let offset = (10 * (currentSigma * 2)) + (forecastDayIndex - 1);
            mapArray = data[offset];
            loadAllCSVFiles(function() {
                updateDay(0, false, false);
                createGrid();
                showTimeSeries(savedX, savedY, currentResolution);
                if(shouldSet) {
                    resetGrid = false;
                }
            });
        });
    });
}

function createGrid() {
    let image = document.getElementById('forecast-image');
    let mapSpan = document.getElementById('interactive-map-id');
    let width = image.width;
    let height = image.height;

    let x = width;
    let y = height;
    let xSteps = 0;
    let ySteps = 0;

    if(currentResolution === 'high') {
        x = x / 37;
        y = y / 67;

        xSteps = 37;
        ySteps = 67;
    } else {
        x = x / 7;
        y = y / 12;

        xSteps = 7;
        ySteps = 12;
    }

    x *= xRatio;
    y *= currentResolution === 'high' ? yRatioHigh : yRatio;

    let xOffset = width * (810 / 4599);
    let yOffset = currentResolution === 'high' ? height * (277 / 4768) : height * (162 / 4768);

    let grid = '';
    for(let i = 0; i < ySteps; i++) {
        for(let j = 0; j < xSteps; j++) {
            let x1 = xOffset + (x * j);
            let x2 = xOffset + (x * j) + x;
            let y1 = yOffset + (y * i);
            let y2 = yOffset + (y * i) + y;
            grid += `<area shape="rect" coords="${x1}, ${y1}, ${x2}, ${y2}" alt="grid" onclick="showTimeSeries(${j}, ${i}, currentResolution);" onmouseover="updateValueBox(${j}, ${i}, currentResolution);">\n`;
        }
    }
    mapSpan.innerHTML = '<map name="forecast-map">\n' +
        `${grid}` +
        '</map>';
}


function enableInteraction() {
    loadCanvas();
    readCSV();
}

function toBase64(arr) {
    return btoa(
        arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
}

const tempVote = {
    file: '1.5_Vote_2022-1-1_'
};

const tempConvolutional = {
    file: '1.5_Convolutional_2022-1-1_'
};

const tempDense = {
    file: '1.5_Dense_2022-1-1_'
};

const tempECMWF = {
    file: '1.5_ECMWF_2022-1-1_'
};

const tempGEFS = {
    file: '1.5_GEFS_2022-1-1_'
};

let temp = tempVote;


function getModelPrefix() {
    switch(modelType) {
        case 'Voting':
            return 'Vote_';
        case 'Convolutional':
            return 'Convolutional_';
        case 'Dense':
            return 'Dense_';
        case 'ECMWF':
            return 'ECMWF_';
        case 'GEFS':
            return 'GEFS_';
    }
}

function getPrefix() {
    return currentResolution === 'high' ? '0.25_' : '0.5_'
}

function test() {

}

function correctModelType() {
    return modelType === 'Voting' ? 'Vote' : modelType;
}

function underflow(value, reset) {
    if(value < 0) {
        return reset;
    } else {
        return value;
    }
}

function updateDayLabel(date) {
    realDate = date;
    let realDateArray = realDate.split('-');
    let realDateObject = new Date(parseInt(realDateArray[0]), underflow((parseInt(realDateArray[1]) - 1), 11), parseInt(realDateArray[2]));
    let realDateObject2 = new Date(realDateObject);
    realDateObject2.setDate(realDateObject2.getDate() - 1);
    let dateInitialize = document.getElementById('init');
    let forecastDateLabel = document.getElementById('main-forecast-date');
    let newDateArr1 = realDateObject2.toDateString().split(' ');
    let newDateArr2 = realDateObject.toDateString().split(' ');
    dateInitialize.textContent = `${newDateArr2[1]} ${newDateArr2[2]} ${newDateArr2[3]} (00Z)`;
    forecastDateLabel.textContent = `${newDateArr1[1]} ${newDateArr1[2]}, ${newDateArr1[3]} (12Z) - ${newDateArr2[1]} ${newDateArr2[2]}, ${newDateArr2[3]} (12Z)`;
}

function pad(n) {
    return (n < 10) ? ('0' + n) : n;
}

function fitVotePrefix(date) {
    let dateArr = date.split('-');
    if(modelType === 'Voting') {
        return dateArr[0] + '' + pad(dateArr[1]) + '' + pad(dateArr[2]) + '_';
    } else {
        return '';
    }
}

function retrieveImages() {
    let spinner = document.getElementById('loading-spinner-id');
    let img = document.getElementById('forecast-image');

    spinner.style.display = 'block';

    enableInteraction();

    let param = {
        prefix: getPrefix(),
        suffix: sigmaToPercentile(true),
        model: getModelPrefix(),
        offset: getDateOffset()
    }
    img.src = 'resources/blankForecast.png';
    $.get(window.location.href + 'aws3', param, function(date) {
        let imgParam = {
            file: param.prefix + getModelPrefix() + fitVotePrefix(date) + date + '_',
            suffix: param.suffix
        };
        updateDayLabel(date);
        initializeDates(date);

        $.get(window.location.href + 'aws', imgParam, function(data) {
            forecastImageCache = [];
            for(let i = 0; i < 50; i++) {
                forecastImageCache[i] = data[i];
            }
            if(spinner == null) {
                return;
            }
            switch(modelType) {
                case 'Voting':
                    votingCache = forecastImageCache;
                    break;
                case 'Convolutional':
                    convolutionalCache = forecastImageCache;
                    break;
                case 'Dense':
                    denseCache = forecastImageCache;
                    break;
                case 'ECMWF':
                    ecmwfCache = forecastImageCache;
                    break;
                case 'GEFS':
                    gefsCache = forecastImageCache;
                    break;
            }
            img.src = forecastImageCache[(10 * currentSigma * 2) + (forecastDayIndex - 1)];
            setPreviewImages(forecastImageCache);
            if(!isTodayStored) {
                localStorage.setItem('todayData', forecastImageCache[10]);
                isTodayStored = true;
            }
            spinner.style.display = 'none';
        });
    });
}

function setPreviewImages(cache) {
    if(cache.length > 0) {
        for(let i = 1; i <= 10; i++) {
            let img = document.getElementById('preview-image-' + i);
            threadPreviewImage(cache, img, i - 1 + (10 * currentSigma * 2));
        }
    }
}

function threadPreviewImage(cache, img, index) {
    img.src = cache[index];
}

function setForecastImage(isInitializing) {
    let spinner = document.getElementById('loading-spinner-id');
    spinner.style.display = 'block';
    let img = document.getElementById('forecast-image');
    setPreviewImages(forecastImageCache);
    img.src = forecastImageCache[forecastDayIndex - 1 + (10 * currentSigma * 2)];
    spinner.style.display = 'none';
}

function log(msg) {
    console.log(msg);
}

function setWidth(context, size) {
    context.style.width = size + 'px'
}

function initializePreview() {
    let themeCheckbox = document.getElementById('preview-switch-id');
    let previewCheckbox = document.getElementById('preview-switch-background-id');
    let isChecked = localStorage.getItem("preview");
    previewsEnabled = isChecked === 'true';
    themeCheckbox.checked = previewsEnabled;
    if(dark) {
        previewCheckbox.style.backgroundColor = previewsEnabled ? previewCheckbox.style.backgroundColor = '#0d6efd' : previewCheckbox.style.backgroundColor = '#393939';
    } else {
        previewCheckbox.style.backgroundColor = previewsEnabled ? previewCheckbox.style.backgroundColor = '#77c743' : previewCheckbox.style.backgroundColor = '#393939';
    }
    updatePreview(isChecked === 'true');
}

function initializeTheme() {
    let themeCheckbox = document.getElementById('theme-switch-id');
    let isChecked = localStorage.getItem("theme");
    themeCheckbox.checked = isChecked === 'true';
    dark = isChecked === 'true';
    chartSettingsCurrent = dark ? chartSettingsDark : chartSettingsLight;
    updateTheme(dark);
}

function getTopScrollPosition() {
    let scrollPosition = $(window).scrollTop() - 100 < 0 ? 0 : $(window).scrollTop() - 100;
    scrollPosition = scrollPosition > 400 ? 400 : scrollPosition;
    return scrollPosition;
}

function initializeDates(date) {
    if(maxDate !== '') {
        return;
    }
    maxDate = date;
    let forecastDateElement = document.getElementById('main-forecast-date');
    let today = date.split('-');
    let currentDate = new Date(`${today[0]} ${today[1]} ${today[2]}`);
    currentDate = currentDate.toDateString().split(' ')
    forecastDateElement.textContent = currentDate[3] + ' ' + currentDate[1] + ', ' + currentDate[2];
    updateDate(0);
}

function updatePreview(isChecked) {
    previewsEnabled = isChecked;
    let previewCheckbox = document.getElementById('preview-switch-background-id');
    if(dark) {
        previewCheckbox.style.backgroundColor = isChecked ? previewCheckbox.style.backgroundColor = '#0d6efd' : previewCheckbox.style.backgroundColor = '#393939';
    } else {
        previewCheckbox.style.backgroundColor = isChecked ? previewCheckbox.style.backgroundColor = '#77c743' : previewCheckbox.style.backgroundColor = '#393939';
    }
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
    let previewCheckbox = document.getElementById('preview-switch-background-id');
    let buttonHighRes = document.getElementById('button-high-res');
    let buttonLowRes = document.getElementById('button-low-res');
    let mappedValues = document.getElementById('value-table');
    let dayChange = document.getElementById('change-day');
    let chartType = document.getElementById('button-chart-type-dropdown');
    let chartBackground = document.getElementById('time-series-chart-id-2');

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
        forecastDay.style.backgroundColor = '#0d6efd';
        forecastDay.style.borderColor = '#0d6efd';
        thresholdButton.style.backgroundColor = '#0d6efd';
        userManual.style.backgroundColor = '#0d6efd';
        modelButton.style.backgroundColor = '#0d6efd';
        dayChange.style.backgroundColor = '#292929';
        dayChange.style.border = '5px solid black;';
        chartType.style.backgroundColor = '#0d6efd';
        buttonHighRes.style.backgroundColor = currentResolution === 'high' ? '#0d6efd' : '#212121';
        buttonHighRes.style.borderColor = '#0d6efd'
        buttonLowRes.style.backgroundColor = currentResolution === 'low' ? '#0d6efd' : '#212121';
        buttonLowRes.style.borderColor = '#0d6efd'
        daySlider.style.accentColor = '#0d6efd';
        thresholdSlider.style.accentColor = '#0d6efd';
        modelButton.style.borderColor = '#0a53be';
        previewCheckbox.style.backgroundColor = previewsEnabled ? previewCheckbox.style.backgroundColor = '#0d6efd' : previewCheckbox.style.backgroundColor = '#393939';
        mappedValues.style.backgroundColor = '#212121';
        chartBackground.style.backgroundColor = '#212121';

        dayButtons.forEach((dayButtons) => {
            dayButtons.style.borderColor = "#0a53be";
            dayButtons.classList.remove('light-hover');
        });
        lightPreview.forEach((lightPreview) => {
            lightPreview.classList.remove('light-switch');
        });

    } else {
        // Set Light Theme
        controlPanel.style.backgroundColor = '#fff';
        controlPanel.style.border = '0';
        controlPanelSection.style.backgroundColor = '#efefef';
        ctrlOff.style.backgroundColor = '#77c743';
        ctrlOff.style.borderColor = '#77c743';
        forecastDay.style.backgroundColor = '#77c743';
        forecastDay.style.borderColor = '#77c743';
        modelButton.style.backgroundColor = '#77c743';
        modelButton.style.borderColor = '#77c743';
        thresholdButton.style.backgroundColor = '#77c743';
        thresholdButton.style.border = '#77c743';
        buttonHighRes.style.backgroundColor = currentResolution === 'high' ? '#77c743' : '#6c757d';
        buttonHighRes.style.borderColor = '#77c743';
        buttonLowRes.style.backgroundColor = currentResolution  === 'low' ? '#77c743' : '#6c757d';
        buttonLowRes.style.borderColor = '#77c743';
        userManual.style.backgroundColor = '#77c743';
        chartType.style.backgroundColor = '#77c743';
        userManual.style.borderColor = '#77c743';
        mainHeader.style.backgroundColor = '#2d871933';
        mapSection.style.backgroundColor = '#efefef';
        dayChange.style.backgroundColor = '#fff';
        dayChange.style.border = '0px solid black;';
        daySlider.style.accentColor = '#569630';
        thresholdSlider.style.accentColor = '#569630';
        pageBody.style.backgroundColor = '#2d871933';
        pageBody.style.color = 'black';
        previewCheckbox.style.backgroundColor = previewsEnabled ? previewCheckbox.style.backgroundColor = '#77c743' : previewCheckbox.style.backgroundColor = '#393939';
        mappedValues.style.backgroundColor = '#fff';
        chartBackground.style.backgroundColor = '#ffffff';

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
}

function quickUpdateFromCache(cache) {
    let img = document.getElementById('forecast-image');
    img.src = cache[forecastDayIndex - 1 + (10 * currentSigma * 2)];
}

function updateModel(type) {
    switch(modelType) {
        case 'Voting':
            temp = tempVote;
            break;
        case 'Convolutional':
            temp = tempConvolutional;
            break;
        case 'Dense':
            temp = tempDense;
            break;
        case 'ECMWF':
            temp = tempECMWF;
            break;
        case 'GEFS':
            temp = tempGEFS;
            break;
    }
    modelType = type;
    let modelButton = document.getElementById('button-model-dropdown');
    modelButton.textContent = type;
    if(timeSeriesCanvas != null) {
        timeSeriesCanvas.destroy();
        cleanTimeSeries();
    }
    if(timeSeriesCanvas2 != null) {
        timeSeriesCanvas2.destroy();
        cleanTimeSeries();
    }
    updateImages();
}

function updateImages() {
    switch(modelType) {
        case 'Voting':
            if(votingCache.length > 0) {
                setForecastImage(false);
                quickUpdateFromCache(votingCache);
                setPreviewImages(votingCache);
                readCSV();
            } else {
                retrieveImages();
            }
            break;
        case 'Convolutional':
            if(convolutionalCache.length > 0) {
                setForecastImage(false);
                quickUpdateFromCache(convolutionalCache);
                setPreviewImages(convolutionalCache);
                readCSV();
            } else {
                retrieveImages();
            }
            break;
        case 'Dense':
            if(denseCache.length > 0) {
                setForecastImage(false);
                quickUpdateFromCache(denseCache);
                setPreviewImages(denseCache);
                readCSV();
            } else {
                retrieveImages();
            }
            break;
        case 'ECMWF':
            if(ecmwfCache.length > 0) {
                setForecastImage(false);
                quickUpdateFromCache(ecmwfCache);
                setPreviewImages(ecmwfCache);
                readCSV();
            } else {
                retrieveImages();
            }
            break;
        case 'GEFS':
            if(gefsCache.length > 0) {
                setForecastImage(false);
                quickUpdateFromCache(gefsCache);
                setPreviewImages(gefsCache);
                readCSV();
            } else {
                retrieveImages();
            }
            break;
    }
}

function updateDay(delta, modifyForecast, shouldUpdateImages = true) {
    let dateInitialize = document.getElementById('init');
    let forecast = document.getElementById('forecast-day');
    let daySelection = document.getElementById('day-selection');
    daySelection.style.display = 'none';
    let currentDateArr = dateInitialize.textContent.split(' ');
    let currentDate1 = new Date(`${currentDateArr[1]} ${currentDateArr[2]} ${currentDateArr[0]}`);
    let currentDate2 = new Date(`${currentDateArr[1]} ${currentDateArr[2]} ${currentDateArr[0]}`);
    let currentDay = parseInt(forecast.textContent);
    if(currentDay + delta >= 1 && currentDay + delta <= 10) {
        let dayOffset = currentDay + delta;
        if(modifyForecast) {
            forecast.textContent = `${dayOffset}`;
        }
        currentDate1.setDate(currentDate1.getDate() + dayOffset - 1);
        currentDate2.setDate(currentDate2.getDate() + dayOffset);
        updateForecastSlider(dayOffset)
        forecastDayIndex = dayOffset;
        let offset = (10 * (currentSigma * 2)) + (forecastDayIndex - 1);
        mapArray = allCSVArray[offset];
        if(shouldUpdateImages) {
            updateImages();
        }
    }
    if(resetGrid) {
        readCSV(true);
    }
}

function updateMean(newSigma) {
    let threshold = document.getElementById('threshold');
    let meanLabel = document.getElementById('mean-label');
    if(newSigma <= 2 && newSigma >= 0) {
        currentSigma = parseFloat(newSigma);
        let thresholdValue = 50 + (currentSigma * 20);
        threshold.textContent = `${thresholdValue}`;
        meanLabel.textContent = `PRISM Threshold Percentile: ${thresholdValue}`;

        let offset = (10 * (currentSigma * 2)) + (forecastDayIndex - 1);
        mapArray = allCSVArray[offset];

        updateImages();
        updateThresholdImage();
        updateThresholdSlider();
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
    forecastDateLabel.textContent = `${newDateArr[1]} ${newDateArr[2]}, ${newDateArr[3]}`;
    retrieveImages();
}

function sigmaToPercentile(suffix) {
    if(suffix) {
        return 50 + (currentSigma * 20) + 'th';
    } else {
        return 50 + (currentSigma * 20);
    }
}

function updateThresholdImage() {
    let thresholdImage = document.getElementById('threshold-image');
    let newThresholdURL = rootDirectory;

    if(currentResolution === 'high') {
        newThresholdURL += highResPrefix + sigmaToPercentile(true) + percentileThreshold + extension;
    } else {
        newThresholdURL += lowResPrefix + sigmaToPercentile(true) + percentileThreshold + extension;
    }
    thresholdImage.src = newThresholdURL;
}

function emptyCaches() {
    votingCache = [];
    convolutionalCache = [];
    denseCache = [];
    ecmwfCache = [];
    gefsCache = [];

    savedX = null;
    savedY = null;

    cleanTimeSeries();
}

function updateResolution(quality) {
    let buttonHighRes = document.getElementById('button-high-res');
    let buttonLowRes = document.getElementById('button-low-res');
    resetGrid = true;
    if(quality === 'high' && currentResolution === 'low') {
        currentResolution = 'high';
        buttonHighRes.style.fontWeight = 'bold';
        buttonLowRes.style.fontWeight = 'normal';
        buttonHighRes.style.backgroundColor = dark ? '#0d6efd' : '#77c743';
        buttonLowRes.style.backgroundColor = dark ? '#212121' : '#6c757d';

        emptyCaches();

        updateThresholdImage();
        retrieveImages();
    } else if(quality === 'low' && currentResolution === 'high') {
        currentResolution = 'low';
        buttonLowRes.style.fontWeight = 'bold';
        buttonHighRes.style.fontWeight = 'normal';
        buttonLowRes.style.backgroundColor = dark ? '#0d6efd' : '#77c743';
        buttonHighRes.style.backgroundColor = dark ? '#212121' : '#6c757d';

        emptyCaches();

        updateThresholdImage();
        retrieveImages();
    }
}

function incrementCallback(delta, _callback) {
    currentInitialize += delta;
    _callback();
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

document.getElementById('option-ecmwf').addEventListener('click', function() {
    updateModel('ECMWF');
});

document.getElementById('option-gefs').addEventListener('click', function() {
    updateModel('GEFS');
});

// Chart Type Selection
document.getElementById('option-line').addEventListener('click', function() {
    updateChart('line', false);
});

document.getElementById('option-stacked').addEventListener('click', function() {
    updateChart('line', true);
});

document.getElementById('option-bar').addEventListener('click', function() {
    updateChart('bar', false);
});

// Chart Location Selection
document.getElementById('option-right').addEventListener('click', function() {
    setChartLocation('Right');
});

document.getElementById('option-left').addEventListener('click', function() {
    setChartLocation('Left');
});

document.getElementById('option-both').addEventListener('click', function() {
    setChartLocation('Both');
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

// Control Panel Lock
document.getElementById('lock-image-id').addEventListener('click', function() {
    toggleControlPanelLock();
});

// Initialize Buttons
document.getElementById('init-up').addEventListener('click', function() {
    if(currentInitialize < INITIALIZE_HISTORY_LIMIT) {
        incrementCallback(1, function() {
            updateDate('up');
        })
    }
});

document.getElementById('init-down').addEventListener('click', function() {
    if(currentInitialize > 0) {
        incrementCallback(-1, function() {
            updateDate('down');
        })
    }
});

// Theme Switch
document.getElementById('theme-switch-id').addEventListener('change', function() {
    localStorage.setItem('theme', this.checked);
    dark = this.checked;
    updateTheme(this.checked);
    showTimeSeries(savedX, savedY, currentResolution);
});

// Forecast Image onClick
document.getElementById('forecast-canvas').addEventListener('click', function() {

});

$(window).scroll(function(){
    if(isPanelLocked) {
        return;
    }
    $('#control-panel-section-id').stop().animate({'marginTop': getTopScrollPosition() + 'px', 'marginLeft':($(window).scrollLeft()) + 'px'}, 'fast' );
});

// If user resizes browser window, fix Forecast map coordinate positions
window.addEventListener('resize', function(){
    enableInteraction();
}, true);

$( window ).on( "load", function() {
    retrieveImages();
});




















