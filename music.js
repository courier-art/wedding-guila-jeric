// GLOBAL MUSIC MANAGER - PLAYS ACROSS ALL TABS
document.addEventListener('DOMContentLoaded', function() {
    const music1 = document.getElementById('backgroundMusic1');
    const music2 = document.getElementById('backgroundMusic2');
    const toggleBtn = document.getElementById('musicToggle');

    if (!music1 || !music2 || !toggleBtn) return;

    music1.volume = 0.3;
    music2.volume = 0.3;

    let currentMusic = music1;
    let isPlaying = false;
    let hasAutoPlayed = false;

    function saveMusicState() {
        const state = {
            isPlaying: isPlaying,
            currentSong: currentMusic === music1 ? 1 : 2,
            currentTime: currentMusic.currentTime,
            hasAutoPlayed: hasAutoPlayed,
            timestamp: Date.now()
        };
        localStorage.setItem('globalWeddingMusic', JSON.stringify(state));
    }

    function loadMusicState() {
        try {
            const saved = localStorage.getItem('globalWeddingMusic');
            if (saved) {
                const state = JSON.parse(saved);
                isPlaying = state.isPlaying;
                hasAutoPlayed = state.hasAutoPlayed || false;
                currentMusic = state.currentSong === 2 ? music2 : music1;
                if (state.currentTime && isPlaying) {
                    const timeSinceSave = (Date.now() - state.timestamp) / 1000;
                    if (timeSinceSave < 300) {
                        currentMusic.currentTime = state.currentTime;
                    }
                }
                return true;
            }
        } catch (e) {
            console.log('Error loading music state:', e);
        }
        return false;
    }

    music1.addEventListener('ended', function() {
        currentMusic = music2;
        currentMusic.currentTime = 0;
        currentMusic.play()
            .then(() => saveMusicState())
            .catch(e => console.log('Play error:', e));
    });

    music2.addEventListener('ended', function() {
        currentMusic = music1;
        currentMusic.currentTime = 0;
        currentMusic.play()
            .then(() => saveMusicState())
            .catch(e => console.log('Play error:', e));
    });

    function updateButton() {
        if (isPlaying) {
            toggleBtn.innerHTML = '<i class="fas fa-pause"></i>';
            toggleBtn.style.background = 'var(--gray-medium)';
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-play"></i>';
            toggleBtn.style.background = 'var(--gray-medium)';
        }
    }

    function togglePlayback() {
        if (isPlaying) {
            currentMusic.pause();
            isPlaying = false;
            toggleBtn.innerHTML = '<i class="fas fa-play"></i>';
            toggleBtn.style.background = 'var(--gray-medium)';
        } else {
            currentMusic.play()
                .then(() => {
                    isPlaying = true;
                    hasAutoPlayed = true;
                    toggleBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    toggleBtn.style.background = 'var(--gray-medium)';
                })
                .catch(error => {
                    console.log('Play error:', error);
                });
        }
        saveMusicState();
    }

    function tryAutoPlay() {
        if (hasAutoPlayed) return;

        currentMusic.play()
            .then(() => {
                isPlaying = true;
                hasAutoPlayed = true;
                updateButton();
                saveMusicState();
                showNotification('Music started automatically');
            }).catch(error => {
                console.log('Auto-play blocked:', error);
                toggleBtn.innerHTML = '<i class="fas fa-play"></i>';
                toggleBtn.style.background = 'var(--gray-medium)';
                toggleBtn.title = "Click to play music";

                const tryOnInteraction = () => {
                    if (!hasAutoPlayed) {
                        currentMusic.play()
                            .then(() => {
                                isPlaying = true;
                                hasAutoPlayed = true;
                                updateButton();
                                saveMusicState();
                            });
                    }
                };

                document.addEventListener('click', tryOnInteraction, { once: true });
                document.addEventListener('touchstart', tryOnInteraction, { once: true });
            });
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: var(--gradient-bg);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 1001;
            animation: fadeInOut 3s ease forwards;
            max-width: 200px;
            text-align: center;
        `;
        notification.innerHTML = `<i class="fas fa-music"></i> ${message}`;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'fadeOut 0.5s ease forwards';
                setTimeout(() => notification.remove(), 500);
            }
        }, 3000);
    }

    toggleBtn.addEventListener('click', togglePlayback);

    function initializeMusic() {
        const hasSavedState = loadMusicState();
        updateButton();

        if (hasSavedState && isPlaying) {
            currentMusic.play()
                .then(() => console.log('Music resumed'))
                .catch(e => {
                    console.log('Resume failed:', e);
                    isPlaying = false;
                    updateButton();
                });
        } else {
            setTimeout(tryAutoPlay, 500);
        }

        window.addEventListener('beforeunload', saveMusicState);
        setInterval(saveMusicState, 2000);

        window.addEventListener('storage', function(event) {
            if (event.key === 'globalWeddingMusic') {
                loadMusicState();
                updateButton();
                if (isPlaying && currentMusic.paused) {
                    currentMusic.play()
                        .catch(e => console.log('Resume from other tab failed:', e));
                }
            }
        });
    }

    music1.addEventListener('error', function() {
        console.log('Music file 1 not found');
        toggleBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        toggleBtn.style.background = '#dc3545';
        toggleBtn.title = 'Music file not found';
    });

    music2.addEventListener('error', function() {
        console.log('Music file 2 not found');
        toggleBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        toggleBtn.style.background = '#dc3545';
        toggleBtn.title = 'Music file not found';
    });

    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(10px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes fadeOut {
            to { opacity: 0; transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);

    initializeMusic();
});
