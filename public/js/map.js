let mapArray = [];

function log(msg) {
    console.log(msg);
}

function updateValueBox(x, y) {
    let value = document.getElementById('exceedance-id');
    let coordinates = document.getElementById('coordinate-id');
    value.innerHTML = mapArray[y][x] < 0 ? '--' : mapArray[y][x];
    coordinates.innerHTML = `(${x}, ${y})`;
}

function readCSV(fileName) {
    let params = {
        file: fileName
    }
    $.get(window.location.href + 'aws2', params, function(data) {
        mapArray = data;
        createGrid();
    });
}

function createGrid() {
    let image = document.getElementById('forecast-image-id');
    let mapSpan = document.getElementById('interactive-map-id');

    let width = image.width;
    let height = image.height;

    let x = width / 7;
    let y = height / 12;

    // ratio of inner-map to full image
    const xRatio = 1184 / 3265;
    const yRatio = 2607 / 3517;

    x *= xRatio;
    y *= yRatio;

    let xOffset = width * (894 / 3265);
    let yOffset = height * (154 / 3517);

    log(width + ', ' + height);

    let grid = '';

    for(let i = 0; i < 12; i++) {
        for(let j = 0; j < 7; j++) {
            let x1 = xOffset + (x * j);
            let x2 = xOffset + (x * j) + x;
            let y1 = yOffset + (y * i);
            let y2 = yOffset + (y * i) + y;
            grid += `<area shape="rect" coords="${x1}, ${y1}, ${x2}, ${y2}" alt="grid" onmouseover="updateValueBox(${j}, ${i})">\n`;
        }
    }
    mapSpan.innerHTML = '<map name="forecast-map">\n' +
        `${grid}` +
        '</map>';
}


function enableInteraction() {
    readCSV('1.5_Vote_2022-1-1_1.csv_0.5.csv');
}


$( window ).on( "load", function() {
    enableInteraction();
});