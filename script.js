/**
 * Smooth scrolling for navigation links
 * @param {Event} e - The click event
 */
function smoothScroll(e) {
    // Don't prevent default if it's an external link
    const href = this.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('www') || href.startsWith('mailto:')) {
        return;
    }
    
    e.preventDefault();
    
    // If it's a hash link
    if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
            // Close mobile menu if open
            const menu = document.querySelector('.nav-menu');
            const menuToggle = document.querySelector('[data-menu-toggle]');
            if (menu && menuToggle && menuToggle.getAttribute('aria-expanded') === 'true') {
                toggleMenu();
            }
            
            // Calculate scroll position with offset for fixed header
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            // Smooth scroll to target
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Update URL without page reload
            if (history.pushState) {
                history.pushState(null, null, href);
            } else {
                window.location.hash = href;
            }
        }
    } else {
        // Handle other relative links
        window.location.href = href;
    }
}

// Header scroll effect
const header = document.querySelector('.site-header');
let lastScroll = 0;

function handleScroll() {
    const currentScroll = window.pageYOffset;
    
    if (!header) return;
    
    // Toggle scrolled class based on scroll position
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Update active link on scroll with debounce
    clearTimeout(window.scrollTimer);
    window.scrollTimer = setTimeout(updateActiveLink, 50);
    
    lastScroll = currentScroll;
}

// Use passive event listener for better performance
window.addEventListener('scroll', handleScroll, { passive: true });

// Initialize header state on load
document.addEventListener('DOMContentLoaded', () => {
    handleScroll();
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScrolling();
    initMobileMenu();
    updateActiveLink();
    
    // Initialize stats animation if on the right page
    if (document.querySelector('.stats-section')) {
        animateStats();
    }
    
    // Initialize scroll position for header
    handleScroll();
});

// Initialize smooth scrolling for all anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"], a[href^="./"]');
    links.forEach(link => {
        link.removeEventListener('click', smoothScroll); // Prevent duplicate listeners
        link.addEventListener('click', smoothScroll);
    });
}

// Toggle mobile menu with improved accessibility
function toggleMenu() {
    const menu = document.querySelector('.nav-menu');
    const overlay = document.querySelector('[data-nav-overlay]');
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const menuClose = document.querySelector('.mobile-menu-close');
    const menuItems = document.querySelectorAll('.nav-link');
    const firstMenuItem = menuItems.length > 0 ? menuItems[0] : null;
    const header = document.querySelector('.site-header');
    
    if (!menu || !overlay || !menuToggle || !header) return;
    
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;
    
    // Toggle menu state
    if (newState) {
        // Opening menu
        document.body.classList.add('menu-open');
        header.classList.add('scrolled');
    } else {
        // Closing menu
        document.body.classList.remove('menu-open');
        // Update header state based on scroll position
        setTimeout(() => {
            handleScroll();
        }, 10);
    }
    
    // Update ARIA attributes
    menuToggle.setAttribute('aria-expanded', newState);
    menu.setAttribute('aria-hidden', !newState);
    menu.setAttribute('data-visible', newState);
    overlay.setAttribute('data-visible', newState);
    
    // Toggle body scroll and inert state
    document.body.style.overflow = newState ? 'hidden' : '';
    document.documentElement.setAttribute('aria-hidden', newState);
    
    // Handle focus management
    if (newState) {
        // Open menu
        menu.removeAttribute('inert');
        menu.style.display = 'flex';
        overlay.style.display = 'block';
        
        // Force a reflow before adding the visible class
        void menu.offsetHeight;
        
        menu.setAttribute('data-visible', 'true');
        overlay.setAttribute('data-visible', 'true');
        
        // Set focus to the close button when opening
        setTimeout(() => {
            if (menuClose) {
                menuClose.focus();
            } else if (firstMenuItem) {
                firstMenuItem.focus();
            }
        }, 50);
        
        // Trap focus inside menu when open
        const handleKeyDown = (e) => {
            // Close on Escape
            if (e.key === 'Escape') {
                e.preventDefault();
                toggleMenu();
                menuToggle.focus();
                return;
            }
            
            // Trap focus inside menu
            if (e.key === 'Tab') {
                // If focus is on close button and shift+tab, move to last menu item
                if (e.shiftKey && document.activeElement === menuClose && lastMenuItem) {
                    e.preventDefault();
                    lastMenuItem.focus();
                } 
                // If focus is on first item and shift+tab, move to close button
                else if (e.shiftKey && document.activeElement === firstMenuItem && menuClose) {
                    e.preventDefault();
                    menuClose.focus();
                } 
                // If focus is on last item and tab, move to close button
                else if (!e.shiftKey && document.activeElement === lastMenuItem && menuClose) {
                    e.preventDefault();
                    menuClose.focus();
                } 
                // If focus is on close button and tab, move to first menu item
                else if (!e.shiftKey && document.activeElement === menuClose && firstMenuItem) {
                    e.preventDefault();
                    firstMenuItem.focus();
                }
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        menu._keyDownHandler = handleKeyDown;
    } else {
        // Close menu
        menu.setAttribute('aria-hidden', 'true');
        menu.setAttribute('data-visible', 'false');
        overlay.setAttribute('data-visible', 'false');
        document.documentElement.removeAttribute('aria-hidden');
        
        // Remove keyboard event listener
        if (menu._keyDownHandler) {
            document.removeEventListener('keydown', menu._keyDownHandler);
            delete menu._keyDownHandler;
        }
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            if (menu.getAttribute('data-visible') === 'false') {
                menu.style.display = 'none';
                overlay.style.display = 'none';
            }
        }, 300);
    }
}

// Initialize mobile menu functionality
function initMobileMenu() {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const menuClose = document.querySelector('.mobile-menu-close');
    const overlay = document.querySelector('[data-nav-overlay]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!menuToggle || !overlay) return;
    
    // Toggle menu on button click
    menuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });
    
    // Close menu when clicking the close button
    if (menuClose) {
        menuClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
    }
    
    // Close menu when clicking overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            toggleMenu();
        }
    });
    
    // Close menu when clicking a nav link on mobile
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 1024) {
                toggleMenu();
            }
        });
    });
    
    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
        const menu = document.querySelector('.nav-menu');
        if (e.key === 'Escape' && menu && menu.getAttribute('data-visible') === 'true') {
            toggleMenu();
            menuToggle.focus();
        }
    });
}

// Update active navigation link based on scroll position
function updateActiveLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = '#' + section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = sectionId;
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === current) {
            link.classList.add('active');
        }
    });
}

// Animate stats on scroll
function animateStats() {
    const stats = document.querySelectorAll('.stat-item h3');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                const suffix = text.replace(/\d/g, '');
                let current = 0;
                const increment = number / 60;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= number) {
                        target.textContent = number + suffix;
                        clearInterval(timer);
                    } else {
                        target.textContent = Math.floor(current) + suffix;
                    }
                }, 25);
                
                observer.unobserve(target);
            }
        });
    });
    
    stats.forEach(stat => observer.observe(stat));
}

    

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 
                     type === 'error' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 
                     'linear-gradient(135deg, #3498db, #2980b9)'};
        color: white;
        padding: 0;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.5s ease;
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        padding: 1rem 1.5rem;
        gap: 0.8rem;
    `;
    
    const icon = notification.querySelector('.notification-icon');
    icon.style.cssText = `
        font-size: 1.2rem;
        font-weight: bold;
    `;
    
    const messageEl = notification.querySelector('.notification-message');
    messageEl.style.cssText = `
        flex: 1;
        font-weight: 500;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s ease;
    `;
    
    closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    closeBtn.onmouseout = () => closeBtn.style.background = 'none';
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Intersection Observer for animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe service cards
    document.querySelectorAll('.service-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
    
    // Observe about section
    const aboutText = document.querySelector('.about-text');
    const aboutImage = document.querySelector('.about-image');
    
    if (aboutText) {
        aboutText.style.opacity = '0';
        aboutText.style.transform = 'translateX(-50px)';
        aboutText.style.transition = 'all 0.8s ease';
        observer.observe(aboutText);
    }
    
    if (aboutImage) {
        aboutImage.style.opacity = '0';
        aboutImage.style.transform = 'translateX(50px)';
        aboutImage.style.transition = 'all 0.8s ease 0.2s';
        observer.observe(aboutImage);
    }
}

// Dynamic typing effect for hero subtitle
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Particle effect for hero section
function createParticles() {
    const hero = document.querySelector('.hero');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255, 107, 53, 0.6);
            border-radius: 50%;
            pointer-events: none;
            animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        hero.appendChild(particle);
    }
}

// Form field focus effects
function initFormEffects() {
    const formFields = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    
    formFields.forEach(field => {
        field.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        field.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    animateStats();
    initScrollAnimations();
    initFormEffects();
    
    // Add particles to hero
    createParticles();
    
    // Typing effect for hero subtitle (optional)
    const heroSubtitle = document.querySelector('.hero p');
    if (heroSubtitle) {
        const originalText = heroSubtitle.textContent;
        // Uncomment the line below if you want the typing effect
        // typeWriter(heroSubtitle, originalText, 30);
    }
    
    // Add smooth scroll behavior to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.style.transition = 'color 0.3s ease';
    });

    // Mobile Menu Functionality
    const mobileMenuToggle = document.querySelector('[data-menu-toggle]');
    const overlay = document.querySelector('[data-nav-overlay]');

    // Toggle mobile menu with improved accessibility and performance
    function toggleMenu() {
        const menu = document.querySelector('.nav-menu');
        const menuToggle = document.querySelector('[data-menu-toggle]');
        const menuItems = document.querySelectorAll('.nav-link');
        const firstMenuItem = menuItems.length > 0 ? menuItems[0] : null;
        const lastMenuItem = menuItems.length > 0 ? menuItems[menuItems.length - 1] : null;

        if (!menu || !overlay || !menuToggle) return;

        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        const newState = !isExpanded;

        // Update ARIA attributes
        menuToggle.setAttribute('aria-expanded', newState);
        menu.setAttribute('data-visible', newState);
        overlay.setAttribute('data-visible', newState);

        // Toggle body scroll
        document.body.style.overflow = newState ? 'hidden' : '';

        // Handle focus management
        if (newState) {
            // Open menu
            menu.setAttribute('inert', '');
            setTimeout(() => {
                menu.removeAttribute('inert');
                firstMenuItem?.focus();
            }, 50);

            // Trap focus inside menu when open
            const handleKeyDown = (e) => {
                // Close on Escape
                if (e.key === 'Escape') {
                    toggleMenu();
                    menuToggle.focus();
                    return;
                }

                // Trap tab focus inside menu
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        // Shift + Tab
                        if (document.activeElement === firstMenuItem) {
                            e.preventDefault();
                            lastMenuItem.focus();
                        }
                    } else {
                        // Tab
                        if (document.activeElement === lastMenuItem) {
                            e.preventDefault();
                            firstMenuItem.focus();
                        }
                    }
                }
            };

            // Add event listeners for keyboard navigation
            document.addEventListener('keydown', handleKeyDown);
            menu._keyDownHandler = handleKeyDown;
        } else {
            // Close menu
            menu.setAttribute('inert', '');

            // Remove keyboard event listener
            if (menu._keyDownHandler) {
                document.removeEventListener('keydown', menu._keyDownHandler);
                delete menu._keyDownHandler;
            }
        }

        // Toggle menu visibility with animation
        if (newState) {
            menu.style.display = 'flex';
            overlay.style.display = 'block';

            // Trigger reflow
            void menu.offsetHeight;

            menu.setAttribute('data-visible', 'true');
            overlay.setAttribute('data-visible', 'true');
        } else {
            menu.setAttribute('data-visible', 'false');
            overlay.setAttribute('data-visible', 'false');

            // Wait for animation to complete before hiding
            setTimeout(() => {
                if (menu.getAttribute('data-visible') === 'false') {
                    menu.style.display = 'none';
                    overlay.style.display = 'none';
                }
            }, 300); // Match this with your CSS transition duration
        }
    }

    // Initialize mobile menu
    function initMobileMenu() {
                toggleMenu();
                menuToggle.focus();
                return;
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleMenu();
            });
        }
        
        // Close menu when clicking on overlay
        if (navOverlay) {
            navOverlay.addEventListener('click', function() {
                toggleMenu();
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu && mobileMenuToggle) {
                if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    if (navMenu.classList.contains('active')) {
                        toggleMenu();
                    }
                }
            }
        });
        
        // Close menu when pressing Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    }
    
    // Initialize mobile menu when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }
    
    // Theme Toggle Functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved user preference, if any, on load of the website
    const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('light-mode', currentTheme === 'light');
    
    // Update the toggle icon based on the current theme
    function updateIcon() {
        const icon = themeToggle?.querySelector('i');
        if (icon) {
            icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
    
    // Initial icon update
    updateIcon();
    
    // Toggle theme when the button is clicked
    themeToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isLight = document.documentElement.classList.toggle('light-mode');
        const theme = isLight ? 'light' : 'dark';
        localStorage.setItem('theme', theme);
        updateIcon();
    });
});

// Mobile menu toggle (for future mobile menu implementation)
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('mobile-active');
}

// Smooth scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll to top button
window.addEventListener('scroll', function() {
    let scrollTopBtn = document.getElementById('scrollTopBtn');
    
    if (!scrollTopBtn) {
        scrollTopBtn = document.createElement('button');
        scrollTopBtn.id = 'scrollTopBtn';
        scrollTopBtn.innerHTML = '↑';
        scrollTopBtn.onclick = scrollToTop;
        document.body.appendChild(scrollTopBtn);
    }
    
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// EmailJS initialization
emailjs.init("YfbpTDuvdltlfHWl3");

document.getElementById("contact-form").addEventListener("submit", function (e) {
  e.preventDefault();

  emailjs.sendForm("service_1nml0ou", "template_uvozqjf", this)
    .then(function () {
      alert("✅ Message sent successfully!");
      e.target.reset();
    }, function (error) {
      console.error("❌ EmailJS Error:", error);
      alert("❌ Failed to send message. Try again.");
    });
});
