const canvas = document.getElementById('thePage');
const ctx = canvas.getContext('2d');

let radius = 5;
let spacing = 3;
let widthCount = Math.floor(window.innerWidth/(2*radius+spacing));
let heightCount = Math.floor(window.innerHeight/(2*radius+spacing));
let grid = new Uint8Array(widthCount * heightCount);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    widthCount = Math.floor(window.innerWidth/(2*radius+spacing));
    heightCount = Math.floor(window.innerHeight/(2*radius+spacing));
    // TODO: RESIZE GRID LOGIC SO NO DOT IS LOST
    grid = new Uint8Array(widthCount * heightCount);
    drawDots();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function setDot(x, y, status){
    grid[x + widthCount * y] = status ? 1 : 0;
}

function drawDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.forEach((value, index) => {
        const x = index % widthCount;
        const y = Math.floor(index / widthCount);
        ctx.beginPath();
        ctx.fillStyle = value === 1 ? "#ffffff":"#333333";
        ctx.arc(spacing + radius + x * (radius * 2 + spacing),
                spacing + radius + y * (radius * 2 + spacing),
                radius, 0, 2 * Math.PI);
        ctx.fill();
    })
}

const randomIntArrayInRange = (min, max, n = 1) =>
    Array.from(
      { length: n },
      () => Math.floor(Math.random() * (max - min + 1)) + min
    );
  
const getRandomInteger = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
      
    return Math.floor(Math.random() * (max - min)) + min
}
let enabledPixels = []

async function randomDotDraw() {
    while(true) {
        if (enabledPixels.length > 200) {
            const removedPixel = enabledPixels.shift();
            grid[removedPixel] = 0;
        }
        enabledPixels.push(getRandomInteger(0, widthCount * heightCount));
        enabledPixels.forEach((value) => {
            grid[value] = 1;
        });
        drawDots();
        await new Promise(resolve => setTimeout(resolve, 16.67));
    }
}

randomDotDraw();