const canvas = document.getElementById("canvas");
canvas.getContext("2d").scale(2, 2);
const ctx = canvas.getContext("2d");


var scale = Math.floor((canvas.width / 2) / 16);
var rows = Math.floor((canvas.width / 2) / scale);
var columns = Math.floor((canvas.height / 2) / scale);


var grid = [];

var firstClick = true;

var punkte = 0;

var minen = 40;

var lineW = 4;

var finished = false;

start();

function start() {

    for (var i = 0; i < rows; i++) {
        grid[i] = new Array(columns);
    }

    for (var y = 0; y < columns; y++) {
        for (var x = 0; x < rows; x++) {
            var cell = new Cell(x, y);
            grid[x][y] = cell;
            grid[x][y].show("DARKSEAGREEN");
        }
    }

    for (var i = 0; i < minen; i++) {
        grid[random(0, grid.length - 1)][random(0, grid[0].length - 1)].istMine();
    }


    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = lineW;
    ctx.moveTo(2, 0);
    for (var x = 0; x <= rows; x++) {
        ctx.lineTo(x * scale + 2, scale * columns + 4);
        ctx.moveTo((x + 1) * scale + 2, 0);
    }
    ctx.moveTo(0, 2);
    for (var y = 0; y <= columns; y++) {
        ctx.lineTo(scale * rows + 4, y * scale + 2);
        ctx.moveTo(0, (y + 1) * scale + 2);
    }
    ctx.stroke();

}

function mouseClick(event) {
    var mX = event.clientX;
    var mY = event.clientY;
    if (event.button === 0 && !finished) {
        for (var y = 0; y < columns; y++) {
            for (var x = 0; x < rows; x++) {
                if (mX >= grid[x][y].x * scale + 8 + lineW && mX <= grid[x][y].x * scale + scale + 7 && mY >= grid[x][y].y * scale + lineW + 8 && mY <= grid[x][y].y * scale + scale + 7) {
                    grid[x][y].click();
                }
            }
        }
    } else if (event.button == 2 && !finished) {
        for (var y = 0; y < columns; y++) {
            for (var x = 0; x < rows; x++) {
                if (mX >= grid[x][y].x * scale + 8 + lineW && mX <= grid[x][y].x * scale + scale + 7 && mY >= grid[x][y].y * scale + lineW + 8 && mY <= grid[x][y].y * scale + scale + 7) {
                    grid[x][y].clickR();
                }
            }
        }
    }
}
document.addEventListener("mousedown", mouseClick);


function random(min = 0, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
}

function drawCircle(x, y, c) {
    ctx.fillStyle = c;
    ctx.beginPath()
    ctx.arc(x + (scale / 1.75), y + (scale / 1.75), (scale - 20) / 2, 0, 360)
    ctx.fill();
}

function Punkte(x) {
    punkte += x;
    document.getElementById("punkte").innerHTML = "Punkte: " + punkte;
}

function drawText(x, y) {

    if (grid[x / scale][y / scale].mineCounter > 0) {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText(grid[x / scale][y / scale].mineCounter, x + scale / 3, y + scale - 5);
    }
}

function checkWin() {
    for (var y = 0; y < columns; y++) {
        for (var x = 0; x < rows; x++) {
            if (grid[x][y].visited == false) {
                return;
            }
        }
    }
    finished = true;
    swal({

        title: "Du hast " + punkte + " Punkte.",
        text: "Möchtest du das Level mit deinen Freunden teilen?",
        icon: "success",

        buttons: {
            save: "Ja",
            cancel: "Nein",
        },

    })
        .then((value) => {
            console.log(value);
            if (value) {
                save();
            }
        });
}

function save() {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    var shortGrid = "";
    for (var y = 0; y < columns; y++) {
        for (var x = 0; x < rows; x++) {
            shortGrid += (grid[x][y].mine) ? 1 : 0;
        }
    }
    var hexGrid = "";
    for(var i = 0; i < 256; i+=4) {
        var temp = shortGrid.substring(i,i+4);
        temp = parseInt(temp,2).toString(16).toUpperCase();
        hexGrid += temp;
    }
    dummy.value = hexGrid;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);

    swal("Kopiert!", "Der Code für das Level wurde in deine Zwischenablage gelegt!", "success");
}

function load() {
    finished = true;
    swal({
        title: "Füge den Code für das zu ladende Level hier ein:",
        content: "input",
    },)
        .then(code => {
            if(code) {
            var binGrid = "";
            for(var i = 0; i < code.length; i++) {
                var temp = code[i];
                temp = parseInt(temp,16).toString(2).padStart(4, '0');;
                binGrid += temp;
            }
            while(binGrid.length < 256) {
                code = "0"+code;
            }
            binGrid = Array.from(binGrid);
            for (var y = 0; y < columns; y++) {
                for (var x = 0; x < rows; x++) {
                    grid[x][y].mine = (binGrid[x+y*columns] == "0") ? false:true;
                }
            }
            finished = false;
        }
        });
}