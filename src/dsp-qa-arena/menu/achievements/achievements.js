document.addEventListener('DOMContentLoaded', () => {
    // Example achievements
    const mockAchievements = [
        { id: '1', name: 'First Victory', description: 'Win your first trivia match.', unlocked: true },
        { id: '2', name: 'Hot Streak', description: 'Win 3 matches in a row.', unlocked: true, progress: 3, total: 3 },
        { id: '3', name: 'Knowledge Seeker', description: 'Answer 50 questions correctly.', unlocked: false, progress: 27, total: 50 },
        { id: '4', name: 'Power User', description: 'Use each power-up at least once.', unlocked: true },
        { id: '5', name: 'Perfect Score', description: 'Get all questions right in a match.', unlocked: false },
        { id: '6', name: 'Rank Climber', description: 'Reach Rank 5 on the leaderboard.', unlocked: false, progress: 2, total: 5 },
        { id: '7', name: 'Speed Demon', description: 'Answer a question in under 5 seconds.', unlocked: true },
        { id: '8', name: 'Centurion', description: 'Answer 100 questions correctly.', unlocked: false, progress: 27, total: 100 },
    ];
    
    // Get the container where achievement cards will be displayed
    const achievementsGrid = document.getElementById('achievements-grid');
    
    // Create and append achievement cards
    mockAchievements.forEach(achievement => {
        const card = createAchievementCard(achievement);
        achievementsGrid.appendChild(card);
    });
    
    // Add animation to the cards
    const cards = document.querySelectorAll('.achievement-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

function createAchievementCard(achievement) {
    // Create a card element
    const card = document.createElement('div');
    card.className = `achievement-card ${achievement.unlocked ? 'achievement-unlocked' : 'achievement-locked'}`;
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    // Get an icon based on the achievement ID
    const icons = ['🏆', '🔥', '📚', '⚡', '✨', '🌟', '⏱️', '💯'];
    const iconIndex = (parseInt(achievement.id) - 1);
    
    // Create the HTML structure for the card
    card.innerHTML = `
        <div class="achievement-glow"></div>
        <div class="achievement-header">
            <div class="achievement-icon">${icons[iconIndex]}</div>
            <h3 class="achievement-title">${achievement.name}</h3>
        </div>
        <p class="achievement-description">${achievement.description}</p>
        ${achievement.progress !== undefined && achievement.total !== undefined ? `
            <div class="achievement-progress-container">
                <div class="achievement-progress-bar" style="width: ${(achievement.progress / achievement.total) * 100}%"></div>
            </div>
            <span class="achievement-progress-text">${achievement.progress}/${achievement.total}</span>
        ` : ''}
        <span class="achievement-status">${achievement.unlocked ? 'Unlocked' : 'Locked'}</span>
        ${achievement.unlocked && achievement.unlockDate ? `
            <span class="achievement-date">Achieved: ${new Date(achievement.unlockDate).toLocaleDateString()}</span>
        ` : ''}
    `;
    
    // Add hover effect to the cards
    card.addEventListener('mouseenter', () => {
        if (achievement.unlocked) {
            const glow = card.querySelector('.achievement-glow');
            glow.style.transform = 'scale(1.5)';
            glow.style.opacity = '0.8';
        }
    });
    
    card.addEventListener('mouseleave', () => {
        if (achievement.unlocked) {
            const glow = card.querySelector('.achievement-glow');
            glow.style.transform = 'scale(1)';
            glow.style.opacity = '1';
        }
    });
    
    return card;
}