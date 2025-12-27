/**
 * Student Dashboard - Quiz Management Interface
 * Handles welcome overlay, filters, and navigation
 */

/**
 * Close welcome overlay
 */
function closeWelcome() {
    const overlay = document.getElementById('welcomeOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 600);
    }
}

/**
 * Toggle user menu with logout confirmation
 */
function toggleUserMenu() {
    if (confirm('Do you want to logout?')) {
        globalThis.location.href = djangoData.logoutUrl;
    }
}

/**
 * View quiz details
 * @param {number} quizId - Quiz ID
 */
function viewQuizDetails(quizId) {
    alert(`Viewing details for Quiz ID: ${quizId}\n\nThis will show quiz information, requirements, and preparation tips.`);
}

/**
 * Filter results functionality
 */
const filterButtons = document.querySelectorAll('.filter-btn');
for (const btn of filterButtons) {
    btn.addEventListener('click', function() {
        // Update active button
        for (const b of filterButtons) {
            b.classList.remove('active');
        }
        this.classList.add('active');

        const filter = this.dataset.filter;
        const rows = document.querySelectorAll('#resultsTableBody tr');

        for (const row of rows) {
            if (filter === 'all') {
                row.style.display = '';
            } else {
                const status = row.dataset.status;
                row.style.display = status === filter ? '' : 'none';
            }
        }
    });
}

/**
 * Video background fallback
 */
const video = document.querySelector('.video-background video');
if (video) {
    video.addEventListener('error', () => {
        console.log('Video failed to load. Using gradient background.');
        const videoBg = document.querySelector('.video-background');
        if (videoBg) {
            videoBg.style.display = 'none';
        }
    });
}

/**
 * Smooth scroll for anchor links
 */
const anchorLinks = document.querySelectorAll('a[href^="#"]');
for (const anchor of anchorLinks) {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

/**
 * Auto-hide welcome overlay after 3 seconds if not closed
 */
setTimeout(() => {
    const overlay = document.getElementById('welcomeOverlay');
    if (overlay && !overlay.classList.contains('hidden')) {
        closeWelcome();
    }
}, 3000);
