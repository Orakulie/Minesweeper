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

var user;
var userID;
var online = -1;

var startTime;
var time;

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
    }
}

function mouseClick(event) {
    var mX = mousePos(event).x;
    var mY = mousePos(event).y;
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
    time = new Date().getTime() / 1000 - startTime;
    user = "Player";
    if (online == -1) {
        document.getElementById("punkte").innerHTML = user + ": " + punkte +
            " || " + Math.floor(time) + "s";
    } else {
        uploadPoints();
    }
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

function uploadPoints() {
    var ref = firebase.database().ref(online + "/User/" + userID + "/Punkte");
    ref.set(punkte);
    var ref = firebase.database().ref(online + "/User/" + userID + "/Zeit");
    ref.set(Math.floor(time));
    for (var y = 0; y < columns; y++) {
        for (var x = 0; x < rows; x++) {
            if (grid[x][y].visited == false) {
                return;
            }
        }
    }
    var ref = firebase.database().ref(online + "/User/" + userID + "/Fertig");
    ref.set(1);
}

function addUser() {
    var ref = firebase.database().ref(online + "/User");
    ref.once("value", function (sn) {
        if (sn.val()) {
            var users = sn.val();
            if (!user) {
                user = "Player " + users.length;
            }
            userID = users.length;
            users.push({ Name: user, Punkte: punkte });
            ref.set(users);
        }
    });
}

function rangliste(u) {
    document.getElementById("punkte").innerHTML = "";
    u.sort(function (a, b) { return b.Punkte - a.Punkte });
    for (var k in u) {
        document.getElementById("punkte").innerHTML += u[k].Name + ": " + u[k].Punkte + " || ";
        if (u[k].Zeit) {
            document.getElementById("punkte").innerHTML += u[k].Zeit + "s";
        } else {
            document.getElementById("punkte").innerHTML += "0s" + "<br>";
        }
        if(u[k].Fertig)
        {
            document.getElementById("punkte").innerHTML += " ✅<br>";
        } else {
            document.getElementById("punkte").innerHTML += "<br>";
        }
    }
}

function downloadUser() {
    var ref = firebase.database().ref(online + "/User");
    ref.on("value", function (sn) {
        rangliste(sn.val());
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
        if (online == -1) {
            swal({

                title: "Du hast " + punkte + " Punkte von möglichen " + maxPunkte + " Punkten.",
                text: "Möchtest du das Level mit deinen Freunden teilen?",
                icon: "success",

                buttons: {
                    save: "Ja",
                    cancel: "Nein",
                },

            })
                .then((value) => {

                    if (value) {
                        save();
                    }
                });
            document.getElementById("punkte").innerHTML = user + ": " + punkte +
                " || " + Math.floor(time) + "s ✅";
            finished = true;
        } else {
            swal({
                title: "Nicht schlecht!",
                text: "Du hast " + punkte + " Punkten von möglichen " + maxPunkte + " Punkten erreicht!",
                icon: "success",
            });
            finished = true;
        }
    }
}

function save() {
    finished = true;
    if (user == "Player") {
        swal({
            title: "Name",
            text: "Wie möchtest du heißen?",
            content: "input",
        })
            .then(gname => {

                if (gname) {
                    user = gname;
                } else {
                    user = "Player 0";
                }
                executeSave();

            });
    } else {
        executeSave();
    }
}

function executeSave() {
    var ref = firebase.database().ref("/Aktuell");
    ref.once("value", function (sn) {
        number = sn.val();
        if (number > 9) {
            var ref = firebase.database().ref("/Aktuell");
            ref.set(0);
            number = 0;
        }
        swal({
            icon: "success",
            title: "Gespeichert!",
            text: "Das Level wurde unter " + number + " gespeichert",
        })
            .then(v => {
                finished = false;
            });
        document.title = number;
        var shortGrid = "";
        for (var y = 0; y < columns; y++) {
            for (var x = 0; x < rows; x++) {
                shortGrid += (grid[x][y].mine) ? 1 : 0;
            }
        }
        var ref = firebase.database().ref(number);
        ref.set({ Grid: shortGrid, User: [{ Name: user, Punkte: punkte }] });
        var ref = firebase.database().ref("/Aktuell");
        ref.set(number + 1);
        online = number;
        downloadUser();
        userID = 0;
    });
}

function load() {
    finished = true;
    swal({
        title: "Füge den Code für das zu ladende Level hier ein:",
        content: "input",
    })
        .then(code => {
            if (code && !user) {

                swal({
                    title: "Name",
                    text: "Wie möchtest du heißen?",
                    content: "input",
                })
                    .then(gname => {

                        if (gname != "") {
                            user = gname;
                        } executeLoad(code);

                    });
            } else if (code && user) {
                executeLoad(code);
            }


        });
}


function executeLoad(code) {
    var ref = firebase.database().ref(code + "/Grid");
    var binGrid = "";
    document.title = code;
    ref.once("value", function (sn) {
        binGrid = sn.val();
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
            online = code;
            addUser();
            downloadUser();
        }
    });
}