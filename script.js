document.addEventListener('DOMContentLoaded', () => {

    // --- App State & DOM Elements ---
    const app = {
        // This is where the data from movies.json will be stored
        movies: [],
        // DOM element references
        elements: {
            root: document.getElementById('app-root'),
            homePage: document.getElementById('home-page'),
            playerPage: document.getElementById('player-page'),
            movieGrid: document.querySelector('#home-page .movie-grid'),
            headerTitle: document.querySelector('.header-title'),
        }
    };

    /**
     * Simple hash-based router to handle page changes.
     */
    function router() {
        const hash = location.hash;
        if (hash.startsWith('#movie=')) {
            const movieId = hash.substring(7);
            renderPlayerPage(movieId);
        } else {
            renderHomePage();
        }
    }

    // --- Functions ---

    /**
     * Renders the homepage with a grid of movie cards.
     */
    function renderHomePage() {
        app.elements.movieGrid.innerHTML = ''; // Clear existing grid
        app.movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.dataset.movieId = movie.id;
            card.innerHTML = `
                <img src="${movie.thumbnail}" alt="Thumbnail for ${movie.title}">
                <h3 class="card-title">${movie.title}</h3>
            `;
            card.addEventListener('click', () => navigateToPlayer(movie.id));
            app.elements.movieGrid.appendChild(card);
        });
        showPage('home-page');
    }

    /**
     * Renders the player page for a specific movie.
     * @param {string} movieId - The ID of the movie to play.
     */
    function renderPlayerPage(movieId) {
        const movie = app.movies.find(m => m.id === movieId);
        if (!movie) {
            // If movie not found, go back home
            navigateToHome();
            return;
        }

        app.elements.playerPage.innerHTML = `
            <button class="back-button">&larr; Back to Movies</button>
            <div class="video-player-wrapper">
                <video class="video-player" src="${movie.name}" controls autoplay></video>
            </div>
            <h2 class="movie-title">${movie.title}</h2>
            <p class="movie-description">${movie.description}</p>
        `;
        
        app.elements.playerPage.querySelector('.back-button').addEventListener('click', navigateToHome);
        showPage('player-page');
    }

    /**
     * Shows the specified page and hides others.
     * @param {string} pageId - The ID of the page element to show.
     */
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.toggle('active', page.id === pageId);
        });
    }

    // --- Navigation ---

    function navigateToPlayer(movieId) {
        location.hash = `movie=${movieId}`;
    }

    /**
     * Navigates to the home page and stops any playing video.
     */
    function navigateToHome() {
        const videoPlayer = app.elements.playerPage.querySelector('.video-player');
        
        // BUG FIX: If a video player exists, stop its playback before navigating.
        if (videoPlayer) {
            videoPlayer.pause();
            videoPlayer.src = ''; // Unload the video to free up memory
        }
        
        // ALSO: Immediately clear the player page content to ensure the video element is removed from the DOM.
        app.elements.playerPage.innerHTML = '';

        // Proceed with navigation
        location.hash = '';
    }
    
    // --- Event Listeners ---
    
    // Listen for hash changes to navigate between pages
    window.addEventListener('hashchange', router);
    
    // Make header title clickable to go home
    app.elements.headerTitle.addEventListener('click', navigateToHome);

    // --- Initial Load ---
    // Fetch movie data from the JSON file, then initialize the router
    fetch('movies.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            app.movies = data;
            router(); // Call router after data is successfully loaded
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            app.elements.movieGrid.innerHTML = `<p>Error loading movies. Please check the console.</p>`;
            showPage('home-page');
        });
});
