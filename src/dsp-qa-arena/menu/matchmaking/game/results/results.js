// Load results from localStorage
document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the game results from localStorage
    const results = JSON.parse(localStorage.getItem('gameResults')) || {
        userScore: 0,
        opponentScore: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        gameStatus: 'tie',
        powerupsUsed: { doubleTime: false, fiftyFifty: false, doublePoints: false }
    };

    // Update the UI with the results
    document.querySelector('#user-score span').textContent = results.userScore || 0;
    document.querySelector('#opponent-score span').textContent = results.opponentScore || 0;
    document.querySelector('#questions-correct span').textContent = `${results.correctAnswers || 0} out of ${results.totalQuestions || 0}`;
    
    // Display game status with appropriate message and styling
    const gameStatusElem = document.getElementById('game-status');
    if (results.gameStatus === 'win') {
        gameStatusElem.textContent = 'You won!';
        gameStatusElem.classList.add('win');
    } else if (results.gameStatus === 'lose') {
        gameStatusElem.textContent = 'You lost!';
        gameStatusElem.classList.add('lose');
    } else {
        gameStatusElem.textContent = 'You tied!';
        gameStatusElem.classList.add('tie');
    }
    
    // Update powerups used
    if (results.powerupsUsed) {
        document.querySelector('#powerup-doubletime span').textContent = results.powerupsUsed.doubleTime ? 'Yes' : 'No';
        document.querySelector('#powerup-fiftyfifty span').textContent = results.powerupsUsed.fiftyFifty ? 'Yes' : 'No';
        document.querySelector('#powerup-doublepoints span').textContent = results.powerupsUsed.doublePoints ? 'Yes' : 'No';
    }
    
    // Optional: Calculate and display accuracy percentage if there were questions answered
    if (results.totalQuestions > 0) {
        const accuracy = (results.correctAnswers / results.totalQuestions) * 100;
        const accuracyElement = document.createElement('p');
        accuracyElement.id = 'accuracy';
        accuracyElement.innerHTML = `Accuracy: <span>${accuracy.toFixed(1)}%</span>`;
        document.getElementById('questions-correct').after(accuracyElement);
    }
});