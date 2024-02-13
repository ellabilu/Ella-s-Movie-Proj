import express from 'express';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import session from 'express-session';
import flash from 'connect-flash';
import dotenv from 'dotenv';

dotenv.config({ path: 'process.env' });

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());



app.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    next();
});

app.set('view engine', 'ejs');

app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

app.get('/stats', (req, res) => {
  res.render('stats');
});

import routes from './routes/routes.js';
app.use('/', routes);


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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

app.get('/reviews', (req, res) => {
  res.redirect('/'); // Change '/' to the desired path
});