function startAnimation() {
    const img = document.querySelector('.cool_cat_img');
    const text = document.querySelector('.welcome-text');
    const welcome = document.getElementById('welcome');
    const about = document.getElementById('about');
    const projects = document.getElementById('projects');
    // Fade in image
    setTimeout(() => {
        img.style.opacity = '1';
    }, 500);

    // Text and image split
    setTimeout(() => {
        welcome.style.transition = 'transform 2s ease-in-out';
        img.style.transition = 'transform 2s ease-in-out';
        text.style.transition = 'transform 2s ease-in-out';

        welcome.style.transform = 'translate(-50%, -50%) translateX(-40px)';
        img.style.transform = 'translateX(-80px)';
        text.style.opacity = '1';
        text.style.transform = 'translateX(80px)';
    }, 1500);
    
    // Make way for content
    setTimeout(() => {
        // Transition for smooth movement to the top
        welcome.style.transition = 'transform 1.5s ease-out';
        img.style.transition = 'transform 1.5s ease-out';
        text.style.transition = 'transform 1.5s ease-out';

        // Move both elements to the top
        welcome.style.transform = 'translate(-50%, 0%) translateY(-50vh) translateX(-115px)';
        img.style.transform = 'scale(0.5)'
    }, 4000);

    setTimeout(() => {
        about.style.transition = 'opacity 1s ease-in';
        about.style.opacity = '1';
        about.style.userSelect = 'auto';

        projects.style.transition = 'opacity 1s ease-in';
        projects.style.opacity = '1';
        projects.style.userSelect = 'auto';

        welcome.style.removeProperty('transition');
    }, 5500)
}
startAnimation();