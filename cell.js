class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.mine = false;
        this.mineCounter = 0;
        this.visited = false;
        this.cellC = "white";
    }

    show(c) {
        var x = this.x * scale;
        var y = this.y * scale;


        ctx.fillStyle = c;
        ctx.fillRect(x + 2+2, y + 2+2, scale - 4, scale - 4)

    }

    istMine() {
        this.mine = true;
    }

    click() {
        var x = this.x * scale;
        var y = this.y * scale;


        if (firstClick == true) {
            this.mine = false;
            firstClick = false;
        }

        if (this.mine) {
            this.visited = true;
            this.show(this.cellC);
            drawCircle(x, y, "red");
            Punkte(-5);
        } else if (this.visited == false) {
            this.visited = true;
            this.show(this.cellC);

            var n = this.nachbar();
            for (var i = 0; i < Object.keys(n).length; i++) {
                if (n[Object.keys(n)[i]].mine) {
                    this.mineCounter++;
                }
            }
            drawText(x,y);
            Punkte(this.mineCounter);

            if (this.mineCounter == 0) {
                for (var i = 0; i < Object.keys(n).length; i++) {
                    n[Object.keys(n)[i]].click();
                }

            }
        }

        checkWin();
    }

    clickR() {
        var x = this.x * scale;
        var y = this.y * scale;
        if (this.visited == false) {
            if (this.mine) {
                this.visited = true;
                this.show(this.cellC);
                drawCircle(x, y, "green");
                Punkte(3);
            } else {
                this.click();
                this.show("yellow");
                drawText(x,y);
                Punkte(-5);
            }
        }
        
        checkWin();

    }

    nachbar() {
        var nachbar = {};

        //OBEN
        if (grid[this.x][this.y - 1]) {
            nachbar.oben = grid[this.x][this.y - 1];
            //ObenR
            if (grid[this.x + 1]) {
                nachbar.obenR = grid[this.x + 1][this.y - 1]
            }
            //ObenL
            if (grid[this.x - 1]) {
                nachbar.obenL = grid[this.x - 1][this.y - 1]
            }
        }

        //UNTEN
        if (grid[this.x][this.y + 1]) {
            nachbar.unten = grid[this.x][this.y + 1];
            //UntenR
            if (grid[this.x + 1]) {
                nachbar.untenR = grid[this.x + 1][this.y + 1]
            }
            //UntenL
            if (grid[this.x - 1]) {
                nachbar.untenL = grid[this.x - 1][this.y + 1]
            }
        }

        if (grid[this.x - 1]) {
            nachbar.links = grid[this.x - 1][this.y];
        }

        if (grid[this.x + 1]) {
            nachbar.rechts = grid[this.x + 1][this.y];
        }
        return nachbar;
    }

}


