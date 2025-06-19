// Initialize building cursor
document.addEventListener('DOMContentLoaded', () => {
    // Enable custom cursor
    document.body.classList.add('custom-cursor-enabled');
    
    // Track mouse movement
    const cursor = document.querySelector('.building-cursor');
    
    // Move cursor
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
    
    // Add hover effect to interactive elements (excluding navbar links)
    const hoverTargets = [
        'button:not(.nav-link)', '.btn', 
        '[role="button"]:not(.nav-link)', '.info-box',
        'input', 'textarea', 'select',
        'a:not(.developer-link, .nav-link)'
    ];
    
    hoverTargets.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    });

    // Make sure developer link is clickable
    const devLink = document.querySelector('.developer-link');
    if (devLink) {
        devLink.style.position = 'relative';
        devLink.style.zIndex = '10001';
    }
});
