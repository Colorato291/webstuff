function startAnimation() {
    const img = document.querySelector('.cool_cat_img');
    const text = document.querySelector('.welcome-text');
    const welcome = document.getElementById('welcome');

    // Grab all sections after #welcome
    const contentSections = document.querySelectorAll('#content > div:not(#welcome)');

    // Step 1: Fade-in + scale pop
    img.style.transform = 'scale(0.9)';
    setTimeout(() => {
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
        img.style.transition = 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.25, 1.25, 0.5, 1)';
    }, 200);

    // Step 2: Split image & text
    setTimeout(() => {
        welcome.style.transition = 'transform 1.5s ease-in-out';
        img.style.transition = 'transform 1.5s ease-in-out';
        text.style.transition = 'opacity 1s ease-out, transform 1.5s ease-in-out';

        welcome.style.transform = 'translate(-50%, -50%) translateX(-40px)';
        img.style.transform = 'translateX(-80px) scale(1)';
        text.style.opacity = '1';
        text.style.transform = 'translateX(80px)';
    }, 900);

    // Step 3: Move welcome to top
    setTimeout(() => {
        welcome.style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
        img.style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)';

        welcome.style.transform = 'translate(-50%, 0%) translateY(-50vh) translateX(-115px)';
        img.style.transform = 'scale(0.5)';
    }, 2400);

    // Step 4: Reveal all content sections with stagger
    contentSections.forEach((section, index) => {
        setTimeout(() => {
            section.classList.add('visible');
            // Render content when specific sections become visible
            if (section.id === 'projects') {
                renderProjects();
            } else if (section.id === 'competitions') {
                renderCompetitions();
            }
        }, 3000 + index * 200);
    });

    // Step 5: Fix the welcome section to the top after animation
    setTimeout(() => {
        welcome.classList.add('fixed');
    }, 3000 + contentSections.length * 200 + 100);
}

startAnimation();