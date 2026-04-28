document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. PRELOADER SEQUENCE ---
    const tlLoader = gsap.timeline();
    
    let counter = { value: 0 };
    tlLoader.to(counter, {
        value: 100,
        duration: 1.5,
        ease: "power3.inOut",
        onUpdate: () => {
            document.getElementById("loader-counter").innerText = Math.round(counter.value).toString().padStart(3, '0');
            document.getElementById("loader-bar").style.width = `${counter.value}%`;
        }
    })
    .to("#loader-text", { yPercent: -100, opacity: 0, duration: 0.8, ease: "power4.inOut" }, "+=0.2")
    .to("#preloader", { yPercent: -100, duration: 1, ease: "power4.inOut" }, "-=0.4")
    .fromTo(".gs-reveal", 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: "power3.out", clearProps: "all" }, 
        "-=0.5"
    )
    .call(() => {
        document.body.classList.remove("overflow-hidden");
    });

    // --- 2. SMOOTH SCROLL (LENIS) ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // --- 3. CUSTOM CURSOR PHYSICS ---
    const cursorRing = document.querySelector('.cursor-ring');
    if (cursorRing && window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            gsap.to(cursorRing, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: "power2.out"
            });
        });

        // Hover effect for links and magnetic items
        const interactables = document.querySelectorAll('a, button, .interactive-card, #video-wrapper, .accordion-item');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-hover'));
        });
    }

    // --- 4. MAGNETIC BUTTONS ---
    const magnets = document.querySelectorAll('.magnetic');
    if(window.innerWidth > 768) {
        magnets.forEach(magnet => {
            magnet.addEventListener('mousemove', (e) => {
                const rect = magnet.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
                gsap.to(magnet, { x: x, y: y, duration: 0.3, ease: "power2.out" });
            });
            magnet.addEventListener('mouseleave', () => {
                gsap.to(magnet, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
            });
        });
    }

    // --- 5. VIDEO PLAYER LOGIC ---
    const videoWrapper = document.getElementById('video-wrapper');
    const mainVideo = document.getElementById('main-video');
    const playBtn = document.getElementById('play-btn');

    if (videoWrapper && mainVideo && playBtn) {
        videoWrapper.addEventListener('click', () => {
            if (mainVideo.paused) {
                mainVideo.play();
                gsap.to(playBtn, { opacity: 0, duration: 0.3, onComplete: () => playBtn.style.display = 'none' });
            } else {
                mainVideo.pause();
                playBtn.style.display = 'flex';
                gsap.to(playBtn, { opacity: 1, duration: 0.3 });
            }
        });
    }

    // --- 6. ACCORDION LOGIC ---
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all others
            accordionItems.forEach(el => el.classList.remove('active'));
            
            // Toggle clicked
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- 7. SCROLL REVEAL ANIMATIONS ---
    gsap.registerPlugin(ScrollTrigger);
    
    // Reveal elements on scroll (except the hero ones which load via timeline)
    const revealElements = document.querySelectorAll("section:not(:first-of-type) .gs-reveal");
    revealElements.forEach(el => {
        gsap.fromTo(el, 
            { y: 50, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                y: 0, 
                opacity: 1, 
                duration: 0.8, 
                ease: "power3.out"
            }
        );
    });

    // Duplicate marquee content for seamless looping
    const track = document.querySelector('.logo-marquee-track');
    if (track) {
        track.innerHTML += track.innerHTML;
    }
    // --- 8. SEAMLESS FORM SUBMISSION & REDIRECT ---
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Stop standard form submission
            
            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = 'Connecting...';
            
            const formData = new FormData(bookingForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            // Send email via Web3Forms invisibly
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                // Success! Instantly redirect to your booking page
                window.location.href = "https://cal.com/codex-animation-yzv32g/30min";
            })
            .catch(error => {
                console.log(error);
                // Even if it fails, push them to the calendar so you don't lose the lead
                window.location.href = "https://cal.com/codex-animation-yzv32g/30min";
            });
        });
    }
});