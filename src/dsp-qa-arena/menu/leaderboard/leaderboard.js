document.addEventListener('DOMContentLoaded', () => {
    // Test leaderboard data
    const mockLeaderboard = [
        { id: '1', username: 'RupertJones', points: 9850, trend: 'up', previousRank: 2 },
        { id: '2', username: 'Larry', points: 9720, trend: 'up', previousRank: 3 },
        { id: '3', username: 'Mr.Bonjour', points: 9650, trend: 'down', previousRank: 1 },
        { id: '4', username: 'TheBishop', points: 8900, trend: 'equal', previousRank: 4 },
        { id: '5', username: "PlennyO'Money", points: 8750, trend: 'down', previousRank: 3 },
        { id: '6', username: 'Bene', points: 8500, trend: 'up', previousRank: 8 },
        { id: '7', username: 'Sidewall', points: 8200, trend: 'down', previousRank: 5 },
        { id: '8', username: 'DoubleFace', points: 7950, trend: 'up', previousRank: 9 },
        { id: '9', username: 'JazzHands', points: 7700, trend: 'down', previousRank: 7 },
        { id: '10', username: 'Mr.Toastyzz', points: 7500, trend: 'equal', previousRank: 10 }
    ];
    
    // Get the container where leaderboard rows will be displayed
    const leaderboardBody = document.getElementById('leaderboard-body');
    
    // Create and append leaderboard rows
    mockLeaderboard.forEach((player, index) => {
        const row = createLeaderboardRow(player, index + 1);
        leaderboardBody.appendChild(row);
    });
    
    // Add animation to the rows
    const rows = document.querySelectorAll('.leaderboard-table tbody tr');
    rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
        row.style.opacity = '1';
        row.style.transform = 'translateY(0)';
        }, index * 100);
    });
    });

    function createLeaderboardRow(player, rank) {
    // Create the row element
    const row = document.createElement('tr');
    
    // Create trend icon based on trend direction
    let trendIcon = '';
    let trendClass = '';
    
    if (player.trend === 'up') {
        trendIcon = '↑';
        trendClass = 'trend-up';
    } else if (player.trend === 'down') {
        trendIcon = '↓';
        trendClass = 'trend-down';
    } else {
        trendIcon = '→';
        trendClass = 'trend-equal';
    }
    
    // Set special styling for top 3 ranks
    let rankClass = '';
    if (rank === 1) {
        rankClass = 'rank-1';
    } else if (rank === 2) {
        rankClass = 'rank-2';
    } else if (rank === 3) {
        rankClass = 'rank-3';
    }
    
    // Create the HTML structure for the row
    row.innerHTML = `
        <td>
        <div class="rank ${rankClass}">
            <div class="rank-badge">${rank}</div>
            <span>#${rank}</span>
        </div>
        </td>
        <td><div class="username">${player.username}</div></td>
        <td><div class="points">${player.points.toLocaleString()}</div></td>
        <td>
        <div class="trend ${trendClass}">
            <span>${trendIcon}</span>
            <span>${player.previousRank !== rank ? Math.abs(player.previousRank - rank) : '0'}</span>
        </div>
        </td>
    `;
    
    return row;
}