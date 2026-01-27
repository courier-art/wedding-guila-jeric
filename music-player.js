// wedding-music.js
// AUTOPLAY + CONTINUOUS PLAYBACK + AESTHETIC DESIGN

console.log('🎵 Wedding Music Player Loading...');

// ============================================
// CONFIGURATION - EDIT THESE
// ============================================
const CONFIG = {
    song1: 'story-song2.mp3',     // Change to your first song filename
    song2: 'story-song1.mp3',     // Change to your second song filename
    volume: 0.3,                  // Volume level (0.1 to 1.0)
    fadeDuration: 1000,           // Fade duration in milliseconds
    autoPlayDelay: 1000,          // Delay before auto-play (milliseconds)
    buttonSize: 50,               // Button size in pixels
    buttonColor: '#0a0a0a',       // Button color
    buttonIconColor: '#ffffff'    // Icon color
};

// ============================================
// AUDIO SETUP
// ============================================
const song1 = new Audio(CONFIG.song1);
const song2 = new Audio(CONFIG.song2);

// Audio settings
song1.volume = CONFIG.volume;
song2.volume = CONFIG.volume;
song1.loop = false;
song2.loop = false;
song1.preload = 'auto';
song2.preload = 'auto';

// State variables
let currentSong = song1;
let isPlaying = false;
let hasAutoPlayed = false;
let isFading = false;

// ============================================
// ERROR HANDLING
// ============================================
function handleAudioError(audio, songName) {
    audio.addEventListener('error', function(e) {
        console.error(`❌ Error loading ${songName}:`, e);
        console.error(`Check if file exists: ${CONFIG[songName]}`);
        
        // Update button to show error
        updateButton(true);
        
        // Show error notification
        showNotification(`Could not load ${songName}`, 'error');
    });
}

handleAudioError(song1, 'song1');
handleAudioError(song2, 'song2');

// ============================================
// SMOOTH FADING FUNCTIONS
// ============================================
function fadeOut(audio, callback) {
    if (isFading) return;
    isFading = true;
    
    let volume = audio.volume;
    const step = 0.05;
    const interval = CONFIG.fadeDuration / (volume / step);
    
    const fadeInterval = setInterval(() => {
        volume -= step;
        if (volume <= 0) {
            volume = 0;
            clearInterval(fadeInterval);
            audio.volume = volume;
            isFading = false;
            if (callback) callback();
        } else {
            audio.volume = volume;
        }
    }, interval);
}

function fadeIn(audio, callback) {
    if (isFading) return;
    isFading = true;
    
    audio.volume = 0;
    let volume = 0;
    const step = 0.05;
    const interval = CONFIG.fadeDuration / (CONFIG.volume / step);
    
    const fadeInterval = setInterval(() => {
        volume += step;
        if (volume >= CONFIG.volume) {
            volume = CONFIG.volume;
            clearInterval(fadeInterval);
            audio.volume = volume;
            isFading = false;
            if (callback) callback();
        } else {
            audio.volume = volume;
        }
    }, interval);
}

// ============================================
// SONG TRANSITIONS WITH FADE
// ============================================
song1.addEventListener('ended', function() {
    console.log('🎶 Switching to Song 2');
    fadeOut(song1, () => {
        currentSong = song2;
        song2.currentTime = 0;
        song2.play()
            .then(() => fadeIn(song2))
            .catch(e => console.log('Play error:', e));
        saveMusicState();
    });
});

song2.addEventListener('ended', function() {
    console.log('🎶 Switching to Song 1');
    fadeOut(song2, () => {
        currentSong = song1;
        song1.currentTime = 0;
        song1.play()
            .then(() => fadeIn(song1))
            .catch(e => console.log('Play error:', e));
        saveMusicState();
    });
});

// ============================================
// AESTHETIC BUTTON CREATION
// ============================================
function createMusicButton() {
    // Remove existing button
    const oldBtn = document.getElementById('musicControl');
    if (oldBtn) oldBtn.remove();
    
    // Create button
    const btn = document.createElement('button');
    btn.id = 'musicControl';
    btn.className = 'music-control-btn';
    btn.setAttribute('aria-label', isPlaying ? 'Pause music' : 'Play music');
    
    // Create SVG icons for play/pause
    const playIcon = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.buttonIconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
    `;
    
    const pauseIcon = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.buttonIconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
    `;
    
    btn.innerHTML = isPlaying ? pauseIcon : playIcon;
    
    // Apply styles
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '25px',
        right: '25px',
        width: `${CONFIG.buttonSize}px`,
        height: `${CONFIG.buttonSize}px`,
        borderRadius: '50%',
        backgroundColor: CONFIG.buttonColor,
        color: CONFIG.buttonIconColor,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '0',
        outline: 'none'
    });
    
    // Hover effects
    btn.addEventListener('mouseenter', () => {
        Object.assign(btn.style, {
            transform: 'scale(1.1)',
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.35)',
            backgroundColor: '#1a1a1a'
        });
    });
    
    btn.addEventListener('mouseleave', () => {
        Object.assign(btn.style, {
            transform: 'scale(1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            backgroundColor: CONFIG.buttonColor
        });
    });
    
    // Active/click effect
    btn.addEventListener('mousedown', () => {
        btn.style.transform = 'scale(0.95)';
    });
    
    btn.addEventListener('mouseup', () => {
        btn.style.transform = 'scale(1.1)';
    });
    
    // Click handler
    btn.addEventListener('click', toggleMusic);
    
    // Touch support for mobile
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        btn.style.transform = 'scale(0.95)';
    }, { passive: false });
    
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        btn.style.transform = 'scale(1)';
        toggleMusic();
    }, { passive: false });
    
    document.body.appendChild(btn);
    console.log('🎵 Aesthetic music button created');
}

// ============================================
// UPDATE BUTTON STATE
// ============================================
function updateButton(isError = false) {
    const btn = document.getElementById('musicControl');
    if (!btn) return;
    
    const playIcon = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${isError ? '#ff6b6b' : CONFIG.buttonIconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
    `;
    
    const pauseIcon = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.buttonIconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
    `;
    
    btn.innerHTML = isPlaying ? pauseIcon : playIcon;
    btn.style.backgroundColor = isError ? '#ff6b6b' : CONFIG.buttonColor;
}

// ============================================
// TOGGLE MUSIC FUNCTION
// ============================================
function toggleMusic() {
    if (isPlaying) {
        // Pause with fade out
        fadeOut(currentSong, () => {
            currentSong.pause();
            isPlaying = false;
            updateButton();
            saveMusicState();
            console.log('⏸️ Music paused');
        });
    } else {
        // Play with fade in
        currentSong.play()
            .then(() => {
                fadeIn(currentSong);
                isPlaying = true;
                hasAutoPlayed = true;
                updateButton();
                saveMusicState();
                console.log('▶️ Music playing');
            })
            .catch(error => {
                console.log('⚠️ Play failed:', error);
                // User interaction might be required
                if (error.name === 'NotAllowedError') {
                    showNotification('Click the play button to start music', 'info');
                }
            });
    }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'info') {
    const colors = {
        info: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        success: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        error: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)'
    };
    
    const notification = document.createElement('div');
    notification.className = 'music-notification';
    notification.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
        </svg>
        <span>${message}</span>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: `${CONFIG.buttonSize + 40}px`,
        right: '25px',
        background: colors[type],
        color: 'white',
        padding: '12px 18px',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: '500',
        zIndex: '9998',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        animation: 'slideInUp 0.3s ease, fadeOut 0.3s ease 2.7s forwards',
        maxWidth: '250px',
        lineHeight: '1.4'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// ============================================
// STATE MANAGEMENT
// ============================================
function saveMusicState() {
    const state = {
        isPlaying: isPlaying,
        currentSong: currentSong === song1 ? 1 : 2,
        currentTime: currentSong.currentTime,
        hasAutoPlayed: hasAutoPlayed,
        volume: CONFIG.volume
    };
    localStorage.setItem('weddingMusic', JSON.stringify(state));
}

function loadMusicState() {
    try {
        const saved = localStorage.getItem('weddingMusic');
        if (saved) {
            const state = JSON.parse(saved);
            
            // Restore state
            isPlaying = state.isPlaying;
            hasAutoPlayed = state.hasAutoPlayed || false;
            currentSong = state.currentSong === 2 ? song2 : song1;
            
            // Restore volume if changed
            if (state.volume) {
                song1.volume = state.volume;
                song2.volume = state.volume;
            }
            
            // Restore playback position if music was playing
            if (state.currentTime && isPlaying) {
                currentSong.currentTime = state.currentTime;
            }
            
            console.log('📂 Loaded music state:', state);
            return true;
        }
    } catch (e) {
        console.log('Error loading music state:', e);
    }
    return false;
}

// ============================================
// AUTOPLAY FUNCTION
// ============================================
function tryAutoPlay() {
    console.log('🎵 Attempting auto-play...');
    
    // Don't auto-play if already played
    if (hasAutoPlayed) {
        console.log('✅ Music already auto-played before');
        return;
    }
    
    setTimeout(() => {
        currentSong.play()
            .then(() => {
                console.log('✅ Auto-play successful!');
                isPlaying = true;
                hasAutoPlayed = true;
                updateButton();
                saveMusicState();
                
                // Show success notification
                showNotification('Background music started', 'success');
                
                // Start fade in
                fadeIn(currentSong);
            })
            .catch(error => {
                console.log('⚠️ Auto-play blocked:', error.message);
                
                // Show info notification
                showNotification('Click play button to start music', 'info');
                
                // Try on user interaction
                const tryOnInteraction = () => {
                    if (!isPlaying && !hasAutoPlayed) {
                        currentSong.play()
                            .then(() => {
                                isPlaying = true;
                                hasAutoPlayed = true;
                                updateButton();
                                saveMusicState();
                                fadeIn(currentSong);
                            });
                    }
                };
                
                // Try on first user interaction
                const events = ['click', 'touchstart', 'keydown', 'scroll'];
                events.forEach(event => {
                    document.addEventListener(event, tryOnInteraction, { once: true });
                });
            });
    }, CONFIG.autoPlayDelay);
}

// ============================================
// INITIALIZE MUSIC PLAYER
// ============================================
function initializeMusicPlayer() {
    console.log('🎵 Initializing music player...');
    
    // Load saved state
    const hasSavedState = loadMusicState();
    
    // Create aesthetic button
    createMusicButton();
    
    if (hasSavedState && isPlaying) {
        // Resume playback
        console.log('🔄 Resuming playback...');
        currentSong.play()
            .then(() => {
                console.log('✅ Music resumed');
                updateButton();
                fadeIn(currentSong);
            })
            .catch(e => {
                console.log('⚠️ Resume failed:', e);
                isPlaying = false;
                updateButton();
            });
    } else {
        // Try auto-play on first visit
        tryAutoPlay();
    }
    
    // Save state regularly
    window.addEventListener('beforeunload', saveMusicState);
    setInterval(saveMusicState, 5000);
}

// ============================================
// START EVERYTHING
// ============================================
// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
    
    .music-control-btn {
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }
    
    .music-control-btn:hover {
        transform: scale(1.1);
    }
    
    .music-control-btn:active {
        transform: scale(0.95);
    }
    
    @media (max-width: 768px) {
        .music-control-btn {
            width: 45px !important;
            height: 45px !important;
            bottom: 20px !important;
            right: 20px !important;
        }
    }
`;
document.head.appendChild(style);

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMusicPlayer);
} else {
    initializeMusicPlayer();
}

// Make toggle function available globally
window.toggleMusic = toggleMusic;
