import express from 'express';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import session from 'express-session';
import flash from 'connect-flash';
import dotenv from 'dotenv';

dotenv.config({ path: 'process.env' });

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Flash messages middleware
app.use(flash());

// Global flash messages variable
app.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    next();
});

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Route for the 'stats' page
app.get('/stats', (req, res) => {
  res.render('stats');
});

// Import and use routes from the 'routes' file
import routes from './routes/routes.js';
app.use('/', routes);

// Route for the 'results' page
app.get('/results', (req, res) => {
    // Fetch movie data (replace this with your actual data fetching logic)
    const movie = {
        Title: 'Movie Title',
        Poster: 'path/to/poster.jpg'
        // Add other properties as needed
    };

    // Render the results page with the movie object
    res.render('results', { movie }); // Adjust this based on your template engine and file structure
});

// Define the port for the server
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Additional middleware for form handling
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Route for redirecting to the home page (modify as needed)
app.get('/reviews', (req, res) => {
  res.redirect('/'); // Change '/' to the desired path
});
