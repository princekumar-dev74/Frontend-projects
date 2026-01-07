document.addEventListener('DOMContentLoaded', () => {
    // --- Video Opener Animation ---
    const openButton = document.getElementById('open-video-button');
    const videoOpener = document.getElementById('video-opener');
    const envelopeVideo = document.getElementById('envelope-video');
    const mainContentWrapper = document.getElementById('main-content-wrapper');

    openButton.addEventListener('click', () => {
        openButton.style.display = 'none'; // Hide the button
        envelopeVideo.play(); // Start playing the video

        // Wait 6.5 seconds for the video to play
        setTimeout(() => {
            videoOpener.style.opacity = '0'; // Fade out the video container
            mainContentWrapper.style.opacity = '1'; // Fade in the main content
            document.body.classList.remove('body-no-scroll');

            // Clean up the video container from the DOM after it fades out
            setTimeout(() => {
                videoOpener.style.display = 'none';
            }, 650);
        }, 6500);
    });

    // --- Custom Cursor ---
    const cursor = document.querySelector('.custom-cursor');
    document.addEventListener('mousemove', e => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
    document.querySelectorAll('a, button, input, [class*="cursor-pointer"]').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });

    // --- Scroll Animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    // --- Countdown Timer ---
    const weddingDate = new Date("Oct 12, 2025 16:00:00").getTime();
    const timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance > 0) {
            document.getElementById('days').innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
            document.getElementById('hours').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
            document.getElementById('minutes').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            document.getElementById('seconds').innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
        } else {
            clearInterval(timerInterval);
            document.getElementById('countdown-timer').innerHTML = "<div class='col-span-4 text-3xl'>Happily Ever After!</div>";
        }
    }, 1000);

    // --- Lightbox Gallery ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const galleryItems = Array.from(document.querySelectorAll('#gallery-grid .gallery-item'));
    const galleryImages = galleryItems.map(item => item.querySelector('img'));
    let currentIndex = 0;

    const showImage = (index) => {
        lightboxImg.src = galleryImages[index].src;
        currentIndex = index;
    };

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            lightbox.classList.add('show');
            showImage(index);
        });
    });

    document.getElementById('lightbox-close').addEventListener('click', () => lightbox.classList.remove('show'));
    document.getElementById('lightbox-prev').addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : galleryImages.length - 1;
        showImage(currentIndex);
    });
    document.getElementById('lightbox-next').addEventListener('click', () => {
        currentIndex = (currentIndex < galleryImages.length - 1) ? currentIndex + 1 : 0;
        showImage(currentIndex);
    });
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.classList.remove('show');
    });

    // --- RSVP Form ---
    const rsvpForm = document.getElementById('rsvpForm');
    const formMessage = document.getElementById('form-message');
    rsvpForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const name = formData.get('name');
        const attending = formData.get('attending');
        const submitBtn = this.querySelector('button');
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        setTimeout(() => { // Simulate network request
            if (attending === 'yes') {
                formMessage.textContent = `Thank you, ${name}! We can't wait to celebrate with you.`;
                formMessage.style.color = '#34D399';
            } else {
                formMessage.textContent = `We're so sorry you can't make it, ${name}. You will be missed!`;
                formMessage.style.color = '#F87171';
            }
            rsvpForm.reset();
            submitBtn.textContent = 'Submit RSVP';
            submitBtn.disabled = false;
        }, 1000);
    });

    // --- Music Player ---
    const musicPlayer = document.getElementById('music-player');
    const music = document.getElementById('background-music');
    const musicIcon = document.getElementById('music-icon');
    let isPlaying = false;

    musicPlayer.addEventListener('click', () => {
        if (isPlaying) {
            music.pause();
            musicIcon.classList.remove('fa-pause');
            musicIcon.classList.add('fa-play');
        } else {
            music.play();
            musicIcon.classList.remove('fa-play');
            musicIcon.classList.add('fa-pause');
        }
        isPlaying = !isPlaying;
    });
});