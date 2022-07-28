const {Engine, Render, Runner, World, Bodies} = Matter;

const cells = 15;
const width = 600;
const height = 600

const wallWidth = 1;
const unitLength = width / cells;

const engine = Engine.create();
const {world} = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: true,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

//walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, wallWidth, {
        isStatic: true
    }),
    Bodies.rectangle(width / 2, height, width, wallWidth, {
        isStatic: true
    }),
    Bodies.rectangle(0, height / 2, wallWidth, height, {
        isStatic: true
    }),
    Bodies.rectangle(width, height / 2, wallWidth, height, {
        isStatic: true
    })
]
World.add(world, walls);

//maze generation

const shuffle = (arr) => {
    let counter = arr.length;

    while(counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
}

const grid = Array(cells)
    .fill(null)
    .map(() => Array(cells).fill(false));

const verticals = Array(cells)
    .fill(null)
    .map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
    .fill(null)
    .map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) => {
    if(grid[row][column]) return;

    grid[row][column] = true;

    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    for(let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;

        if(nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
            continue;
        }

        if(grid[nextRow][nextColumn]) {
            continue;
        }

        if(direction === 'left') {
            verticals[row][column - 1] = true;
        } else if(direction === 'right') {
            verticals[row][column] = true;
        } else if(direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if(direction === 'down') {
            horizontals[row][column] = true;
        }

        stepThroughCell(nextRow, nextColumn);
    }
}

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(!open) {
            const wall = Bodies.rectangle(
                columnIndex * unitLength + unitLength / 2,
                rowIndex * unitLength + unitLength,
                unitLength,
                1,
                {
                    isStatic: true
                }
            );
            World.add(world, wall);
        } else return;
    })
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(!open) {
            const wall = Bodies.rectangle(
                columnIndex * unitLength + unitLength,
                rowIndex * unitLength + unitLength / 2,
                1,
                unitLength,
                {
                    isStatic: true
                }
            );
            World.add(world, wall);
        } else return;
    })
});

const goal = Bodies.rectangle(
    width - unitLength / 2,
    height - unitLength / 2,
    unitLength / 3, 
    unitLength / 3, 
    {
        isStatic: true
    }
);
World.add(world, goal);

const player = Bodies.circle(
    unitLength / 2,
    unitLength / 2,
    unitLength* .3,
    {
        isStatic: true
    }
);
World.add(world, player);

document.addEventListener('keydown', function(event) {
    switch(event.keyCode){
        case(87):
            console.log('w wciśnięte')
            break;
        case(83):
            console.log('s wciśnięte')
            break;
        case(65):
            console.log('a wciśnięte')
            break;
        case(68):
            console.log('d wciśnięte')
            break;
    }
})