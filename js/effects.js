function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        particle.style.width = particle.style.height = (Math.random() * 3 + 1) + 'px';
        container.appendChild(particle);
    }
}

function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, .btn, .product-card, .feature-card, .stat-item, .faq-item, .contact-card, .discord-card, .cta-card, .auth-card')) {
            cursor.classList.add('hover');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, .btn, .product-card, .feature-card, .stat-item, .faq-item, .contact-card, .discord-card, .cta-card, .auth-card')) {
            cursor.classList.remove('hover');
        }
    });
}

function initAutoSelectionCorners() {
    const selectors = [
        'a', 'button', '.btn', '.product-card', '.feature-card', '.stat-item',
        '.faq-item', '.contact-card', '.discord-card', '.cta-card', '.auth-card',
        '.hero-badge', '.hero-title', '.hero-description', '.section-title',
        '.nav-logo', '.footer-brand', 'h1', 'h2', 'h3', 'p.hero-description', '.hero-features li'
    ];

    const cornerOverlay = document.createElement('div');
    cornerOverlay.className = 'selection-corner-overlay';
    cornerOverlay.innerHTML = `
        <div class="auto-corner tl"></div>
        <div class="auto-corner tr"></div>
        <div class="auto-corner bl"></div>
        <div class="auto-corner br"></div>
    `;
    cornerOverlay.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 9998;
        opacity: 0;
        transition: opacity 0.15s ease;
    `;
    document.body.appendChild(cornerOverlay);

    const corners = cornerOverlay.querySelectorAll('.auto-corner');

    corners.forEach(corner => {
        corner.style.cssText = `
            position: absolute;
            width: 12px;
            height: 12px;
            border-color: #fff;
            border-style: solid;
            border-width: 0;
        `;
    });

    cornerOverlay.querySelector('.tl').style.cssText += 'top: -6px; left: -6px; border-top-width: 2px; border-left-width: 2px;';
    cornerOverlay.querySelector('.tr').style.cssText += 'top: -6px; right: -6px; border-top-width: 2px; border-right-width: 2px;';
    cornerOverlay.querySelector('.bl').style.cssText += 'bottom: -6px; left: -6px; border-bottom-width: 2px; border-left-width: 2px;';
    cornerOverlay.querySelector('.br').style.cssText += 'bottom: -6px; right: -6px; border-bottom-width: 2px; border-right-width: 2px;';

    let currentTarget = null;

    function showCorners(element) {
        const rect = element.getBoundingClientRect();

        let cornerColor = '#fff';
        const computedStyle = window.getComputedStyle(element);
        const bgColor = computedStyle.backgroundColor;

        if (element.classList.contains('btn-primary') ||
            bgColor.includes('255, 255, 255') ||
            bgColor.includes('rgb(255, 255, 255)')) {
            cornerColor = '#000';
        }

        corners.forEach(corner => {
            corner.style.borderColor = cornerColor;
        });

        cornerOverlay.style.left = rect.left + 'px';
        cornerOverlay.style.top = rect.top + 'px';
        cornerOverlay.style.width = rect.width + 'px';
        cornerOverlay.style.height = rect.height + 'px';
        cornerOverlay.style.opacity = '1';

        currentTarget = element;
    }

    function hideCorners() {
        cornerOverlay.style.opacity = '0';
        currentTarget = null;
    }

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest(selectors.join(', '));
        if (target && target !== currentTarget) {
            showCorners(target);
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest(selectors.join(', '));
        const relatedTarget = e.relatedTarget ? e.relatedTarget.closest(selectors.join(', ')) : null;

        if (target && target !== relatedTarget) {
            hideCorners();
        }
    });

    document.addEventListener('click', () => {
        setTimeout(() => {
            if (currentTarget && !document.body.contains(currentTarget)) {
                hideCorners();
            }
        }, 50);
    });

    window.addEventListener('scroll', () => {
        if (currentTarget) {
            if (!document.body.contains(currentTarget)) {
                hideCorners();
            } else {
                showCorners(currentTarget);
            }
        }
    });
}

function initParallax() {
    const hero = document.querySelector('.hero-visual');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;
        hero.style.transform = `translateY(${rate}px)`;
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .stat-item, .product-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

const style = document.createElement('style');
style.textContent = `
    .feature-card.visible, .stat-item.visible, .product-card.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initCustomCursor();
    initAutoSelectionCorners();
    initParallax();
    setTimeout(initScrollAnimations, 100);
});
