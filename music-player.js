// music-player.js
// GLOBAL MUSIC PLAYER FOR ENTIRE WEBSITE

class GlobalMusicPlayer {
    constructor() {
        this.song1 = new Audio('story-song1.mp3');
        this.song2 = new Audio('story-song2.mp3');
        this.currentSong = this.song1;
        this.isPlaying = false;
        this.volume = 0.3;
        
        this.init();
    }
    
    init() {
        // Set initial volume
        this.song1.volume = this.volume;
        this.song2.volume = this.volume;
        
        // Don't loop individual songs - we'll handle playlist
        this.song1.loop = false;
        this.song2.loop = false;
        
        // Set up song transitions
        this.song1.addEventListener('ended', () => this.playNext());
        this.song2.addEventListener('ended', () => this.playNext());
        
        // Load from localStorage
        this.loadState();
        
        // Auto-play if not already playing
        if (!this.isPlaying) {
            this.autoPlay();
        }
    }
    
    playNext() {
        if (this.currentSong === this.song1) {
            this.currentSong = this.song2;
        } else {
            this.currentSong = this.song1;
        }
        
        this.currentSong.currentTime = 0;
        this.currentSong.play();
        this.saveState();
    }
    
    autoPlay() {
        // Try to auto-play after a short delay
        setTimeout(() => {
            this.currentSong.play()
                .then(() => {
                    this.isPlaying = true;
                    this.saveState();
                    this.createControlButton();
                })
                .catch(() => {
                    // Auto-play blocked, create button for manual start
                    this.createControlButton();
                });
        }, 1000);
    }
    
    createControlButton() {
        // Create button if it doesn't exist
        if (!document.getElementById('globalMusicToggle')) {
            const button = document.createElement('button');
            button.id = 'globalMusicToggle';
            button.innerHTML = this.isPlaying ? '⏸️' : '▶️';
            button.style.cssText = `
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
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 9999;
            `;
            
            button.addEventListener('click', () => this.toggle());
            document.body.appendChild(button);
        }
    }
    
    toggle() {
        if (this.isPlaying) {
            this.currentSong.pause();
            this.isPlaying = false;
        } else {
            this.currentSong.play();
            this.isPlaying = true;
        }
        
        document.getElementById('globalMusicToggle').innerHTML = this.isPlaying ? '⏸️' : '▶️';
        this.saveState();
    }
    
    saveState() {
        // Save music state to localStorage
        localStorage.setItem('globalMusic', JSON.stringify({
            isPlaying: this.isPlaying,
            currentSong: this.currentSong === this.song1 ? 1 : 2,
            volume: this.volume
        }));
    }
    
    loadState() {
        // Load music state from localStorage
        const saved = localStorage.getItem('globalMusic');
        if (saved) {
            const state = JSON.parse(saved);
            this.isPlaying = state.isPlaying;
            this.currentSong = state.currentSong === 1 ? this.song1 : this.song2;
            this.volume = state.volume || 0.3;
            
            // If music was playing, resume
            if (this.isPlaying) {
                this.currentSong.play().catch(() => {
                    this.isPlaying = false;
                });
            }
        }
    }
}

// Initialize global music player
window.globalMusic = new GlobalMusicPlayer();
