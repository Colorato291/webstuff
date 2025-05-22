const canvas = document.getElementById('background');
const context = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawBackground() {
    context.fillStyle = "#111111";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

let streaks = [];
const streakCount = 20;

function randBool() {
    return Math.random() >= 0.5;
}

function drawStreak(streak) {
    const endX = streak.x + 0.5 * streak.length
    const endY = streak.y + 0.5 * streak.length
    context.beginPath();
    context.moveTo(streak.x, streak.y)
    context.lineTo(endX, endY);
    context.strokeStyle = '#ffffff';
    context.lineWidth = 1.5;
    context.stroke();
}

function createStreak(begining) {
    const startX = randBool();
    const length = 100;
    if (begining) {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
    }
    else if (startX) {
        x = Math.random() * canvas.width;
        y = -length;
    } else {
        x = -length;
        y = Math.random() * canvas.height;
    }
    return {x, y, length};
}

function updateStreak(streak) {
    streak.x++;
    streak.y++;
    return streak.x < canvas.width+10 && streak.y < canvas.height+10;
}

function animate() {
    drawBackground();
    streaks = streaks.filter(streak => {
        if (updateStreak(streak)) {
            drawStreak(streak);
            return true;
        }
        return false;
    });

    while (streaks.length < streakCount) {
        streaks.push(createStreak());
    }
    requestAnimationFrame(animate);
}

function initialStreaks() {
    for(let i = 0; i < streakCount; i++) {
        streaks.push(createStreak(true));
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
initialStreaks();
animate();