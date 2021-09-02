//#region Build Grid
let rows = 50;
let cols = 50;
let id = 0;
let container = document.createElement("div");
container.style.display = "grid";
container.style.gridTemplateColumns = `repeat(${rows}, 10px)`;
container.style.gridTemplateRows = `repeat(${cols}, 10px)`;
document.body.appendChild(container);
document.body.style.backgroundColor = "grey"

let gridCells = [];
for(let row = 0; row < rows; row++){
    gridCells.push([]);
    
    for(let col = 0; col < cols; col++){
        let cell = document.createElement('div');
        //cell.innerText = `${col}, ${row}`;
        cell.classList.add('cell');
        cell.style.backgroundColor = "white";
        cell.style.border = "1px solid black";
        cell.style.display = "flex";
        cell.style.alignItems = "center";
        cell.style.userSelect = "none";
        cell.style.justifyContent = "center";
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.dataset.id = id;
        cell.onmouseover = buildWall;
        cell.oncontextmenu = setEnd;
        cell.onclick = setStart;
        
        gridCells[row].push(cell);
        container.appendChild(cell);

        id++;
    }
}

let sidesPerCell = new Array()

for(let row = 0; row < rows; row++){
    for(let col = 0; col < cols; col++){
        let cell = gridCells[row][col];

        sidesPerCell.push({
            "corners" : findCorners(cell),
            "sides" : findSides(cell),
        })
    }
}
//#endregion

//#region Wall 
let mouseDown = false;
let canBuild = false;
document.onmousedown = startWall;
document.onmouseup = stopWall;
window.onkeypress = sendKeyFunction;

function sendKeyFunction(e){
    e.stopPropagation();
    if (e.keyCode == 119) toggleBuild(e);
    if (e.keyCode == 114) resetCompleteGrid(e);
    console.log(e.keyCode);
}

function toggleBuild(e){
    e.stopPropagation();
    if(e.keyCode != 119 || foundEnd) return;
    canBuild = !canBuild;
}

function startWall(e){
    e.stopPropagation();
    if(!canBuild) return;

    mouseDown = true;
}

function stopWall(e){
    e.stopPropagation();
    mouseDown = false;
}

function buildWall(e){
    e.stopPropagation();
    if (!mouseDown || !canBuild) return;

    if(this.dataset.end || this.dataset.start){
        this.dataset.end = false;
        this.dataset.start = false;
    }

    this.style.backgroundColor = "black";
    this.style.color = "white";
    this.dataset.wall = true;
}
//#endregion

//#region Start and end
let startCell = null;
let endCell = null;

function setEnd(e){
    e.stopPropagation();
    e.preventDefault();
    if(canBuild || startCell == null || startCell == this) return;
    if(foundEnd) {
        let s = startCell;
        let e = new Event('click');
        resetGridExWalls();

        s.dispatchEvent(e);
    }

    if(endCell != null){
        endCell.dataset.end = false;
        endCell.style.backgroundColor = "white";
    }

    this.dataset.end = true;
    this.dataset.wall = false;
    this.style.backgroundColor = "red";
    endCell = this;
    nextCells.push(startCell);
    findNext();
    getPath()
}

function setStart(e){
    e.stopPropagation();
    e.preventDefault();
    if(canBuild) return;

    if(startCell != null){
        startCell.dataset.start = false;
        startCell.style.backgroundColor = "white";
        if(foundEnd) resetGridExWalls();
    }

    this.dataset.start = true;
    this.dataset.wall = false;
    this.dataset.far = 0;
    this.style.backgroundColor = "green";
    startCell = this;
}

//#endregion 

//#region Algorithm
let nextCells = [];
let foundEnd = false;
function findNext(){
    for(i = 0; i < nextCells.length; i ++){
        let next = nextCells[i];
        let id = parseInt(next.dataset.id);

        let sides = sidesPerCell[id]["sides"]//findSides(next);
        let corners = sidesPerCell[id]["corners"]//findCorners(next);
        
        setFarValues(next, sides, .5);
        setFarValues(next, corners, 1);
        
        i = nextCells.indexOf(next);
        if (foundEnd) return;
    }

    alert("End cannot be reached!!");
    resetGridExWalls();
}

function findSides(cell){
    sides = [];
    cellRow = parseInt(cell.dataset.row);
    cellCol = parseInt(cell.dataset.col);

    if(cellRow < rows - 1) sides.push(gridCells[cellRow + 1][cellCol]);
    if(cellRow > 0) sides.push(gridCells[cellRow - 1][cellCol]);
    
    if(cellCol < cols - 1) sides.push(gridCells[cellRow][cellCol + 1]);
    if(cellCol > 0) sides.push(gridCells[cellRow][cellCol - 1]);
    
    return sides;
}

function findCorners(cell){
    corners = [];
    cellRow = parseInt(cell.dataset.row);
    cellCol = parseInt(cell.dataset.col);
    
    if(cellCol > 0){
        if(cellRow < rows - 1) corners.push(gridCells[cellRow + 1][cellCol - 1]);
        if(cellRow > 0)  corners.push(gridCells[cellRow - 1][cellCol - 1]);
    } 
    if(cellCol < cols - 1){
        if(cellRow < rows - 1) corners.push(gridCells[cellRow + 1][cellCol + 1]);
        if(cellRow > 0) corners.push(gridCells[cellRow - 1][cellCol + 1]);
    }

    return corners;
}

let delay = 0;
function setFarValues(cell, sides, val){
    for(i = 0; i < sides.length; i++){
        side = sides[i];
        if(side.dataset.found == "true" || side.dataset.wall == "true" || side == startCell) continue;
        if(side == endCell) foundEnd = true;

        side.dataset.found = true;
        side.dataset.far = parseFloat(cell.dataset.far) + val;
        
        //if (delay < 10) delay++;
        animateCells(side, delay, "blue");
        
        //side.innerText = side.dataset.far
        nextCells.push(side)  
    }
}

function animateCells(cell, delay, color){
    setTimeout(() => {
        if(cell == endCell) {
            //getPath();
            return;
        }
        //cell.style.delay = ".5s"
        cell.style.backgroundColor = color;
    }, delay)
}

let nextPathCells = [];
function getPath(){
    nextPathCells.push(endCell);
    //delay = 150;

    for(i = 0; i < nextPathCells.length; i++){
        let cell = nextPathCells[i];
        let id = parseInt(cell.dataset.id);
        let sides = sidesPerCell[id]["sides"].concat(sidesPerCell[id]["corners"])//findSides(cell).concat(findCorners(cell));
        let closest = findClosest(sides);

        if(closest == startCell) return;
        nextPathCells.push(closest);
        //if (delay < 150) delay++;
        animateCells(closest, delay, "yellow");
        i = nextPathCells.indexOf(cell);
    }
}

function findClosest(sides){
    closest = null;
    for(i = 0; i < sides.length; i++){
        side = sides[i];
        if(side == startCell) return side;
        if(side.dataset.found != "true" || side.dataset.pathCheck == "true") continue;
        
        side.dataset.pathCheck = true;
        if(closest == null){
            closest = side;
            continue;
        }
        
        closest = (parseFloat(closest.dataset.far) < parseFloat(side.dataset.far)) ? closest : side;
    }

    closest.dataset.pathCheck = false;
    return closest;
}
//#endregion 

//#region Reset
function resetGridExWalls(){
    nextPathCells = [];
    foundEnd = false;
    startCell = null;
    endCell = null;

    for(const i in nextCells){
        let cell = nextCells[i];

        cell.dataset.found = false;
        cell.dataset.far = 0;
        cell.dataset.pathCheck = false;
        if(cell.dataset.wall != "true")cell.style.backgroundColor = "white";
    }

    nextCells = [];
}

function resetCompleteGrid(e){
    e.stopPropagation()
    resetGridExWalls();
    let walls = document.querySelectorAll("[data-wall = 'true']");
    if(walls.length == 0) return;
    for(const i in walls){
        let wall = walls[i];
        
        if(wall.dataset == undefined) return
        wall.dataset.wall = false;  
        wall.dataset.found = false;
        wall.dataset.far = 0;
        wall.dataset.pathCheck = false;
        wall.style.backgroundColor = "white";
    }
}
//#endregion

//#region A*

let openCells = new Array();
let closedCells = new Array();
function A_Star(){

    openCells.push(startCell);
    startCell.dataset.gCost = 0;
    startCell.dataset.hCost = calculateHCost(startCell);
    startCell.dataset.fCost = calculateFCost(startCell);

    while (true){
        let current = smallestFCost()

        openCells.splice(openCells.indexOf(current), 1);
        closedCells.push(current);

        if(current == endCell) {
            A_StarPath()
            return;
        }

        animateCells(current, 0, "blue")

        let sides = findSides(current);
        let corners = findCorners(current);
        let neighbor = sides//.concat(corners)

        let corner = false;
        for (const i in neighbor){
            let side = neighbor[i];
            if(closedCells.includes(side) || side.dataset.wall == "true") continue;
            if(i >= sides.length) corner = true;

            let gCost = calculateGCost(side, corner);
            let hCost = calculateHCost(side, corner);
            let fCost = hCost + gCost;

            if (openCells.includes(side) && parseInt(side.dataset.fCost) < fCost) continue;

            side.dataset.gCost = gCost;
            side.dataset.hCost = hCost;
            side.dataset.fCost = fCost;

            side.dataset.parentRow = current.dataset.row;
            side.dataset.parentCol = current.dataset.col;

            if (!openCells.includes(side)) openCells.push(side);
        }
    }
}

function calculateGCost(cell, corner){
    let dx = Math.abs(parseInt(cell.dataset.row) - parseInt(startCell.dataset.row));
    let dy = Math.abs(parseInt(cell.dataset.col) - parseInt(startCell.dataset.col));

    if (corner) return 10 * (dx + dy) + (14 - 2 * 10) * Math.min(dx, dy);
    else return 10 * (dx + dy);
}

function calculateHCost(cell, corner){
    let dx = Math.abs(parseInt(cell.dataset.row) - parseInt(endCell.dataset.row));
    let dy = Math.abs(parseInt(cell.dataset.col) - parseInt(endCell.dataset.col));

    if (corner) return 10 * (dx + dy) + (14 - 2 * 10) * Math.min(dx, dy);
    else return 10 * (dx + dy);
}

function calculateFCost(cell){
    return parseInt(cell.dataset.gCost) + parseInt(cell.dataset.hCost);
}

function smallestFCost(){
    let small = null;

    for(let i = 0; i < openCells.length; i++){
        let current = openCells[i];

        if (small == null){
            small = current;
            continue;
        }

        let smallF = parseInt(small.dataset.fCost);
        let currentF = parseInt(current.dataset.fCost);
        small = (currentF < smallF) ? current : small;

        if (smallF == currentF) small = (parseInt(small.dataset.hCost) < parseInt(current.dataset.hCost)) ? small : current;
    }

    return small;
}

let path = new Array();
function A_StarPath(){
    path.push(endCell);

    for(let i = 0; i < path.length; i++){
        let current = path[i];
        let parent = gridCells[parseInt(current.dataset.parentRow)][parseInt(current.dataset.parentCol)];

        path.push(parent);
        animateCells(current, 0, "yellow");
    }
}

//#endregion 