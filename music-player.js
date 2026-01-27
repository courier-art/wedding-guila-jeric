// music-player.js
// GLOBAL CONTINUOUS MUSIC ACROSS ALL PAGES

class WeddingMusicPlayer {
    constructor() {
        this.songs = [
            new Audio('story-song1.mp3'),
            new Audio('story-song2.mp3')
        ];
        
        this.currentIndex = 0;
        this.isPlaying = false;
        this.volume = 0.3;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        // Prevent multiple initializations
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        // Configure songs
        this.songs.forEach(song => {
            song.volume = this.volume;
            song.preload = 'auto';
        });
        
        // Set up song transitions
        this.songs[0].addEventListener('ended', () => this.playNext());
        this.songs[1].addEventListener('ended', () => this.playNext());
        
        // Load saved state
        this.loadState();
        
        // Auto-play if not playing
        if (!this.isPlaying) {
            this.autoStart();
        } else {
            // If already playing, ensure current song continues
            this.playCurrentSong();
        }
        
        // Create control button
        this.createControlButton();
        
        // Save state before page unload
        window.addEventListener('beforeunload', () => this.saveState());
    }
    
    get currentSong() {
        return this.songs[this.currentIndex];
    }
    
    playCurrentSong() {
        // Only play if not already playing
        if (this.currentSong.paused && this.isPlaying) {
            this.currentSong.play()
                .catch(e => console.log('Play error:', e));
        }
    }
    
    playNext() {
        // Move to next song
        this.currentIndex = (this.currentIndex + 1) % this.songs.length;
        
        // Play next song
        this.currentSong.currentTime = 0;
        this.currentSong.play()
            .then(() => {
                this.saveState();
                this.updateButton();
            })
            .catch(e => console.log('Next song error:', e));
    }
    
    autoStart() {
        // Try to auto-play with multiple attempts
        const tryPlay = () => {
            this.currentSong.play()
                .then(() => {
                    this.isPlaying = true;
                    this.saveState();
                    this.updateButton();
                    console.log('Music started successfully');
                })
                .catch(error => {
                    console.log('Auto-play blocked, waiting for interaction');
                    // Wait for user interaction
                    document.addEventListener('click', () => this.startOnInteraction(), { once: true });
                    document.addEventListener('touchstart', () => this.startOnInteraction(), { once: true });
                    document.addEventListener('keydown', () => this.startOnInteraction(), { once: true });
                });
        };
        
        // Start after delay
        setTimeout(tryPlay, 1000);
    }
    
    startOnInteraction() {
        if (!this.isPlaying) {
            this.currentSong.play()
                .then(() => {
                    this.isPlaying = true;
                    this.saveState();
                    this.updateButton();
                });
        }
    }
    
    createControlButton() {
        // Remove existing button if any
        const oldBtn = document.getElementById('globalMusicBtn');
        if (oldBtn) oldBtn.remove();
        
        // Create new button
        const btn = document.createElement('button');
        btn.id = 'globalMusicBtn';
        btn.innerHTML = this.isPlaying ? '⏸️' : '▶️';
        btn.title = this.isPlaying ? 'Pause music' : 'Play music';
        
        // Button styles
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: white;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Hover effect
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.1)';
            btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        });
        
        // Click handler
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        document.body.appendChild(btn);
    }
    
    updateButton() {
        const btn = document.getElementById('globalMusicBtn');
        if (btn) {
            btn.innerHTML = this.isPlaying ? '⏸️' : '▶️';
            btn.title = this.isPlaying ? 'Pause music' : 'Play music';
        }
    }
    
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
        this.saveState();
    }
    
    play() {
        if (!this.isPlaying) {
            this.currentSong.play()
                .then(() => {
                    this.isPlaying = true;
                    this.updateButton();
                })
                .catch(e => console.log('Play error:', e));
        }
    }
    
    pause() {
        if (this.isPlaying) {
            this.currentSong.pause();
            this.isPlaying = false;
            this.updateButton();
        }
    }
    
    saveState() {
        // Save to localStorage
        localStorage.setItem('weddingMusic', JSON.stringify({
            isPlaying: this.isPlaying,
            currentIndex: this.currentIndex,
            volume: this.volume,
            currentTime: this.currentSong.currentTime
        }));
    }
    
    loadState() {
        try {
            const saved = localStorage.getItem('weddingMusic');
            if (saved) {
                const state = JSON.parse(saved);
                this.isPlaying = state.isPlaying;
                this.currentIndex = state.currentIndex || 0;
                this.volume = state.volume || 0.3;
                
                // Set volume
                this.songs.forEach(song => song.volume = this.volume);
                
                // Set current time for seamless continuation
                if (state.currentTime && state.currentTime < this.currentSong.duration) {
                    this.currentSong.currentTime = state.currentTime;
                }
                
                console.log('Loaded music state:', state);
            }
        } catch (e) {
            console.log('Error loading music state:', e);
        }
    }
}

// Initialize global music player
if (!window.weddingMusicPlayer) {
    window.weddingMusicPlayer = new WeddingMusicPlayer();
}
