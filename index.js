const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const cellsHorizontal = 3; //15
const cellsVertical = 3; //10
const width = window.innerWidth;
const height = window.innerHeight;

const outerWallWidth = 5;
const innerWallWidth = 3;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
const {world} = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);
engine.world.gravity.y = 0;

//walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, outerWallWidth, {
        isStatic: true
    }),
    Bodies.rectangle(width / 2, height, width, outerWallWidth, {
        isStatic: true
    }),
    Bodies.rectangle(0, height / 2, outerWallWidth, height, {
        isStatic: true
    }),
    Bodies.rectangle(width, height / 2, outerWallWidth, height, {
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

const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

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

        if(nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
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
                columnIndex * unitLengthX + unitLengthX / 2,
                rowIndex * unitLengthY + unitLengthY,
                unitLengthX,
                innerWallWidth,
                {
                    label: 'innerWall',
                    isStatic: true,
                    render: {
                        fillStyle: 'blue'
                    }
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
                columnIndex * unitLengthX + unitLengthX,
                rowIndex * unitLengthY + unitLengthY / 2,
                innerWallWidth,
                unitLengthY,
                {
                    label: 'innerWall',
                    isStatic: true,
                    render: {
                        fillStyle: 'blue'
                    }
                }
            );
            World.add(world, wall);
        } else return;
    })
});

const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX / 3, 
    unitLengthY / 3, 
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'green'
        }
    }
);
World.add(world, goal);

const playerRadius = Math.min(unitLengthX, unitLengthY) / 4;
const player = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    playerRadius,
    {
        label: 'player',
        render: {
            fillStyle: '#f5d259'
        }
    }
);
World.add(world, player);

document.addEventListener('keydown', function(event) {
    const {x, y} = player.velocity;

    switch(event.keyCode){
        case(87):
            Body.setVelocity(player, {x, y: y - 5});
            break;
        case(83):
            Body.setVelocity(player, {x, y: y + 5});
            break;
        case(65):
            Body.setVelocity(player, {x: x - 5, y});
            break;
        case(68):
            Body.setVelocity(player, {x: x + 5, y});
            break;
    }
})

//win condition

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['player', 'goal'];
        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
            document.querySelector('.winner').classList.remove('hidden');
            document.querySelector('.winner-background').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if(body.label === 'innerWall') {
                    Body.setStatic(body, false);
                }
            })
            setTimeout(() => world.gravity.y = 0, 100)
        }
    }
)})

const playAgainButton = document.querySelector('.winner button');
playAgainButton.addEventListener('click', () => location.reload(true));