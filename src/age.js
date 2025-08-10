function updateYears() {
    const span = document.getElementById('age');
    const now = new Date();
    const birthday = new Date(2003, 1, 17);
    let age = now.getFullYear() - birthday.getFullYear();
    const monthDiff = now.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthday.getDate())) {
        age--;
    }
    span.textContent = age;
}

window.onload = function() {
    updateYears();
}