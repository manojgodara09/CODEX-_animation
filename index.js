document.addEventListener("DOMContentLoaded", (event) => {
    console.log("Codex Animation: Script Loaded");

    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // 1. Initialize Smooth Scroll (Lenis)
    try {
        if (typeof Lenis !== 'undefined') {
            const lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                smooth: true,
            });
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }
    } catch (e) { console.error(e); }

    // 2. MENU LOGIC
    const menuTrigger = document.querySelector('.menu-trigger');
    const menuClose = document.querySelector('.menu-close-btn');
    const menuOverlay = document.querySelector('.menu-overlay');
    const menuLinks = document.querySelectorAll('.menu-link');

    if (menuTrigger && menuOverlay) {
        const menuTl = gsap.timeline({ paused: true });
        menuTl.to(menuOverlay, { opacity: 1, duration: 0.4, ease: "power2.out" })
              .to(menuLinks, { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power4.out" }, "-=0.2");

        menuTrigger.addEventListener('click', () => {
            menuOverlay.classList.add('active');
            menuTl.play();
        });
        menuClose.addEventListener('click', () => {
            menuOverlay.classList.remove('active');
            menuTl.reverse();
        });
    }

    // 3. HERO ANIMATION (The Fix)
    // We animate FROM the glitch state TO the clean state.
    // This ensures the final result is always readable.
    const tl = gsap.timeline();
    
    tl.from(".reveal-text", {
        y: 100,           // Comes from below
        skewY: 7,         // Slight skew for style
        opacity: 0,       // Starts invisible
        filter: "blur(10px)", // Starts blurry
        duration: 1.5,
        stagger: 0.2,
        ease: "power4.out"
    })
    .to(".hero-sub", {
        opacity: 1,
        duration: 1,
        ease: "power2.out"
    }, "-=1");

    // 4. HERO PARALLAX (Subtle Mouse Move)
    const heroContainer = document.querySelector('.hero-text-container');
    if(heroContainer) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 10; // Reduced movement range
            const y = (e.clientY / window.innerHeight - 0.5) * 10;

            gsap.to(heroContainer, {
                x: -x,
                y: -y,
                rotateX: -y * 0.2, // Very subtle tilt
                rotateY: x * 0.2,
                duration: 1,
                ease: "power2.out"
            });
        });
    }

    // 5. RESPONSIVE SCROLL LOGIC
    ScrollTrigger.matchMedia({
        "(min-width: 800px)": function() {
            const sections = gsap.utils.toArray(".expertise-panel");
            if(sections.length > 0) {
                gsap.to(sections, {
                    xPercent: -100 * (sections.length - 1),
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".expertise-wrapper",
                        pin: true,
                        scrub: 1,
                        snap: 1 / (sections.length - 1),
                        end: () => "+=" + document.querySelector(".expertise-wrapper").offsetWidth
                    }
                });
            }
        },
        "all": function() {
            const fadeElements = gsap.utils.toArray(".video-card, .step, .panel-desc, .section-header");
            fadeElements.forEach(element => {
                gsap.from(element, {
                    scrollTrigger: {
                        trigger: element,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    },
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power3.out"
                });
            });
        }
    });

    // 6. 3D TILT EFFECT
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            gsap.to(card, {
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
                duration: 0.1,
                ease: "power1.out"
            });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
                duration: 0.5,
                ease: "power3.out"
            });
        });
    });

    // 7. MAGNETIC BUTTONS
    const magnets = document.querySelectorAll('.magnetic');
    magnets.forEach(magnet => {
        magnet.addEventListener('mousemove', (e) => {
            const rect = magnet.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(magnet, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
        });
        magnet.addEventListener('mouseleave', () => {
            gsap.to(magnet, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });
    });

    // 8. CURSOR RING
    const cursorRing = document.querySelector('.cursor-ring');
    if(cursorRing) {
        document.addEventListener('mousemove', (e) => {
            cursorRing.style.left = e.clientX + 'px';
            cursorRing.style.top = e.clientY + 'px';
        });
    }

    // Visual Rotations
    gsap.to(".box-1", { rotation: 360, duration: 3, repeat: -1, ease: "linear" });
    gsap.to(".box-2", { scale: 1.5, yoyo: true, repeat: -1, duration: 1.5 });
    gsap.to(".box-3", { borderRadius: "50%", yoyo: true, repeat: -1, duration: 2 });
});

    // 9. 3D CAROUSEL LOGIC WITH YOUTUBE SUPPORT
    const items = document.querySelectorAll('.video-item');
    const totalItems = items.length;
    let currentIndex = 2; // Start at center (Item 3)

    function updateCarousel() {
        if (window.innerWidth <= 768) return; // Disable 3D logic on mobile

        items.forEach((item, index) => {
            item.classList.remove('active');
            
            // Send PAUSE command to the YouTube iframe
            const iframe = item.querySelector('iframe');
            if (iframe) {
                iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            }

            let offset = index - currentIndex;
            if (offset > 2) offset -= totalItems;
            if (offset < -2) offset += totalItems;

            // Apply 3D Transforms
            if (offset === 0) {
                // Center (Active)
                item.style.transform = 'translateX(0) translateZ(0) rotateY(0)';
                item.style.zIndex = 10;
                item.classList.add('active');
                
                // Send PLAY command to Center YouTube iframe
                if (iframe) {
                    iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                }
            } else if (offset === 1) {
                item.style.transform = 'translateX(220px) translateZ(-150px) rotateY(-30deg)';
                item.style.zIndex = 5;
            } else if (offset === -1) {
                item.style.transform = 'translateX(-220px) translateZ(-150px) rotateY(30deg)';
                item.style.zIndex = 5;
            } else if (offset === 2 || offset === -3) {
                item.style.transform = 'translateX(380px) translateZ(-300px) rotateY(-45deg)';
                item.style.zIndex = 1;
            } else if (offset === -2 || offset === 3) {
                item.style.transform = 'translateX(-380px) translateZ(-300px) rotateY(45deg)';
                item.style.zIndex = 1;
            }
        });
    }

    // Connect buttons to the function
    window.moveCarousel = (direction) => {
        currentIndex = (currentIndex + direction + totalItems) % totalItems;
        updateCarousel();
    };

    // Initialize
    if(items.length > 0) {
        updateCarousel();
        window.addEventListener('resize', () => {
            if(window.innerWidth <= 768) {
                items.forEach(item => {
                    item.style.transform = '';
                    // On mobile, maybe play all or let user scroll?
                });
            } else {
                updateCarousel();
            }
        });
    }