const BASE = "https://YOUR_COMPOSITE_URL/composite";

// ----- MOVIES -----
async function loadMovies() {
    const res = await fetch(`${BASE}/movies/1`); // update when MS2 ready
    const data = await res.json();
    document.getElementById("movie-list").innerHTML =
        `<li>${JSON.stringify(data)}</li>`;
}

// ----- REVIEWS -----
async function loadReviews() {
    const res = await fetch(`${BASE}/reviews`);
    const data = await res.json();

    const list = document.getElementById("review-list");
    list.innerHTML = "";

    data.forEach(r => {
        const li = document.createElement("li");
        li.textContent = JSON.stringify(r);
        list.appendChild(li);
    });
}

async function submitReview() {
    const payload = {
        user_id: document.getElementById("user-id").value,
        movie_id: document.getElementById("movie-id").value,
        rating: parseInt(document.getElementById("rating").value)
    };

    const res = await fetch(`${BASE}/reviews`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    alert("Review submitted: " + JSON.stringify(data));
}

// ----- USERS -----
async function loadUser() {
    const id = document.getElementById("user-id-input").value;
    const res = await fetch(`${BASE}/users/${id}`);
    const data = await res.json();
    document.getElementById("user-output").textContent =
        JSON.stringify(data, null, 2);
}
