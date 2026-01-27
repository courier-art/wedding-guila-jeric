// global-music.js
// AUTOPLAY + CONTINUOUS ACROSS ALL PAGES

console.log('🎵 Global Music Player Loading...');

// Create audio elements - UPDATE THESE FILENAMES
const song1 = new Audio('story-song2.mp3');
const song2 = new Audio('story-song1.mp3');

// Settings
song1.volume = 0.3;
song2.volume = 0.3;
song1.loop = false;
song2.loop = false;
song1.preload = 'auto';
song2.preload = 'auto';

let currentSong = song1;
let isPlaying = false;
let hasAutoPlayed = false;

// ============================================
// ERROR HANDLING
// ============================================
song1.addEventListener('error', function(e) {
    console.error('❌ Error loading song1:', e);
    console.error('Check if file exists: music/song1.mp3');
});

song2.addEventListener('error', function(e) {
    console.error('❌ Error loading song2:', e);
    console.error('Check if file exists: music/song2.mp3');
});

// ============================================
// SONG TRANSITIONS
// ============================================
song1.addEventListener('ended', function() {
    console.log('➡️ Song 1 ended, playing song 2');
    currentSong = song2;
    currentSong.currentTime = 0;
    currentSong.play().catch(e => console.log('Play error:', e));
    saveMusicState();
});

song2.addEventListener('ended', function() {
    console.log('➡️ Song 2 ended, playing song 1');
    currentSong = song1;
    currentSong.currentTime = 0;
    currentSong.play().catch(e => console.log('Play error:', e));
    saveMusicState();
});

// ============================================
// CONTROL BUTTON
// ============================================
function createMusicButton() {
    // Remove existing button
    const oldBtn = document.getElementById('globalMusicBtn');
    if (oldBtn) oldBtn.remove();
    
    // Create new button
    const btn = document.createElement('button');
    btn.id = 'globalMusicBtn';
    btn.innerHTML = isPlaying ? '⏸️' : '▶️';
    btn.title = isPlaying ? 'Pause Music' : 'Play Music';
    
    // Styling
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        color: white;
        border: 2px solid white;
        cursor: pointer;
        font-size: 1.2rem;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    `;
    
    // Hover effects
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.1)';
        btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    });
    
    // Click handler
    btn.addEventListener('click', function() {
        toggleMusic();
    });
    
    document.body.appendChild(btn);
    console.log('🎵 Music button created');
}

// ============================================
// TOGGLE MUSIC
// ============================================
function toggleMusic() {
    if (isPlaying) {
        // Pause
        currentSong.pause();
        isPlaying = false;
        console.log('⏸️ Music paused');
    } else {
        // Play
        currentSong.play()
            .then(() => {
                isPlaying = true;
                hasAutoPlayed = true;
                console.log('▶️ Music playing');
            })
            .catch(error => {
                console.log('⚠️ Play failed:', error);
                // If blocked by browser, ask for user interaction
                alert('Please click OK to allow music to play');
                currentSong.play()
                    .then(() => {
                        isPlaying = true;
                        hasAutoPlayed = true;
                    });
            });
    }
    
    updateButton();
    saveMusicState();
}

// ============================================
// UPDATE BUTTON
// ============================================
function updateButton() {
    const btn = document.getElementById('globalMusicBtn');
    if (btn) {
        btn.innerHTML = isPlaying ? '⏸️' : '▶️';
        btn.title = isPlaying ? 'Pause Music' : 'Play Music';
    }
}

// ============================================
// SAVE/LOAD STATE
// ============================================
function saveMusicState() {
    const state = {
        isPlaying: isPlaying,
        currentSong: currentSong === song1 ? 1 : 2,
        currentTime: currentSong.currentTime,
        hasAutoPlayed: hasAutoPlayed
    };
    localStorage.setItem('weddingMusicState', JSON.stringify(state));
    console.log('💾 Music state saved:', state);
}

function loadMusicState() {
    try {
        const saved = localStorage.getItem('weddingMusicState');
        if (saved) {
            const state = JSON.parse(saved);
            console.log('📂 Loaded music state:', state);
            
            isPlaying = state.isPlaying;
            hasAutoPlayed = state.hasAutoPlayed || false;
            
            // Set current song
            currentSong = state.currentSong === 2 ? song2 : song1;
            
            // Resume time if was playing
            if (state.currentTime && isPlaying) {
                currentSong.currentTime = state.currentTime;
            }
            
            return true;
        }
    } catch (e) {
        console.log('Error loading state:', e);
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
    
    // Try to play after 1.5 seconds
    setTimeout(() => {
        currentSong.play()
            .then(() => {
                console.log('✅ Auto-play SUCCESS! Music is playing');
                isPlaying = true;
                hasAutoPlayed = true;
                updateButton();
                saveMusicState();
                
                // Show subtle notification
                showMusicNotification('Music started automatically');
            })
            .catch(error => {
                console.log('⚠️ Auto-play blocked:', error.message);
                console.log('👆 User needs to click the play button');
                
                // Try again on user interaction
                const tryOnInteraction = () => {
                    if (!isPlaying && !hasAutoPlayed) {
                        currentSong.play()
                            .then(() => {
                                isPlaying = true;
                                hasAutoPlayed = true;
                                updateButton();
                                saveMusicState();
                                document.removeEventListener('click', tryOnInteraction);
                                document.removeEventListener('touchstart', tryOnInteraction);
                            });
                    }
                };
                
                document.addEventListener('click', tryOnInteraction, { once: true });
                document.addEventListener('touchstart', tryOnInteraction, { once: true });
            });
    }, 1500);
}

// ============================================
// NOTIFICATION
// ============================================
function showMusicNotification(message) {
    const notification = document.createElement('div');
    notification.innerHTML = `🎵 ${message}`;
    notification.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: rgba(10, 10, 10, 0.9);
        color: white;
        padding: 10px 15px;
        border-radius: 10px;
        font-size: 0.9rem;
        z-index: 9998;
        animation: slideInUp 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255,255,255,0.1);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// ============================================
// INITIALIZE
// ============================================
function initializeMusic() {
    console.log('🎵 Initializing global music...');
    
    // Load saved state
    const hasSavedState = loadMusicState();
    
    // Create button
    createMusicButton();
    
    if (hasSavedState && isPlaying) {
        // Resume playing if it was playing before
        console.log('🔄 Resuming previous playback...');
        currentSong.play()
            .then(() => {
                console.log('✅ Music resumed');
                updateButton();
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
    
    // Save state when page closes
    window.addEventListener('beforeunload', saveMusicState);
    
    // Save state every 10 seconds as backup
    setInterval(saveMusicState, 10000);
}

// ============================================
// START EVERYTHING
// ============================================
// Wait for page to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMusic);
} else {
    initializeMusic();
}

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
`;
document.head.appendChild(style);

// Make functions available globally
window.toggleMusic = toggleMusic;
