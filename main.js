const canvas = document.getElementById("canvas");
canvas.getContext("2d").scale(2, 2);
const ctx = canvas.getContext("2d");


var reihen = 16;
var scale;
var columns;
var rows;

var grid = [];

var firstClick = true;

var punkte = 0;
var maxPunkte = 0;
var expl = 0;
var minen = 40;

var lineW = 4;
var finished = false;

var user = "testUser";
var alleUser
var userID;

swal({
    title: "Willkommen!",
    text: "Möchtest du ein neues Level anfangen oder eins laden?",
    buttons: {
        neu: "Neues Level",
        laden: "Laden"
    },
})
    .then((value) => {
        switch (value) {

            case "neu":
                swal({
                    title: "Schwierigkeitsstufe",
                    icon: "info",
                    buttons: {
                        leicht: "Leicht",
                        normal: "Normal",
                        schwer: "Schwer",
                    },

                })
                    .then((value) => {
                        switch (value) {
                            case "leicht":
                                reihen = 9;
                                minen = 10;
                                start();
                                break;
                            case "normal":
                                reihen = 16;
                                minen = 40;
                                start();
                                break;
                            case "schwer":
                                reihen = 22;
                                minen = 100;
                                start();
                                break;
                        }
                    });
                break;
            case "laden":
                load();
                break;
        }


    });

/* swal({
    title: "Schwierigkeitsstufe",
    icon: "info",
    buttons: {
        leicht: "Leicht",
        normal: "Normal",
        schwer: "Schwer",
    },

})
    .then((value) => {
        switch (value) {
            case "leicht":
                reihen = 9;
                minen = 10;
                start();
                break;
            case "normal":
                reihen = 16;
                minen = 40;
                start();
                break;
            case "schwer":
                reihen = 22;
                minen = 100;
                start();
                break;
        }
    }); */


function berechneScale() {
    scale = Math.floor((canvas.width / 2) / reihen);
    rows = Math.floor((canvas.width / 2) / scale);
    columns = Math.floor((canvas.height / 2) / scale);
}

function initGrid() {

    punkte = 0;
    maxPunkte = 0;
    expl = 0;


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

function start() {

    berechneScale();

    initGrid();

    for (var i = 0; i < minen; i++) {
        var x = random(0, grid.length - 1);
        var y = random(0, grid[0].length - 1)
        grid[x][y].istMine();
        //console.log(grid[x][y].mine);
    }
}

function mouseClick(event) {
    var mX = mousePos(event).x;
    var mY = mousePos(event).y;

    //  console.log("X: "+mX +" Y: "+mY)
    if (event.button === 0 && !finished) {
        for (var y = 0; y < columns; y++) {
            for (var x = 0; x < rows; x++) {
                if (mX >= grid[x][y].x * scale + lineW && mX <= grid[x][y].x * scale + scale && mY >= grid[x][y].y * scale + lineW && mY <= grid[x][y].y * scale + scale) {
                    grid[x][y].click();
                }
            }
        }
    } else if (event.button == 2 && !finished) {
        for (var y = 0; y < columns; y++) {
            for (var x = 0; x < rows; x++) {
                if (mX >= grid[x][y].x * scale + lineW && mX <= grid[x][y].x * scale + scale && mY >= grid[x][y].y * scale + lineW && mY <= grid[x][y].y * scale + scale) {
                    grid[x][y].clickR();
                }
            }
        }
    }
}


function mousePos(event) {
    var rec = canvas.getBoundingClientRect();
    return { x: event.clientX - rec.left, y: event.clientY - rec.top };
}
document.addEventListener("mousedown", mouseClick);


function random(min = 0, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
}

function drawCircle(x, y, c) {
    ctx.fillStyle = c;
    ctx.beginPath()
    ctx.arc(x + (scale / 2) + 2, y + (scale / 2) + 2, (scale / 2) / 2, 0, 360)
    ctx.fill();
}

function Punkte(x) {
    punkte += x;
    document.getElementById("punkte").innerHTML = "Punkte: " + punkte;
}

function drawText(x, y) {

    if (grid[x / scale][y / scale].mineCounter > 0) {
        ctx.fillStyle = "black";
        var size = scale * 0.81 + "px Arial";
        ctx.font = size;
        if (rows < 22) {
            ctx.fillText(grid[x / scale][y / scale].mineCounter, x + scale * 0.29, y + scale * 0.81);
        }
        else {
            ctx.fillText(grid[x / scale][y / scale].mineCounter, x + scale * 0.34, y + scale * 0.81);
        }
    }
}

function uploadPoints(number) {
    var ref = firebase.database().ref(number + "/User/" + userID +"/Punkte");
    ref.set("Punkte:"+punkte);
}

function addUser(number) {
    var ref = firebase.database().ref(number + "/User");
    ref.once("value", function (sn) {
        if (sn.val()) {
            var users = sn.val();
            userID = users.length;
            users.push({Name: user, Punkte: punkte});
            ref.set(users);
        }
    });
}

function downloadUser(number) {
    var ref = firebase.database().ref(number+"/User");
    ref.once("value", function (sn) {
         return sn.val();
    });
}


function checkWin() {
    for (var y = 0; y < columns; y++) {
        for (var x = 0; x < rows; x++) {
            if (grid[x][y].visited == false) {
                return;
            }
        }
    }
    if (!finished) {
        for (var y = 0; y < columns; y++) {
            for (var x = 0; x < rows; x++) {
                if (grid[x][y].mine) {
                    expl++;
                }
            }
        }
        maxPunkte += expl * 3;
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
        finished = true;
    }
}

function save() {
    /* var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    var shortGrid = "";
    for (var y = 0; y < columns; y++) {
        for (var x = 0; x < rows; x++) {
            shortGrid += (grid[x][y].mine) ? 1 : 0;
        }
    }
    var hexGrid = "";
    for (var i = 0; i < shortGrid.length; i += 4) {
        var temp = shortGrid.substring(i, i + 4);
        temp = parseInt(temp, 2).toString(16).toUpperCase();
        hexGrid += temp;
    }
    console.log(hexGrid.length);
    dummy.value = hexGrid;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);

    swal("Kopiert!", "Der Code für das Level wurde in deine Zwischenablage gelegt!", "success"); */

    var number = random(0, 9);
    swal({
        icon: "success",
        title: "Gespeichert!",
        text: "Das Level wurde unter " + number + " gespeichert",
    })
    var shortGrid = "";
    for (var y = 0; y < columns; y++) {
        for (var x = 0; x < rows; x++) {
            shortGrid += (grid[x][y].mine) ? 1 : 0;
        }
    }
    /*     var ref = firebase.database().ref(number+"/Grid");
        ref.set(shortGrid);
        ref = firebase.database().ref(number+"/User/");
        ref.set([user]); */
    var ref = firebase.database().ref(number);
    ref.set({ Grid: shortGrid, User: [{Name:user,Punkte:punkte}]});
    userID = 0;
}

function load() {
    /* finished = true;
    swal({
        title: "Füge den Code für das zu ladende Level hier ein:",
        content: "input",
    })
        .then(code => {
            if (code) {
                var binGrid = "";

                for (var i = 0; i < code.length; i++) {
                    if (i == code.length - 1 && code.length < 25) {
                        var temp = code[i];
                        temp = parseInt(temp, 16).toString(2);
                        binGrid += temp;
                    } else {
                        var temp = code[i];
                        temp = parseInt(temp, 16).toString(2).padStart(4, '0');
                        binGrid += temp;
                    }
                }
                while (binGrid.length < 81 && binGrid.length >= 71) {
                    code = "0" + code;
                }
                while (binGrid.length < 256 && binGrid.length >= 246) {
                    code = "0" + code;
                }
                while (binGrid.length < 484 && binGrid.length >= 474) {
                    code = "0" + code;
                }
                reihen = Math.sqrt(binGrid.length);
                berechneScale();
                binGrid = Array.from(binGrid);
                initGrid();
                for (var y = 0; y < columns; y++) {
                    for (var x = 0; x < rows; x++) {
                        grid[x][y].mine = (binGrid[x + y * columns] == "0") ? false : true;
                    }
                }
                finished = false;
            }
        }); */
    finished = true;
    swal({
        title: "Füge den Code für das zu ladende Level hier ein:",
        content: "input",
    })
        .then(code => {
            if (code) {
                var ref = firebase.database().ref(code);
                var binGrid = "";

                ref.once("value", function (sn) {
                    binGrid = sn.val()
                    if (binGrid) {
                        reihen = Math.sqrt(binGrid.length);
                        berechneScale();
                        binGrid = Array.from(binGrid);
                        initGrid();
                        for (var y = 0; y < columns; y++) {
                            for (var x = 0; x < rows; x++) {
                                grid[x][y].mine = (binGrid[x + y * columns] == "0") ? false : true;
                            }
                        }
                        finished = false;
                    }
                });

            }

        });
}