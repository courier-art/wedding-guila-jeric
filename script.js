// ============================================
// WAIT FOR DOM TO BE FULLY LOADED
// Ensures all HTML elements are available before running scripts
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // NAVIGATION ELEMENTS
    // Get references to navigation components
    // ============================================
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    // Get current page filename for active link highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // ============================================
    // CREATE OVERLAY FOR MOBILE MENU
    // Semi-transparent background when menu is open
    // ============================================
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
    
    // ============================================
    // SET ACTIVE NAVIGATION LINK
    // Highlights the current page in the navigation
    // ============================================
    if (navLinks) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    }
    
    // ============================================
    // MOBILE MENU TOGGLE FUNCTION
    // Opens/closes mobile navigation menu
    // ============================================
    function toggleMobileMenu() {
        if (navLinks) {
            // Toggle active class on menu and overlay
            navLinks.classList.toggle('active');
            overlay.classList.toggle('active');
            
            // Prevent body scrolling when menu is open
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
            
            // Change hamburger icon to X and vice versa
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    }
    
    // ============================================
    // MOBILE MENU BUTTON CLICK EVENT
    // Triggers when hamburger menu is tapped
    // ============================================
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();      // Prevent default link behavior
            e.stopPropagation();     // Prevent event from bubbling up
            toggleMobileMenu();
        });
    }
    
    // ============================================
    // CLOSE MENU WHEN CLICKING OVERLAY
    // Tapping outside menu closes it
    // ============================================
    overlay.addEventListener('click', function() {
        toggleMobileMenu();
    });
    
    // ============================================
    // CLOSE MENU WHEN CLICKING A NAV LINK
    // Menu closes after selecting a page
    // ============================================
    if (navLinks) {
        navLinks.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                // Only close menu on mobile devices
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        toggleMobileMenu();
                    }, 300); // Small delay for better UX
                }
            }
        });
    }
    
    // ============================================
    // NAVBAR SCROLL EFFECT
    // Adds shadow and reduces padding when scrolling down
    // ============================================
    window.addEventListener('scroll', function() {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
    
    // ============================================
    // CLOSE MENU ON WINDOW RESIZE
    // If resizing from mobile to desktop, close mobile menu
    // ============================================
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks && navLinks.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
    
    // ============================================
    // COUNTDOWN TIMER FOR HOME PAGE
    // Calculates days/hours/minutes/seconds until wedding
    // ============================================
    if (document.querySelector('.countdown-container')) {
        // Set wedding date: September 5, 2026 at 4:00 PM
        const weddingDate = new Date('September 5, 2026 16:00:00').getTime();
        
        function updateCountdown() {
            const now = new Date().getTime();
            const distance = weddingDate - now;
            
            // If wedding date has passed
            if (distance < 0) {
                document.querySelector('.countdown-container').innerHTML = 
                    '<div class="countdown-complete">We\'re Married!</div>';
                return;
            }
            
            // Calculate time units
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            // Update display elements
            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            
            if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
        }
        
        // Initial call and set interval to update every second
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
    
    // ============================================
    // LORDICON BELL ANIMATION
    // Controls the interactive bell animation
    // ============================================
    const lordIconDiv = document.querySelector('.lordicon-bell');
    if (lordIconDiv) {
        // Load Lordicon script dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.lordicon.com/lordicon.js';
        document.head.appendChild(script);
        
        // When Lordicon loads, configure the bell
        script.onload = function() {
            // Create Lordicon instance
            const bellIcon = lottie.loadAnimation({
                container: lordIconDiv,
                renderer: 'svg',
                loop: false,
                autoplay: false,
                path: 'https://cdn.lordicon.com/qtpaiyhf.json'
            });
            
            // Make bell clickable
            lordIconDiv.style.cursor = 'pointer';
            
            // Play animation on click
            lordIconDiv.addEventListener('click', function() {
                bellIcon.play();
                
                // Play bell sound (optional)
                const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-school-bell-789.mp3');
                audio.play().catch(e => console.log('Audio play failed:', e));
                
                // Reset animation after it completes
                setTimeout(() => {
                    bellIcon.goToAndStop(0, true);
                }, 2000);
            });
        };
    }
    
    // ============================================
    // RSVP FORM SUBMISSION
    // Handles form submission for Google Sheets backend
    // ============================================
    const rsvpForm = document.getElementById('rsvpForm');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Replace with your Google Apps Script URL
            const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            // Send data to Google Sheets (commented for testing)
            // Uncomment and add your scriptURL when ready
            /*
            fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(() => {
                alert('Thank you for your RSVP! We look forward to celebrating with you.');
                this.reset();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error submitting your RSVP. Please try again.');
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
            */
            
            // For testing (remove when implementing Google Sheets)
            // alert('Thank you for your RSVP! We look forward to celebrating with you.');
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
    
    // ============================================
    // MESSAGE FORM SUBMISSION
    // Handles guest messages on Wish Greetings page
    // ============================================
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const message = formData.get('message');
            
            // Create new message card
            const messagesGrid = document.querySelector('.messages-grid');
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card';
            messageCard.innerHTML = `
                <div class="message-author">${name}</div>
                <div class="message-date">Just now</div>
                <p>${message}</p>
            `;
            
            // Add message to top of grid
            messagesGrid.prepend(messageCard);
            
            // Reset form
            this.reset();
            
            // Show success message
            alert('Thank you for your message!');
        });
    }
    
    // ============================================
    // DYNAMIC GUEST NAME INPUTS FOR RSVP
    // Shows additional name fields based on guest count
    // ============================================
    const guestsSelect = document.getElementById('guests');
    if (guestsSelect) {
        const guestNamesContainer = document.getElementById('guestNamesContainer');
        const guestNamesInputs = document.getElementById('guestNamesInputs');
        
        guestsSelect.addEventListener('change', function() {
            const numGuests = parseInt(this.value);
            guestNamesInputs.innerHTML = '';
            
            if (numGuests > 1) {
                guestNamesContainer.style.display = 'block';
                
                // Create input fields for each additional guest
                for (let i = 2; i <= numGuests; i++) {
                    const div = document.createElement('div');
                    div.style.marginBottom = '0.5rem';
                    div.innerHTML = `
                        <input type="text" class="form-control" 
                               name="guest${i}" 
                               placeholder="Full name of guest ${i}"
                               required>
                    `;
                    guestNamesInputs.appendChild(div);
                }
            } else {
                guestNamesContainer.style.display = 'none';
            }
        });
    }
});
