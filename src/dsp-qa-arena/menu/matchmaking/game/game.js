let questions = [];
let currentQuestionIndex = -1;
let userScore = 0;
let opponentScore = 0;
let correctAnswers = 0;
let totalQuestions = 0;
let timeLeft = 20;
let timerInterval;
let powerupsUsed = { doubleTime: false, fiftyFifty: false, doublePoints: false };
let shuffledIndices = [];
let isDoubleTimeActive = false;
let isDoublePointsActive = false;
const answerOptions = ['a', 'b', 'c', 'd'];

// Load questions from JSON file
fetch('./questions.json')
    .then(response => response.json())
    // Shuffle the questions
    .then(data => {
        questions = data;
        shuffledIndices = Array.from({ length: questions.length }, (_, i) => i).sort(() => Math.random() - 0.5);
        nextQuestion();
    })
    .catch(error => console.error('Error loading questions:', error));

// Start the timer for the question
function startTimer() {
    timeLeft = 20; // Reset time left
    // Create time bar
    const timeBarFill = document.getElementById('time-bar-fill');
    const timeDisplay = document.getElementById('time');
    timeBarFill.style.width = '100%';
    timeDisplay.textContent = Math.ceil(timeLeft);
    // Update the timer and bar every 100ms
    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        timeDisplay.textContent = Math.ceil(timeLeft);
        timeBarFill.style.width = `${(timeLeft / 20) * 100}%`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showFeedback(false, questions[shuffledIndices[currentQuestionIndex]].correctAnswerIndex, null);
        }
    }, 100);
}

function saveResultsAndRedirect() {
    // Calculate game result (win/lose/tie)
    let gameStatus = 'tie';
    if (userScore > opponentScore) {
        gameStatus = 'win';
    } else if (userScore < opponentScore) {
        gameStatus = 'lose';
    }
    
    // Save detailed results to localStorage
    localStorage.setItem('gameResults', JSON.stringify({
        userScore,
        opponentScore,
        correctAnswers,
        totalQuestions,
        gameStatus,
        powerupsUsed,
        timestamp: new Date().toISOString()
    }));
    
    // Redirect to results page
    window.location.href = './results';
}

// Function to handle the next question
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
        saveResultsAndRedirect();
        return;
    }
    // Reset powerup states for the new question
    isDoubleTimeActive = false;
    isDoublePointsActive = false; // Reset double points for new question
    const question = questions[shuffledIndices[currentQuestionIndex]];
    document.getElementById('question-text').textContent = question.text;
    document.getElementById('feedback-container').style.display = 'none';
    document.getElementById('question-container').style.display = 'flex';
    document.getElementById('question-container').classList.remove('feedback');
    document.getElementById('question').style.display = 'block';
    document.getElementById('powerups-container').classList.remove('feedback');

    // Update buttons with question options
    answerOptions.forEach((letter, index) => {
        const button = document.getElementById(`answer-${letter}`);
        button.textContent = question.options[index].text;
        button.setAttribute('data-index', index);
        button.classList.remove('correct', 'incorrect');
        button.disabled = false;
        button.style.display = 'block';
        button.style.visibility = 'visible';
        
        // Remove existing listeners by cloning the button
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add new click listener
        newButton.addEventListener('click', () => {
            const isCorrect = index === questions[shuffledIndices[currentQuestionIndex]].correctAnswerIndex;
            document.querySelectorAll('.answer-button').forEach(btn => {
                btn.disabled = true;
            });
            showFeedback(isCorrect, questions[shuffledIndices[currentQuestionIndex]].correctAnswerIndex, index);
        });
    });

    // Re-enable powerup buttons if not used
    const powerupKeys = ['doubleTime', 'fiftyFifty', 'doublePoints'];
    powerupKeys.forEach((key, i) => {
        const button = document.getElementById(`power-up-${i + 1}`);
        button.disabled = powerupsUsed[key];
    });

    startTimer();
}

function showFeedback(isCorrect, correctAnswerIndex, selectedIndex) {
    clearInterval(timerInterval); // Stop the timer
    const question = questions[shuffledIndices[currentQuestionIndex]]; // Check if the answer was correct
    const points = isCorrect ? (isDoubleTimeActive ? 100 : Math.max(50, 100 - Math.floor((20 - timeLeft) * 2.5))) : 0; // Calculate points based on the answer and time left
    userScore += isDoublePointsActive ? points * 2 : points; // Use isDoublePointsActive instead of powerupsUsed.doublePoints
    opponentScore += Math.floor(Math.random() * (100 - 50 + 1)) + 50;
    totalQuestions++; // Update total questions answered
    // Update correct answers count
    if (isCorrect) correctAnswers++;

    // Update the UI with scores and feedback
    document.getElementById('user-score').textContent = userScore;
    document.getElementById('opponent-score').textContent = opponentScore;
    document.getElementById('question').style.display = 'none';
    document.getElementById('feedback-container').style.display = 'block';
    document.getElementById('question-container').classList.add('feedback');
    document.getElementById('powerups-container').classList.add('feedback');
    document.getElementById('feedback-correct').textContent = isCorrect
        ? `Correct! You earned ${points} points.`
        : `Incorrect. The correct answer was: ${question.options[correctAnswerIndex].text}`;
    document.getElementById('feedback-explanation').textContent = question.explanation;

    // Show feedback for the selected answer
    ['a', 'b', 'c', 'd'].forEach((letter, index) => {
        const button = document.getElementById(`answer-${letter}`);
        button.classList.remove('correct', 'incorrect');
        if (index === correctAnswerIndex) {
            button.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            button.classList.add('incorrect');
        }
        button.style.display = 'block';
        button.style.visibility = 'visible';
        button.disabled = true;
    });

    // Disable powerup buttons during feedback
    ['1', '2', '3'].forEach(num => {
        const button = document.getElementById(`power-up-${num}`);
        button.disabled = true;
    });

    setTimeout(nextQuestion, 3000);
}

// Handle power-up button clicks
document.getElementById('power-up-1').addEventListener('click', () => {
    if (!powerupsUsed.doubleTime) {
        powerupsUsed.doubleTime = true;
        isDoubleTimeActive = true;
        timeLeft += 20; // Add 20 seconds
        document.getElementById('time').textContent = Math.ceil(timeLeft);
        document.getElementById('power-up-1').disabled = true;
    }
});

document.getElementById('power-up-2').addEventListener('click', () => {
    if (!powerupsUsed.fiftyFifty) {
        powerupsUsed.fiftyFifty = true;
        const question = questions[shuffledIndices[currentQuestionIndex]];
        let incorrectIndices = [0, 1, 2, 3].filter(i => i !== question.correctAnswerIndex);
        incorrectIndices = incorrectIndices.sort(() => Math.random() - 0.5).slice(0, 2);
        ['a', 'b', 'c', 'd'].forEach((letter, index) => {
            if (incorrectIndices.includes(index)) {
                document.getElementById(`answer-${letter}`).style.display = 'none';
            }
        });
        document.getElementById('power-up-2').disabled = true;
    }
});

document.getElementById('power-up-3').addEventListener('click', () => {
    if (!powerupsUsed.doublePoints) {
        powerupsUsed.doublePoints = true;
        isDoublePointsActive = true; // Activate double points for current question
        document.getElementById('power-up-3').disabled = true;
    }
});