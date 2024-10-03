const canvas = document.getElementById('thePage');
const ctx = canvas.getContext('2d');

let radius = 2;
let spacing = 1;
let widthCount = Math.floor(window.innerWidth/(2*radius+spacing));
let heightCount = Math.floor(window.innerHeight/(2*radius+spacing));
let updatedDots = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    widthCount = Math.floor(window.innerWidth/(2*radius+spacing));
    heightCount = Math.floor(window.innerHeight/(2*radius+spacing));
    // TODO: RESIZE GRID LOGIC SO NO DOT IS LOST
    createEmptyGrid();
    writeString(0,0, "Dots page made by CoolCat");
    writeString(0,20, "More functionality will come later");
    writeString(0,40, "Font based on ndot-55");
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createEmptyGrid(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let row = 0; row<heightCount; row++){
        for(let col = 0; col<widthCount; col++){
            ctx.beginPath();
            ctx.fillStyle = "#222222";
            ctx.arc(spacing + radius + col * (radius * 2 + spacing),
                    spacing + radius + row * (radius * 2 + spacing),
                    radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

function updateDot(num) {
    updatedDots.push(num);
}

function isDotOn(x, y) {
    const pixelData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b] = pixelData.data;
    return r === 255 && g === 255 && b === 255;
}

function updateCanvas() {
    updatedDots.forEach((dot) => {
        const x = dot % widthCount;
        const y = Math.floor(dot / widthCount);
        const isOn = isDotOn(spacing + radius + x * (radius * 2 + spacing),
                             spacing + radius + y * (radius * 2 + spacing))
        ctx.clearRect(x * (radius * 2 + spacing),
                      y * (radius * 2 + spacing),
                      2*spacing+2*radius, 2*spacing+2*radius);

        ctx.beginPath();
        ctx.fillStyle = isOn === false ? "#ffffff":"#222222";
        ctx.arc(spacing + radius + x * (radius * 2 + spacing),
                 spacing + radius + y * (radius * 2 + spacing),
                 radius, 0, 2 * Math.PI);
        ctx.fill();
    })
    updatedDots = [];
}

async function fetchAlphabet() {
    try {
        const response = await fetch('/dots/letter.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function writeLetter(x, y, letter) {
    const alphabet = await fetchAlphabet();
    alphabet[letter].forEach((row, rowIndex) => {
        row.forEach((column, columnIndex) => {
            const isOn = isDotOn(spacing + radius + (x+columnIndex) * (radius * 2 + spacing),
                                 spacing + radius + (y+rowIndex) * (radius * 2 + spacing))
            if (column != isOn) updateDot((y + rowIndex) * widthCount + (x + columnIndex));
        });
    });
    updateCanvas();
}

async function writeString(startX, startY, string) {
    let letterWidth = 5;  // Width of each letter
    const letterHeight = 6; // Height of each letter
    const letterSpacing = 1; // Gap between letters
    const lineSpacing = 1; // Gap between lines
    let x = startX;
    let y = startY;
    const alphabet = await fetchAlphabet();
    for (let i = 0; i < string.length; i++) {
        letterWidth=alphabet[string[i]][0].length;
        // Check if the next letter will exceed the canvas width
        if (x + letterWidth > widthCount) {
            // Move to the next line
            x = startX;
            y += letterHeight + lineSpacing;
        }
        // Write the letter
        writeLetter(x, y, string[i]);
        // Move to the next letter position
        x += letterWidth + letterSpacing;
    }
}