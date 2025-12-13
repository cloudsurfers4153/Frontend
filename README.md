# Movie Platform Frontend

A simple HTML/JavaScript frontend for the Movie Platform microservices architecture. The frontend connects to the composite microservice which aggregates data from MS1 (Users), MS2 (Movies & People), and MS3 (Reviews).

## Quick Start

### Local Development

1. **Start the Composite Service**
   ```bash
   cd CompositeMicroservice
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. **Start the Frontend**
   ```bash
   cd Frontend
   python3 -m http.server 3000
   ```

3. **Open in Browser**
   ```
   http://localhost:3000
   ```

## Configuration

### Update API Endpoint

Edit `app.js` to point to your composite service:

```javascript
// For local development:
const BASE = "http://localhost:8000/composite";

// For deployed composite service:
const BASE = "https://your-composite-service.run.app/composite";
```

## Features

### 1. User Authentication (`login.html`)
- **Register**: Create new user accounts
- **Login**: Authenticate and receive JWT token
- Tokens stored in localStorage for authenticated requests

### 2. Movies (`movies.html`)
- **List Movies**: Browse movies with pagination
- Displays: title, year, genre, and ID
- Supports filtering and sorting (via composite service)

### 3. Reviews (`reviews.html`)
- **List Reviews**: View all reviews with ratings and comments
- **Submit Review**: Create new reviews
  - Validates foreign keys (movie and user must exist)
  - Rating: 1-5 stars
  - Required fields: User ID, Movie ID, Rating, Comment

### 4. Users (`users.html`)
- **Get User Profile**: View user information by ID
- Requires authentication (login first)

## Deployment to Google Cloud Storage

The frontend is deployed as a website on Google Cloud Storage.

### Prerequisites

1. **Install Google Cloud SDK**
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate**
   ```bash
   gcloud auth login
   gcloud config set project coms4153-cloud-surfers
   ```

### Deploy
**Manual deployment**
```bash
export PROJECT_ID="coms4153-cloud-surfers"
export BUCKET_NAME="movie-platform-frontend"

# Create bucket
gsutil mb -p $PROJECT_ID -c STANDARD -l us-central1 gs://$BUCKET_NAME

# Configure for static website
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Upload files
gsutil -m cp index.html *.html *.js *.css gs://$BUCKET_NAME/

# Set content types
gsutil -m setmeta -h "Content-Type:text/html" gs://$BUCKET_NAME/*.html
gsutil -m setmeta -h "Content-Type:text/css" gs://$BUCKET_NAME/*.css
gsutil -m setmeta -h "Content-Type:application/javascript" gs://$BUCKET_NAME/*.js
```

### Access Deployed Frontend

After deployment, your frontend is available at:
```
https://storage.googleapis.com/movie-platform-frontend/index.html
```

### Update After Composite Service Deployment

Once your composite service is deployed to Cloud Run:

1. **Update `app.js`** with the composite service URL:
   ```javascript
   const BASE = "https://your-composite-service.run.app/composite";
   ```

2. **Re-upload `app.js`**:
   ```bash
   gsutil cp app.js gs://movie-platform-frontend/app.js
   gsutil setmeta -h "Content-Type:application/javascript" gs://movie-platform-frontend/app.js
   ```

## Project Structure

```
Frontend/
├── index.html          # Home page with navigation
├── login.html          # User registration and login
├── movies.html         # Movies listing page
├── reviews.html        # Reviews listing and submission
├── users.html          # User profile viewer
├── app.js              # Main JavaScript (API calls and logic)
├── style.css           # Styling
├── deploy-frontend-only.sh  # Deployment script
└── README.md           # This file
```

## API Endpoints

The frontend communicates with the composite service at these endpoints:

- `POST /composite/sessions` - User login
- `POST /composite/users` - User registration
- `GET /composite/users/{id}` - Get user profile (requires auth)
- `GET /composite/movies` - List movies (with pagination)
- `GET /composite/reviews` - List reviews (with pagination)
- `POST /composite/reviews` - Create review (with FK validation)
- `GET /composite/movie-details/{id}` - Get aggregated movie details

## Troubleshooting

### Connection Errors
- **Symptom**: "Cannot connect to server" or "Load failed"
- **Solution**: 
  - Verify composite service is running
  - Check `BASE` URL in `app.js` is correct
  - Check browser console (F12) for detailed errors

### CORS Errors
- **Symptom**: CORS policy errors in browser console
- **Solution**: 
  - Make sure you're accessing via `http://localhost:3000` (not `file://`)
  - Verify CORS is enabled in composite service
  - For deployed frontend, ensure composite service allows your GCS bucket origin

### Authentication Errors
- **Symptom**: 401 Unauthorized when accessing user endpoints
- **Solution**:
  - Login first to get a token
  - Check localStorage for saved token
  - Token may have expired (login again)

### Foreign Key Validation Errors
- **Symptom**: Error when creating review about movie/user not existing
- **Solution**:
  - Ensure Movie ID exists in MS2
  - Ensure User ID exists in MS1
  - The composite service validates these automatically

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari

## Development Notes

- The frontend uses vanilla JavaScript (no frameworks)
- API calls use `fetch()` with async/await
- Error handling with user-friendly messages
- LocalStorage used for token persistence
- Responsive design with basic CSS

## Configuration Details

- **Project ID**: `coms4153-cloud-surfers`
- **Bucket Name**: `movie-platform-frontend`
- **Default API Endpoint**: `http://localhost:8000/composite`

## Next Steps

1. Deploy composite service to Cloud Run
2. Update `app.js` with composite service URL
3. Re-upload `app.js` to GCS bucket
4. Test all features end-to-end
