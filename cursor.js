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
    
    // Add hover effect to interactive elements
    const hoverTargets = [
        'a', 'button', '.btn', 
        '[role="button"]', '.info-box',
        'input', 'textarea', 'select'
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
});
