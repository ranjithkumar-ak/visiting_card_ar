/* ============================================
   AR VISITING CARD – APPLICATION LOGIC
   Handles marker events, card overlay, voice,
   info panel toggling, and button interactions.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- DOM REFERENCES ---------- */
    const marker       = document.getElementById('ar-marker');
    const cardOverlay  = document.getElementById('card-overlay');
    const loadingScreen = document.getElementById('loading-screen');
    const scanOverlay  = document.getElementById('scan-overlay');
    const cameraError  = document.getElementById('camera-error');
    const closeCard    = document.getElementById('close-card');
    const infoToggle   = document.getElementById('info-toggle');
    const infoPanel    = document.getElementById('info-panel');
    const voiceBtn     = document.getElementById('voice-btn');
    const demoBtn      = document.getElementById('demo-btn');
    const scene        = document.querySelector('a-scene');

    let markerVisible  = false;   // track marker state
    let cardManuallyDismissed = false;  // user closed the card


    /* ============================================
       0. HTTPS CHECK
       Camera requires a Secure Context (HTTPS or localhost)
       ============================================ */
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isSecure) {
        console.warn('[AR] Page not served over HTTPS — camera will likely fail.');
        const tipHttps = document.getElementById('tip-https');
        if (tipHttps) tipHttps.style.display = 'list-item';
    }


    /* ============================================
       0b. CAMERA ACCESS CHECK
       Attempt to get camera before AR.js does, so we can show
       a helpful error if it fails.
       ============================================ */
    async function checkCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            // Camera works — stop the test stream immediately
            stream.getTracks().forEach(t => t.stop());
            console.log('[AR] Camera access granted.');
            return true;
        } catch (err) {
            console.error('[AR] Camera access failed:', err.name, err.message);
            showCameraError(err);
            return false;
        }
    }

    function showCameraError(err) {
        loadingScreen.classList.add('hidden');
        scanOverlay.classList.add('hidden');
        cameraError.classList.remove('camera-error-hidden');
        cameraError.classList.add('camera-error-visible');

        const reason = document.getElementById('error-reason');
        if (err.name === 'NotAllowedError') {
            reason.textContent = 'Camera permission was denied. Please allow camera access and refresh.';
        } else if (err.name === 'NotFoundError') {
            reason.textContent = 'No camera found on this device.';
        } else if (err.name === 'NotReadableError') {
            reason.textContent = 'Camera is in use by another app. Close it and retry.';
        } else if (!isSecure) {
            reason.textContent = 'Camera blocked — this page must be served over HTTPS.';
        } else {
            reason.textContent = 'Camera error: ' + (err.message || err.name);
        }
    }

    // Run camera check
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        checkCamera();
    } else {
        // mediaDevices API not available (insecure context)
        showCameraError({ name: 'NotSupportedError', message: 'Camera API not available. Use HTTPS.' });
    }


    /* ============================================
       0c. DEMO MODE
       Show the contact card without AR if camera fails
       ============================================ */
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            cameraError.classList.add('camera-error-hidden');
            cameraError.classList.remove('camera-error-visible');
            // Show card overlay directly
            cardOverlay.classList.remove('card-hidden');
            cardOverlay.classList.add('card-visible');
        });
    }


    /* ============================================
       1. LOADING SCREEN
       Hide once the A-Frame scene is ready
       ============================================ */
    if (scene) {
        scene.addEventListener('loaded', () => {
            // Small delay for smoother UX
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 1200);
        });

        // Fallback: hide after 5 s even if 'loaded' doesn't fire
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 5000);
    }


    /* ============================================
       2. MARKER DETECTION
       Show / hide the contact card overlay
       ============================================ */
    if (marker) {
        // ── Marker found ──
        marker.addEventListener('markerFound', () => {
            markerVisible = true;
            cardManuallyDismissed = false;

            // Hide scan instructions
            scanOverlay.classList.add('hidden');

            // Show contact card (slide up)
            cardOverlay.classList.remove('card-hidden');
            cardOverlay.classList.add('card-visible');

            console.log('[AR] Marker detected');
        });

        // ── Marker lost ──
        marker.addEventListener('markerLost', () => {
            markerVisible = false;

            // Grace period — don't remove card instantly (avoids flicker)
            setTimeout(() => {
                if (!markerVisible) {
                    cardOverlay.classList.remove('card-visible');
                    cardOverlay.classList.add('card-hidden');
                    scanOverlay.classList.remove('hidden');

                    // Reset info panel
                    infoPanel.classList.remove('open');
                    infoToggle.classList.remove('open');
                    updateInfoToggleText(false);

                    console.log('[AR] Marker lost – card hidden');
                }
            }, 2500);
        });
    }

    // ── Allow tap on screen to show card when marker is visible ──
    document.addEventListener('click', (e) => {
        // Only trigger if marker is visible and card is hidden, and tap is not on the card itself
        if (markerVisible && cardManuallyDismissed && !cardOverlay.contains(e.target)) {
            cardManuallyDismissed = false;
            cardOverlay.classList.remove('card-hidden');
            cardOverlay.classList.add('card-visible');
        }
    });


    /* ============================================
       3. CLOSE / MINIMIZE CARD
       ============================================ */
    if (closeCard) {
        closeCard.addEventListener('click', (e) => {
            e.stopPropagation();
            cardOverlay.classList.remove('card-visible');
            cardOverlay.classList.add('card-hidden');
            cardManuallyDismissed = true;
        });
    }


    /* ============================================
       4. INFO PANEL TOGGLE
       Expand/collapse the education & achievements section
       ============================================ */
    if (infoToggle && infoPanel) {
        infoToggle.addEventListener('click', () => {
            const isOpen = infoPanel.classList.toggle('open');
            infoToggle.classList.toggle('open');
            updateInfoToggleText(isOpen);
        });
    }

    function updateInfoToggleText(isOpen) {
        const label = infoToggle.querySelector('span');
        if (label) {
            label.textContent = isOpen ? 'Less Info' : 'More Info';
        }
    }


    /* ============================================
       5. VOICE INTRO (Web Speech API)
       Reads a short introduction aloud
       ============================================ */
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            if (!('speechSynthesis' in window)) {
                alert('Voice synthesis is not supported on this browser.');
                return;
            }

            // Cancel any ongoing speech
            speechSynthesis.cancel();

            const intro = new SpeechSynthesisUtterance(
                "Hi, I'm Dinesh — an AI and Machine Learning Engineer based in Chennai, India."
            );
            intro.rate   = 0.92;
            intro.pitch  = 1.0;
            intro.volume = 1.0;

            // Prefer an English voice
            const voices = speechSynthesis.getVoices();
            const englishVoice = voices.find(v => v.lang.startsWith('en'));
            if (englishVoice) intro.voice = englishVoice;

            // Visual feedback
            voiceBtn.classList.add('speaking');
            intro.onend = () => voiceBtn.classList.remove('speaking');
            intro.onerror = () => voiceBtn.classList.remove('speaking');

            speechSynthesis.speak(intro);
        });

        // Pre-load voices (some browsers load them async)
        if ('speechSynthesis' in window) {
            speechSynthesis.getVoices();
            speechSynthesis.addEventListener('voiceschanged', () => {
                speechSynthesis.getVoices();
            });
        }
    }


    /* ============================================
       6. BUTTON TAP ANIMATIONS
       Adds a 'tapped' class on touch for visual feedback
       ============================================ */
    document.querySelectorAll('.contact-btn').forEach(btn => {
        btn.addEventListener('touchstart', () => {
            btn.classList.add('tapped');
        }, { passive: true });

        btn.addEventListener('touchend', () => {
            setTimeout(() => btn.classList.remove('tapped'), 220);
        }, { passive: true });

        // Also handle mouse events for desktop testing
        btn.addEventListener('mousedown', () => btn.classList.add('tapped'));
        btn.addEventListener('mouseup', () => {
            setTimeout(() => btn.classList.remove('tapped'), 220);
        });
        btn.addEventListener('mouseleave', () => btn.classList.remove('tapped'));
    });


    /* ============================================
       7. PREVENT DEFAULT ZOOM / SCROLL IN AR VIEW
       ============================================ */
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());


    /* ============================================
       8. CONSOLE WELCOME MESSAGE
       ============================================ */
    console.log(
        '%c AR Business Card loaded! ',
        'background: #080c24; color: #00e5ff; font-size: 14px; padding: 8px 12px; border-radius: 4px; font-weight: bold;'
    );
    console.log(
        '%c Point your camera at the HIRO marker to see the card.',
        'color: #90a4ae; font-size: 12px;'
    );
});
