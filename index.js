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

        const closeMenu = () => {
            menuOverlay.classList.remove('active');
            menuTl.reverse();
        };

        menuClose.addEventListener('click', closeMenu);
        menuLinks.forEach(link => link.addEventListener('click', closeMenu));
    }

    // 3. HERO TEXT INITIAL REVEAL
    const tl = gsap.timeline();
    tl.from(".step-1 .reveal-text", {
        y: 100, skewY: 7, opacity: 0, filter: "blur(10px)",
        duration: 1.5, stagger: 0.2, ease: "power4.out"
    });

    // =========================================
    // 4. 3D SCROLL SEQUENCE & TEXT TIMELINE
    // =========================================
    const canvas = document.getElementById("hero-lightpass");
    
    if (canvas) {
        const context = canvas.getContext("2d");
        const frameCount = 200; 
        
        const currentFrame = index => (
            `./assets/hero/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
        );

        const images = [];
        const sequence = { frame: 0 };

        for (let i = 0; i < frameCount; i++) {
          const img = new Image();
          img.src = currentFrame(i);
          images.push(img);
        }

        // CREATE MASTER TIMELINE FOR VIDEO SCRUB + TEXT ANIMATION
        const heroScrollTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "+=3500", // Extended so text changes don't happen too fast
                scrub: 0.5,        
                pin: true,
            }
        });

        // Add video scrubbing to timeline
        heroScrollTl.to(sequence, {
          frame: frameCount - 1,
          snap: "frame",
          ease: "none",
          duration: 1, // Normalized duration for the timeline
          onUpdate: render 
        }, 0);

        // Add text transition logic to the same timeline
        heroScrollTl.to(".step-1", { opacity: 0, y: -50, duration: 0.1 }, 0.15) // Step 1 leaves
                    .fromTo(".step-2", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.1 }, 0.25) // Step 2 enters
                    .to(".step-2", { opacity: 0, y: -50, duration: 0.1 }, 0.5) // Step 2 leaves
                    .fromTo(".step-3", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.1 }, 0.6) // Step 3 enters
                    .to(".step-3", { opacity: 0, filter: "blur(10px)", duration: 0.1 }, 0.85); // All text clears out at the end

        images[0].onload = render;

        function render() {
          context.clearRect(0, 0, canvas.width, canvas.height);
          
          // Quality adjustments for sharper rendering on mobile
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = 'high';

          const img = images[sequence.frame];
          
          if (img) {
              const hRatio = canvas.width / img.width;
              const vRatio = canvas.height / img.height;
              const ratio = Math.max(hRatio, vRatio) * 1.05; // Slightly reduced zoom 
              
              const centerShift_x = (canvas.width - img.width * ratio) / 2;
              const centerShift_y = (canvas.height - img.height * ratio) / 2;
              
              context.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
          }
        }

        const updateCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = window.innerWidth + "px";
            canvas.style.height = window.innerHeight + "px";
            context.scale(1, 1); 
            render();
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);
    }

    // =========================================
    // 5. ANTI-SKIP PIN FOR PORTFOLIO SECTION
    // =========================================
    // This briefly pins the feature section so fast scrollers don't fly past it
    ScrollTrigger.create({
        trigger: ".portfolio",
        start: "top top",
        end: "+=800",
        pin: true,
        scrub: true
    });

    // 6. RESPONSIVE HORIZONTAL SCROLL
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

    // 9. THE PROCESS ANIMATIONS
    gsap.to(".box-1", { rotation: 360, duration: 3, repeat: -1, ease: "linear" });
    gsap.to(".box-2", { scale: 1.5, yoyo: true, repeat: -1, duration: 1.5 });
    gsap.to(".box-3", { borderRadius: "50%", yoyo: true, repeat: -1, duration: 2 });

    // 10. 3D CAROUSEL LOGIC
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
});
