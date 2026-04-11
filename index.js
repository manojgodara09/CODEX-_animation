document.addEventListener("DOMContentLoaded", (event) => {
    console.log("Codex Animation: Script Loaded");

    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // 1. SMOOTH SCROLL (LENIS)
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


    // 2. NEW PARALLAX STAR BACKGROUND
    const layers = document.querySelectorAll('.star-layer');
    if (layers.length > 0) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            layers.forEach(layer => {
                const speed = parseFloat(layer.getAttribute('data-speed'));
                const moveX = (x - centerX) * speed;
                const moveY = (y - centerY) * speed;
                layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
    }

    // --- PORTFOLIO PIN HAS BEEN REMOVED HERE ---

    // 3. RESPONSIVE HORIZONTAL SCROLL
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
                    y: 50, opacity: 0, duration: 0.8, ease: "power3.out"
                });
            });
        }
    });

    // 4. MAGNETIC BUTTONS
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

    // 5. CURSOR RING
    const cursorRing = document.querySelector('.cursor-ring');
    if(cursorRing) {
        document.addEventListener('mousemove', (e) => {
            cursorRing.style.left = e.clientX + 'px';
            cursorRing.style.top = e.clientY + 'px';
        });
    }

    // 6. THE PROCESS ANIMATIONS
    gsap.to(".box-1", { rotation: 360, duration: 3, repeat: -1, ease: "linear" });
    gsap.to(".box-2", { scale: 1.5, yoyo: true, repeat: -1, duration: 1.5 });
    gsap.to(".box-3", { borderRadius: "50%", yoyo: true, repeat: -1, duration: 2 });

    // 7. 3D CAROUSEL LOGIC
    const items = document.querySelectorAll('.video-item');
    const totalItems = items.length;
    let currentIndex = 2; 

    function updateCarousel() {
        if (window.innerWidth <= 768) return; 

        items.forEach((item, index) => {
            item.classList.remove('active');
            const iframe = item.querySelector('iframe');
            if (iframe) iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');

            let offset = index - currentIndex;
            if (offset > 2) offset -= totalItems;
            if (offset < -2) offset += totalItems;

            if (offset === 0) {
                item.style.transform = 'translateX(0) translateZ(0) rotateY(0)';
                item.style.zIndex = 10;
                item.classList.add('active');
                if (iframe) iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
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

    window.moveCarousel = (direction) => {
        currentIndex = (currentIndex + direction + totalItems) % totalItems;
        updateCarousel();
    };

    if(items.length > 0) {
        updateCarousel();
        window.addEventListener('resize', () => {
            if(window.innerWidth <= 768) {
                items.forEach(item => item.style.transform = '');
            } else {
                updateCarousel();
            }
        });
    }
// 8. DYNAMIC NAV HIGHLIGHTING
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = ['work', 'agency', 'services'];
    
    sections.forEach(id => {
        const sectionEl = document.getElementById(id);
        if (sectionEl) {
            ScrollTrigger.create({
                trigger: sectionEl,
                start: "top center",      // Triggers when the top of the section hits the middle of the screen
                end: "bottom center",     // Ends when the bottom of the section leaves the middle
                onToggle: self => {
                    if (self.isActive) {
                        navLinks.forEach(link => {
                            // Reset all links to inactive state
                            link.classList.remove('text-purple-400', 'border-purple-400');
                            link.classList.add('text-neutral-400', 'border-transparent', 'hover:text-white');
                            
                            // Highlight the matching active link
                            if (link.getAttribute('href') === `#${id}`) {
                                link.classList.remove('text-neutral-400', 'border-transparent', 'hover:text-white');
                                link.classList.add('text-purple-400', 'border-purple-400');
                            }
                        });
                    }
                }
            });
        }
    });});
