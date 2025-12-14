// Base URL for composite service - update if running on different host/port
const BASE = "https://compositemicroservice-608197196549.us-central1.run.app/composite";

// Helper function to handle errors
async function handleResponse(res) {
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(error.detail || `HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
}

// ----- MOVIES -----
async function loadMovies(page = 1) {
    const list = document.getElementById("movie-list");
    const paginationContainer = document.getElementById("pagination-controls");
    if (!list) return;
    
    list.innerHTML = '<div class="loading">Loading movies</div>';
    if (paginationContainer) paginationContainer.innerHTML = '';
    
    try {
        const res = await fetch(`${BASE}/movies?page=${page}&page_size=12`);
        const data = await handleResponse(res);
        
        // Handle paginated response
        const movies = data.items || data;
        const total = data.total_items || data.total || movies.length;
        const currentPage = data.page || page;
        const pageSize = data.page_size || 12;
        const totalPages = data.total_pages || data.pages || Math.ceil(total / pageSize);
        
        if (movies.length === 0) {
            list.innerHTML = '<div class="empty-state">No movies found</div>';
            return;
        }
        
        list.innerHTML = "";
        movies.forEach(movie => {
            const card = document.createElement("div");
            card.className = "movie-card";
            card.innerHTML = `
                <div class="movie-card-header">
                    <div class="movie-title">${movie.title || 'Untitled Movie'}</div>
                </div>
                <div class="movie-card-body">
                    <div class="movie-meta">
                        ${movie.year ? `<span>📅 ${movie.year}</span>` : ''}
                        ${movie.genre ? `<span>🎭 ${movie.genre}</span>` : ''}
                    </div>
                    <div class="movie-id">Movie ID: ${movie.id}</div>
                    <div class="movie-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-small" onclick="viewMovieDetails(${movie.id})">View Details</button>
                        <button class="btn btn-small btn-secondary" onclick="generateShareCard(${movie.id})">Share Card</button>
                    </div>
                </div>
            `;
            list.appendChild(card);
        });
        
        // Render pagination controls
        if (paginationContainer && movies.length > 0) {
            renderPaginationControls(currentPage, totalPages, total);
        }
    } catch (error) {
        list.innerHTML = `<div class="message message-error">Error: ${error.message}</div>`;
        console.error("Error loading movies:", error);
    }
}

function renderPaginationControls(currentPage, totalPages, totalMovies) {
    const paginationContainer = document.getElementById("pagination-controls");
    if (!paginationContainer) return;
    
    const prevDisabled = currentPage <= 1;
    const nextDisabled = currentPage >= totalPages;
    
    paginationContainer.innerHTML = `
        <div class="pagination-info">
            <span>Page ${currentPage} of ${totalPages}</span>
            <span>Total: ${totalMovies} movies</span>
        </div>
        <div class="pagination-buttons">
            <button 
                class="btn btn-secondary" 
                onclick="loadMovies(${currentPage - 1})" 
                ${prevDisabled ? 'disabled' : ''}
            >
                ← Previous
            </button>
            <button 
                class="btn btn-secondary" 
                onclick="loadMovies(${currentPage + 1})" 
                ${nextDisabled ? 'disabled' : ''}
            >
                Next →
            </button>
        </div>
    `;
}

async function getMovie(movieId) {
    try {
        const res = await fetch(`${BASE}/movies/${movieId}`);
        return await handleResponse(res);
    } catch (error) {
        console.error("Error getting movie:", error);
        throw error;
    }
}

async function viewMovieDetails(movieId) {
    const list = document.getElementById("movie-list");
    if (!list) return;
    
    list.innerHTML = '<div class="loading">Loading movie details...</div>';
    
    try {
        const res = await fetch(`${BASE}/movie-details/${movieId}`);
        const data = await handleResponse(res);
        
        const movie = data.movie;
        const cast = data.cast_and_crew || [];
        const reviews = data.reviews?.items || [];
        
        let castHTML = '';
        if (cast.length > 0) {
            castHTML = '<ul style="list-style: none; padding: 0;">';
            cast.forEach(person => {
                castHTML += `<li style="padding: 0.5rem; background: rgba(255,255,255,0.05); margin-bottom: 0.5rem; border-radius: 5px;">
                    <strong>${person.name}</strong> - ${person.role_type || person.role}${person.character_name ? ` as "${person.character_name}"` : ''}
                </li>`;
            });
            castHTML += '</ul>';
        } else {
            castHTML = '<p style="color: #999;">No cast/crew information available</p>';
        }
        
        let reviewsHTML = '';
        if (reviews.length > 0) {
            reviews.forEach(review => {
                const stars = '⭐'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                reviewsHTML += `
                    <div style="padding: 1rem; background: rgba(255,255,255,0.05); margin-bottom: 1rem; border-radius: 5px; border-left: 3px solid var(--accent-color);">
                        <div style="margin-bottom: 0.5rem;">
                            <strong>${stars}</strong> (${review.rating}/5)
                        </div>
                        <p style="margin: 0.5rem 0;">${review.comment}</p>
                        <small style="color: #999;">By User ${review.user_id} on ${new Date(review.created_at).toLocaleDateString()}</small>
                    </div>
                `;
            });
        } else {
            reviewsHTML = '<p style="color: #999;">No reviews yet. Be the first to review!</p>';
        }
        
        list.innerHTML = `
            <div class="card" style="max-width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <h2 style="color: var(--accent-color); margin: 0;">${movie.title} (${movie.year})</h2>
                    <button class="btn btn-secondary" onclick="loadMovies()">← Back to List</button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div>
                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 0.3rem;">Genre</div>
                        <div style="color: var(--text-light);">${movie.genre || 'N/A'}</div>
                    </div>
                    <div>
                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 0.3rem;">Movie ID</div>
                        <div style="color: var(--text-light); font-family: monospace;">${movie.id}</div>
                    </div>
                    <div>
                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 0.3rem;">Status</div>
                        <div style="color: var(--text-light);">${movie.processing_status || 'N/A'}</div>
                    </div>
                </div>
                
                <h3 style="color: var(--accent-color); margin-top: 2rem; margin-bottom: 1rem;">Cast & Crew</h3>
                ${castHTML}
                
                <h3 style="color: var(--accent-color); margin-top: 2rem; margin-bottom: 1rem;">Reviews (${reviews.length})</h3>
                ${reviewsHTML}
            </div>
        `;
    } catch (error) {
        list.innerHTML = `<div class="message message-error">Error loading movie details: ${error.message}</div>`;
        console.error("Error loading movie details:", error);
    }
}

async function generateShareCard(movieId) {
    try {
        const res = await fetch(`${BASE}/movies/${movieId}/generate-share-card`, {
            method: "POST"
        });
        const data = await handleResponse(res);
        
        if (data.job_id) {
            alert(`Share card generation started! Job ID: ${data.job_id}\n\nPolling for status...`);
            pollShareCardStatus(movieId, data.job_id);
        } else {
            alert(`Share card generated! Check the response: ${JSON.stringify(data)}`);
        }
    } catch (error) {
        alert(`Failed to generate share card: ${error.message}`);
        console.error("Error generating share card:", error);
    }
}

async function pollShareCardStatus(movieId, jobId, maxAttempts = 10) {
    let attempts = 0;
    
    const poll = async () => {
        try {
            const res = await fetch(`${BASE}/movies/${movieId}/share-card-jobs/${jobId}`);
            const data = await handleResponse(res);
            
            if (data.status === 'COMPLETED') {
                alert(`✅ Share card completed!\n\nCard URL: ${data.card_url || 'N/A'}`);
                return;
            } else if (data.status === 'PROCESSING' || data.status === 'PENDING') {
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 2000); // Poll every 2 seconds
                } else {
                    alert(`⏱️ Share card still processing after ${maxAttempts} attempts. Status: ${data.status}`);
                }
            } else {
                alert(`Share card status: ${data.status}`);
            }
        } catch (error) {
            console.error("Error polling share card status:", error);
            alert(`Error checking share card status: ${error.message}`);
        }
    };
    
    poll();
}

// ----- REVIEWS -----
async function loadReviews() {
    const list = document.getElementById("review-list");
    if (!list) return;
    
    list.innerHTML = '<div class="loading">Loading reviews</div>';
    
    try {
        const res = await fetch(`${BASE}/reviews?page=1&page_size=40`);
        const data = await handleResponse(res);
        
        // Handle paginated response structure
        const reviews = data.items || (Array.isArray(data) ? data : []);
        
        if (reviews.length === 0) {
            list.innerHTML = '<div class="empty-state">No reviews found. Be the first to review!</div>';
            return;
        }
        
        list.innerHTML = "";
        reviews.forEach(review => {
            const card = document.createElement("div");
            card.className = "review-card";
            
            // Create star rating display
            let starsHTML = "";
            for (let i = 1; i <= 5; i++) {
                starsHTML += `<span class="star ${i <= review.rating ? '' : 'empty'}">${i <= review.rating ? '⭐' : '☆'}</span>`;
            }
            
            card.innerHTML = `
                <div class="review-header">
                    <div>
                        <strong style="color: var(--accent-color); font-size: 1.1rem;">Review #${review.id}</strong>
                        <div class="review-rating">${starsHTML}</div>
                    </div>
                </div>
                <div class="review-comment">${review.comment || 'No comment provided'}</div>
                <div class="review-meta">
                    Movie ID: ${review.movie_id} | User ID: ${review.user_id} | 
                    ${new Date(review.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
                <div class="review-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-small" onclick="viewReview(${review.id})">View</button>
                    <button class="btn btn-small btn-secondary" onclick="deleteReview(${review.id})">Delete</button>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (error) {
        list.innerHTML = `<div class="message message-error">Error: ${error.message}</div>`;
        console.error("Error loading reviews:", error);
    }
}

async function viewReview(reviewId) {
    try {
        const res = await fetch(`${BASE}/reviews/${reviewId}`);
        const data = await handleResponse(res);
        
        const stars = '⭐'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
        alert(`Review #${data.id}\n\nRating: ${stars} (${data.rating}/5)\n\nComment: ${data.comment}\n\nMovie ID: ${data.movie_id}\nUser ID: ${data.user_id}\n\nCreated: ${new Date(data.created_at).toLocaleString()}`);
    } catch (error) {
        alert(`Error loading review: ${error.message}`);
        console.error("Error viewing review:", error);
    }
}

async function deleteReview(reviewId) {
    if (!confirm(`Are you sure you want to delete review #${reviewId}?`)) {
        return;
    }
    
    try {
        const res = await fetch(`${BASE}/reviews/${reviewId}`, {
            method: "DELETE"
        });
        
        if (res.ok) {
            alert(`✅ Review #${reviewId} deleted successfully!`);
            loadReviews();
        } else {
            const error = await res.json().catch(() => ({ detail: res.statusText }));
            throw new Error(error.detail || `HTTP ${res.status}: ${res.statusText}`);
        }
    } catch (error) {
        alert(`❌ Error deleting review: ${error.message}`);
        console.error("Error deleting review:", error);
    }
}

// ----- USERS -----

function showUpdateUserForm(userId) {
    const formDiv = document.getElementById("update-user-form");
    if (!formDiv) return;
    
    formDiv.style.display = "block";
    formDiv.innerHTML = `
        <div class="card" style="background: rgba(255,255,255,0.05);">
            <h3 style="color: var(--accent-color); margin-bottom: 1rem;">Update Profile</h3>
            <div class="form-group">
                <label for="update-fullname">Full Name</label>
                <input id="update-fullname" type="text" placeholder="Enter full name">
            </div>
            <div class="form-group">
                <label for="update-email">Email</label>
                <input id="update-email" type="email" placeholder="Enter email">
            </div>
            <button class="btn" onclick="updateUser('${userId}')">Update</button>
            <button class="btn btn-secondary" onclick="document.getElementById('update-user-form').style.display='none'">Cancel</button>
        </div>
    `;
}

async function updateUser(userId) {
    const fullName = document.getElementById("update-fullname").value;
    const email = document.getElementById("update-email").value;
    
    if (!fullName && !email) {
        alert("Please enter at least one field to update");
        return;
    }
    
    const payload = {};
    if (fullName) payload.full_name = fullName;
    if (email) payload.email = email;
    
    try {
        const token = localStorage.getItem('auth_token');
        const headers = {"Content-Type": "application/json"};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        
        const res = await fetch(`${BASE}/users/${userId}`, {
            method: "PATCH",
            headers: headers,
            body: JSON.stringify(payload)
        });
        
        const data = await handleResponse(res);
        alert(`✅ Profile updated successfully!`);
        loadUser(); // Reload user data
    } catch (error) {
        alert(`❌ Error updating profile: ${error.message}`);
        console.error("Error updating user:", error);
    }
}

async function deleteUser(userId) {
    if (!confirm(`Are you sure you want to delete your account? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('auth_token');
        const headers = {"Content-Type": "application/json"};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        
        const res = await fetch(`${BASE}/users/${userId}`, {
            method: "DELETE",
            headers: headers
        });
        
        if (res.ok || res.status === 204) {
            alert(`✅ Account deleted successfully!`);
            localStorage.removeItem('auth_token');
            document.getElementById("user-output").innerHTML = '<div class="message message-info">Account deleted. Please register again to create a new account.</div>';
        } else {
            const error = await res.json().catch(() => ({ detail: res.statusText }));
            throw new Error(error.detail || `HTTP ${res.status}: ${res.statusText}`);
        }
    } catch (error) {
        alert(`❌ Error deleting account: ${error.message}`);
        console.error("Error deleting user:", error);
    }
}

// ----- AUTHENTICATION -----
async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const resultDiv = document.getElementById("login-result");
    
    if (!email || !password) {
        resultDiv.innerHTML = '<div class="message message-error">Please enter email and password</div>';
        return;
    }
    
    resultDiv.innerHTML = '<div class="loading">Logging in</div>';
    
    try {
        const res = await fetch(`${BASE}/sessions`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password })
        });
        
        const data = await handleResponse(res);
        
        // Store token for future requests
        if (data.access_token) {
            localStorage.setItem('auth_token', data.access_token);
            resultDiv.innerHTML = '<div class="message message-success">✅ Login successful! Redirecting to profile...</div>';
            setTimeout(() => {
                window.location.href = 'users.html';
            }, 1000);
        } else {
            resultDiv.innerHTML = '<div class="message message-info">⚠️ Login response received but no token found</div>';
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="message message-error">❌ Login failed: ${error.message}</div>`;
        console.error("Error logging in:", error);
    }
}

// ----- GOOGLE OAUTH -----
async function loginWithGoogle() {
    const resultDiv = document.getElementById("login-result");
    if (resultDiv) {
        resultDiv.innerHTML = '<div class="loading">Connecting to Google</div>';
    }
    
    try {
        const res = await fetch(`${BASE}/auth/google/url`);
        const data = await handleResponse(res);

        sessionStorage.setItem('google_oauth_state', data.state);
        
        // Redirect to Google OAuth
        window.location.href = data.auth_url;
    } catch (error) {
        if (resultDiv) {
            resultDiv.innerHTML = `<div class="message message-error">Failed to connect to Google: ${error.message}</div>`;
        }
        console.error("Error initiating Google OAuth:", error);
    }
}

// Handle Google OAuth callback
function handleGoogleCallback() {
    const params = new URLSearchParams(window.location.search);
    const googleAuth = params.get('google_auth');
    
    if (googleAuth === 'success') {
        const accessToken = params.get('access_token');
        const resultDiv = document.getElementById("login-result");
        
        if (accessToken) {
            localStorage.setItem('auth_token', accessToken);
            
            const googleToken = params.get('google_token');
            if (googleToken) {
                localStorage.setItem('google_token', googleToken);
            }
            
            if (resultDiv) {
                resultDiv.innerHTML = '<div class="message message-success">✅ Google login successful! Redirecting to profile...</div>';
            }
            
            window.history.replaceState({}, '', 'login.html');
            setTimeout(() => {
                window.location.href = 'users.html';
            }, 1000);
        } else {
            if (resultDiv) {
                resultDiv.innerHTML = '<div class="message message-error">❌ Google login failed: No access token received</div>';
            }
        }
    } else if (googleAuth === 'error') {
        const errorMsg = params.get('error') || 'Unknown error';
        const resultDiv = document.getElementById("login-result");
        if (resultDiv) {
            resultDiv.innerHTML = `<div class="message message-error">❌ Google login failed: ${errorMsg}</div>`;
        }
        window.history.replaceState({}, '', 'login.html');
    }
}

async function register() {
    const email = document.getElementById("reg-email").value;
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;
    const fullName = document.getElementById("reg-fullname").value;
    const resultDiv = document.getElementById("register-result");
    
    if (!email || !username || !password) {
        resultDiv.innerHTML = '<div class="message message-error">Please enter email, username, and password</div>';
        return;
    }
    
    if (password.length < 6) {
        resultDiv.innerHTML = '<div class="message message-error">Password must be at least 6 characters</div>';
        return;
    }
    
    resultDiv.innerHTML = '<div class="loading">Creating account</div>';
    
    try {
        const payload = { email, username, password };
        if (fullName) {
            payload.full_name = fullName;
        }
        
        const res = await fetch(`${BASE}/users`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload)
        });
        
        const data = await handleResponse(res);
        resultDiv.innerHTML = `<div class="message message-success">✅ Registration successful! Your User ID: <strong>${data.id}</strong><br><small>You can now login with your credentials.</small></div>`;
        
        // Clear form
        document.getElementById("reg-email").value = "";
        document.getElementById("reg-username").value = "";
        document.getElementById("reg-password").value = "";
        document.getElementById("reg-fullname").value = "";
    } catch (error) {
        resultDiv.innerHTML = `<div class="message message-error">❌ Registration failed: ${error.message}</div>`;
        console.error("Error registering:", error);
    }
}

// ----- HEALTH CHECK -----
async function checkHealth() {
    try {
        const res = await fetch(`${BASE}/health`);
        const data = await handleResponse(res);
        alert(`✅ Service is healthy!\n\nStatus: ${data.status || 'OK'}`);
        return data;
    } catch (error) {
        alert(`❌ Health check failed: ${error.message}`);
        console.error("Error checking health:", error);
        return null;
    }
}

// ----- PROFILE PAGE -----
// Helper function to decode JWT token and extract user info
function decodeToken(token) {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
}

async function loadProfile() {
    const token = localStorage.getItem('auth_token');
    const output = document.getElementById("user-output");
    const reviewSection = document.getElementById("write-review-section");
    
    if (!token) {
        output.innerHTML = `
            <div class="message message-info">
                🔒 Please login to view user's information. <a href="login.html" style="color: var(--accent-color);">Login here</a>
            </div>
        `;
        if (reviewSection) {
            reviewSection.style.display = 'none';
        }
        return;
    }
    
    if (reviewSection) {
        reviewSection.style.display = 'block';
    }
    
    const tokenData = decodeToken(token);
    const userId = tokenData?.user_id || tokenData?.sub || tokenData?.id;
    
    if (!userId) {
        output.innerHTML = `
            <div class="message message-error">
                ❌ Unable to retrieve user information from token. Please <a href="login.html" style="color: var(--accent-color);">login again</a>.
            </div>
        `;
        return;
    }
    
    window.currentUserId = userId;
    
    output.innerHTML = '<div class="loading">Loading user profile</div>';
    
    try {
        const headers = {"Content-Type": "application/json"};
        headers["Authorization"] = `Bearer ${token}`;
        
        const res = await fetch(`${BASE}/users/${userId}`, { headers });
        const data = await handleResponse(res);
        
        output.innerHTML = `
            <div class="card">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%); display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">
                        👤
                    </div>
                    <div>
                        <h2 style="color: var(--accent-color); margin-bottom: 0.5rem;">${data.full_name || data.username || 'User'}</h2>
                        <div style="color: #999; font-size: 0.9rem;">@${data.username}</div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
                    <div>
                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 0.3rem;">Email</div>
                        <div style="color: var(--text-light);">${data.email}</div>
                    </div>
                    <div>
                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 0.3rem;">User ID</div>
                        <div style="color: var(--text-light); font-family: monospace; font-size: 0.9rem;">${data.id}</div>
                    </div>
                    <div>
                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 0.3rem;">Status</div>
                        <div style="color: ${data.is_active ? 'var(--success-color)' : '#999'};">
                            ${data.is_active ? '✅ Active' : '❌ Inactive'}
                        </div>
                    </div>
                    <div>
                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 0.3rem;">Member Since</div>
                        <div style="color: var(--text-light); font-size: 0.9rem;">
                            ${new Date(data.created_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                    <button class="btn" onclick="showUpdateUserForm('${data.id}')">Update Profile</button>
                    <button class="btn btn-secondary" onclick="deleteUser('${data.id}')">Delete Account</button>
                    <button class="btn btn-secondary" onclick="logout()">Logout</button>
                </div>
                
                <div id="update-user-form" style="margin-top: 2rem; display: none;"></div>
            </div>
        `;
    } catch (error) {
        output.innerHTML = `
            <div class="message message-error">
                ❌ Error: ${error.message}<br><br>
                <small>Please try <a href="login.html" style="color: var(--accent-color);">logging in again</a>.</small>
            </div>
        `;
        console.error("Error loading profile:", error);
    }
}

async function logout() {
    const token = localStorage.getItem('auth_token');
    const googleToken = localStorage.getItem('google_token');
    
    if (googleToken && token) {
        try {
            await fetch(`${BASE}/auth/google/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ google_token: googleToken })
            });
        } catch (e) {
            console.warn('Failed to revoke Google token:', e);
        }
    }
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('google_token');
    window.location.href = 'login.html';
}

async function submitProfileReview() {
    const token = localStorage.getItem('auth_token');
    const resultDiv = document.getElementById("profile-submit-result");
    
    if (!token) {
        resultDiv.innerHTML = '<div class="message message-error">🔒 Please login to write a review. <a href="login.html" style="color: var(--accent-color);">Login here</a></div>';
        return;
    }
    
    const tokenData = decodeToken(token);
    const userId = tokenData?.user_id || tokenData?.sub || tokenData?.id || window.currentUserId;
    
    if (!userId) {
        resultDiv.innerHTML = '<div class="message message-error">❌ Unable to identify user. Please <a href="login.html" style="color: var(--accent-color);">login again</a>.</div>';
        return;
    }
    
    const movie_id = document.getElementById("profile-movie-id").value;
    const rating = parseInt(document.getElementById("profile-rating").value);
    const comment = document.getElementById("profile-comment").value;
    
    if (!movie_id || !rating || !comment) {
        resultDiv.innerHTML = '<div class="message message-error">Please fill in all fields (Movie ID, Rating, and Comment)</div>';
        return;
    }
    
    if (rating < 1 || rating > 5) {
        resultDiv.innerHTML = '<div class="message message-error">Rating must be between 1 and 5</div>';
        return;
    }
    
    resultDiv.innerHTML = '<div class="loading">Submitting review</div>';
    
    const payload = {
        user_id: parseInt(userId),
        movie_id: parseInt(movie_id),
        rating: rating,
        comment: comment
    };
    
    try {
        const res = await fetch(`${BASE}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        const data = await handleResponse(res);
        resultDiv.innerHTML = `<div class="message message-success">✅ Review submitted successfully! Review ID: ${data.id}</div>`;
        
        document.getElementById("profile-movie-id").value = "";
        document.getElementById("profile-rating").value = "";
        document.getElementById("profile-comment").value = "";
    } catch (error) {
        resultDiv.innerHTML = `<div class="message message-error">❌ Error: ${error.message}</div>`;
        console.error("Error submitting review:", error);
    }
}
