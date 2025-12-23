// ===== PRESENTATION DATA =====
const slides = [
    {
        text: "Virtual Twin of the Product\n\nAt OXOS, the virtual twin is not just a 3D model.\nIt is the single, complete, and living reference of the product.",
        media: null
    },
    {
        text: "It concentrates all the product's intelligence in one place:\ndetailed bill of materials, exact configurations, manufacturing constraints, engineering and certification data, material history.",
        media: "PRD 1"
    },
    {
        text: "Before a single machine is powered on, we already know the predicted cycle time, material costs, geometric risks, and even the environmental footprint.",
        media: "PRD 2"
    },
    {
        text: "This virtual twin feeds OXOS's generative AI.\nConcretely, for the manufacturing of a housing, OXOS automatically generates the optimal machining sequence, the associated 5-axis CNC program, and the relevant quality inspections to fits with A&D regulations.",
        media: "PRD 3"
    },
    {
        text: "In production, the virtual twin tracks progress, quality status, and process deviations in real time.\nIn engineering and compliance, it ensures full traceability — from as-specified to as-maintained — with certification reports generated automatically.",
        media: "PRD 4"
    },
    {
        text: "With OXOS, industry moves from reactive execution\nto a predictive process, continuously auditable.",
        media: "PRD Content"
    }
];

// ===== STATE MANAGEMENT =====
let currentSlide = -1; // Start at -1 to show intro
let activeMedia = null; // Track currently visible media
let soundStarted = false; // Track if PRD Sound has been shown

// ===== SUPABASE REAL-TIME SYNC =====
let supabaseClient = null;
let realtimeChannel = null;
let sessionId = null; // Current session ID
let isLocalAction = false; // Flag to prevent loops

// ===== SDK INTEGRATION =====
// Function to send visibility messages to the SDK platform
function toggleVisibility(actorName, visible) {
    console.log("toggleVisibility:", actorName, visible);
    window.parent.postMessage(JSON.stringify({
        action: "toggleVisibility",
        actor: actorName,
        visible: visible
    }), "*");
}

// Function to show 3D media
function showMedia(mediaName) {
    if (mediaName) {
        toggleVisibility(mediaName, true);
        activeMedia = mediaName;
        console.log(`Showing 3D object: ${mediaName}`);
    }
}

// Function to hide 3D media
function hideMedia(mediaName) {
    if (mediaName) {
        toggleVisibility(mediaName, false);
        console.log(`Hiding 3D object: ${mediaName}`);
    }
}

// Function to hide all media
function hideAllMedia() {
    const allMedia = ["PRD 1", "PRD 2", "PRD 3", "PRD 4", "PRD Content"];
    allMedia.forEach(media => {
        toggleVisibility(media, false);
    });
    activeMedia = null;
    console.log("All 3D objects hidden");
}

// Function to hide AS IS Product only when presentation starts
function hideASISProduct() {
    toggleVisibility("AS IS Product", false);
    console.log("AS IS Product hidden");
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    initStars();
    await initSupabase();
    initPresentation();

    console.log("OXOS Presentation loaded - SDK ready");
    console.log("Supabase Real-time sync enabled - User ID:", window.USER_ID);
});

// ===== STARS CREATION =====
function initStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 150;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        const size = Math.random() * 2 + 0.5;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 2) + 's';

        starsContainer.appendChild(star);
    }
}

// ===== PRESENTATION LOGIC =====
function initPresentation() {
    const nextBtn = document.getElementById('nextBtn');
    const textContent = document.getElementById('textContent');

    // Hide all PRD media at start (but NOT AS IS Product yet)
    hideAllMedia();

    // Hide PRD Sound initially
    toggleVisibility("PRD Sound", false);

    // Show intro state
    setTimeout(() => {
        textContent.classList.add('show');
        nextBtn.classList.add('show');
    }, 300);

    // Next button click handler
    nextBtn.addEventListener('click', nextSlide);

    // Update progress
    updateProgress();
}

async function nextSlide() {
    // Update Supabase to sync with all clients
    if (!isLocalAction) {
        await updateSession({ current_slide: currentSlide + 1 });
    }

    nextSlideLocal();
}

function nextSlideLocal() {
    const textContent = document.getElementById('textContent');
    const slideText = textContent.querySelector('.slide-text');
    const nextBtn = document.getElementById('nextBtn');

    // On first click, show PRD Sound
    if (!soundStarted) {
        toggleVisibility("PRD Sound", true);
        soundStarted = true;
    }

    // Don't hide previous media - keep them visible!
    // Each new media adds to the scene

    // Move to next slide
    currentSlide++;

    // Check if presentation is complete
    if (currentSlide >= slides.length) {
        // End of presentation
        showEndScreen();
        return;
    }

    // Animate out current text
    textContent.classList.remove('show');
    textContent.classList.add('slide-out');

    setTimeout(() => {
        // Update text content
        const slide = slides[currentSlide];
        slideText.textContent = slide.text;

        // Show new media if present (without hiding previous ones)
        if (slide.media) {
            showMedia(slide.media);

            // Hide AS IS Product when showing PRD Content (last media)
            if (slide.media === "PRD Content") {
                hideASISProduct();
            }
        }

        // Animate in new text
        textContent.classList.remove('slide-out');
        textContent.classList.add('slide-in');

        setTimeout(() => {
            textContent.classList.remove('slide-in');
            textContent.classList.add('show');
        }, 100);

        // Update button text
        if (currentSlide === slides.length - 1) {
            nextBtn.querySelector('.btn-text').textContent = 'Finish';
        } else {
            nextBtn.querySelector('.btn-text').textContent = 'Continue';
        }

        // Update progress
        updateProgress();
    }, 500);
}

function showEndScreen() {
    const textContent = document.getElementById('textContent');
    const slideText = textContent.querySelector('.slide-text');
    const nextBtn = document.getElementById('nextBtn');

    // Animate out
    textContent.classList.remove('show');
    nextBtn.classList.remove('show');

    setTimeout(() => {
        slideText.innerHTML = '<strong>Thank you</strong><br>Presentation Complete';

        textContent.classList.add('show');

        // Change button to restart
        nextBtn.querySelector('.btn-text').textContent = 'Restart Presentation';
        nextBtn.querySelector('.btn-icon').textContent = '↻';
        nextBtn.onclick = restartPresentation;

        setTimeout(() => {
            nextBtn.classList.add('show');
        }, 500);
    }, 600);
}

function restartPresentation() {
    // Hide all media
    hideAllMedia();

    // Show AS IS Product again when restarting
    toggleVisibility("AS IS Product", true);

    // Hide PRD Sound when restarting (it will show on first click)
    toggleVisibility("PRD Sound", false);

    // Reset state
    currentSlide = -1;
    soundStarted = false;

    // Reset button
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.querySelector('.btn-text').textContent = 'Start Presentation';
    nextBtn.querySelector('.btn-icon').textContent = '→';
    nextBtn.onclick = nextSlide;

    // Reset content
    const textContent = document.getElementById('textContent');
    const slideText = textContent.querySelector('.slide-text');
    slideText.textContent = '';

    // Update progress
    updateProgress();

    console.log("Presentation restarted");
}

function updateProgress() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    const total = slides.length;
    const current = Math.max(0, currentSlide + 1);
    const percentage = (current / total) * 100;

    // Update progress bar
    progressBar.style.setProperty('--progress', percentage + '%');
    progressBar.querySelector('::after') || (progressBar.style.background = `linear-gradient(90deg, #1976d2 ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%)`);

    // Simpler approach - directly set width via inline style
    const barFill = document.createElement('div');
    barFill.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: ${percentage}%;
        background: linear-gradient(90deg, #1976d2, #4da6ff);
        border-radius: 10px;
        transition: width 0.6s ease;
        box-shadow: 0 0 10px rgba(77, 166, 255, 0.8);
    `;

    // Clear and add new fill
    progressBar.innerHTML = '';
    progressBar.appendChild(barFill);

    // Update text
    progressText.textContent = `${current} / ${total}`;
}

// ===== SUPABASE INITIALIZATION =====
async function initSupabase() {
    // Initialize Supabase client using the global supabase object from CDN
    const { createClient } = supabase;
    supabaseClient = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

    // Get or create the oxos presentation session (should be only one row)
    const { data, error } = await supabaseClient
        .from('oxos_presentation_session')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching OXOS presentation session:', error);
        return;
    }

    sessionId = data.id;
    console.log('Connected to OXOS presentation session:', sessionId);

    // Subscribe to real-time changes
    realtimeChannel = supabaseClient
        .channel('oxos_presentation_session_changes')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'oxos_presentation_session'
            },
            handleSessionUpdate
        )
        .subscribe();

    console.log('OXOS Real-time subscription active');

    // Sync to current state if presentation is already running
    if (data.current_slide > -1) {
        syncToSlide(data.current_slide);
    }
}

// ===== SUPABASE SYNC FUNCTIONS =====
async function updateSession(updates) {
    const { error } = await supabaseClient
        .from('oxos_presentation_session')
        .update(updates)
        .eq('id', sessionId);

    if (error) {
        console.error('Error updating OXOS session:', error);
    }
}

function handleSessionUpdate(payload) {
    const newData = payload.new;
    console.log('Presentation session updated:', newData);

    // Sync to new slide
    if (newData.current_slide !== currentSlide) {
        syncToSlide(newData.current_slide);
    }
}

function syncToSlide(targetSlide) {
    // Set flag to prevent loop
    isLocalAction = true;

    // Calculate how many times to advance
    const diff = targetSlide - currentSlide;

    if (diff > 0) {
        // Need to advance
        for (let i = 0; i < diff; i++) {
            nextSlideLocal();
        }
    } else if (diff < 0) {
        // Need to go back (restart and advance to target)
        restartPresentation();
        for (let i = 0; i < targetSlide; i++) {
            nextSlideLocal();
        }
    }

    // Reset flag
    isLocalAction = false;
}
