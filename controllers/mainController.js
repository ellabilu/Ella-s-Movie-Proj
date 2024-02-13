import Movie from '../models/Movie.js';
import fetch from 'node-fetch';

// Variables for storing aggregated data
let savedMovies, totalMovies, totalTimesWatched, sortCriteria;

// Controller to show all movies
export const showMovies = async (req, res) => {
  // Aggregate data before fetching movies
  await aggregateMoviesData();
  
  // Fetch movies and render the index view
  savedMovies = await Movie.find().sort(sortCriteria);
  res.render('index', { savedMovies, totalMovies, totalTimesWatched });
};

// Controller to search for a movie using the OMDB API
export const searchMovies = async (req, res) => {
  const movieTitle = req.body.movieTitle;

  try {
    // Fetch movie data from OMDB API
    const response = await fetch(`http://www.omdbapi.com/?t=${movieTitle}&apikey=${process.env.MOVIE_KEY}`);
    const movie = await response.json();

    // Render results or send 404 if movie not found
    if (movie.Response === 'True') {
      res.render('results', { movie });
    } else {
      res.status(404).send('Movie not found');
    }
  } catch (error) {
    // Handle errors during data fetching
    console.error(error);
    res.status(500).send('Error fetching data');
  }
};

// Controller to save a movie
export const saveMovie = async (req, res) => {
  const { title, poster, director, year, boxOffice } = req.body;

  try {
    // Check if movie exists, update timesWatched, or create a new movie
    let movie = await Movie.findOne({ title: title });

    if (movie) {
      movie.timesWatched += 1;
      await movie.save();
    } else {
      movie = new Movie({
        title,
        poster,
        director,
        year,
        boxOffice,
        timesWatched: 1
      });
      await movie.save();
    }

    console.log('Movie saved successfully:', movie);
    res.redirect('/');
  } catch (error) {
    // Handle errors during movie saving
    console.error('Error saving movie:', error);
    res.status(500).send(`Error saving movie: ${error.message}`);
  }
};

// Example watchMovie controller
export const watchMovie = async (req, res) => {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findById(movieId);
    if (movie) {
      movie.timesWatched += 1;
      await movie.save();
      req.flash('update', `You watched ${movie.title}. Did you know it grossed ${movie.boxOffice} at the box office?!`);
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

// Example deleteMovie controller
export const deleteMovie = async (req, res) => {
  const movieId = req.params.id;

  req.flash('success', 'Movie deleted successfully');

  try {
    const result = await Movie.findByIdAndDelete(movieId);
    console.log(result);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error deleting movie');
    res.status(500).send('Error processing request');
  }
};


export const sortMovies = async (req, res) => {
  try {
    let sortCriteria;

    // Check the sortType parameter
    if (req.body.sortType === 'rating') {
      // Sort by ratings
      sortCriteria = { ratings: -1 };
    } else if (req.body.sortType === 'alphabetical') {
      // Sort alphabetically by title
      sortCriteria = { title: 1 };
    } else if (req.body.sortType === 'year') {
      // Sort by the year the movie came out
      sortCriteria = { year: 1 };
    } else {
      // Default sorting by timesWatched
      sortCriteria = { timesWatched: -1 };
    }

    // Fetch and render sorted movies
    const savedMovies = await Movie.find().sort(sortCriteria);
    res.render('index', { savedMovies, totalMovies, totalTimesWatched });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const rateMovie = async (req, res) => {
  const movieId = req.params.id;
  const { rating, review } = req.body;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).send('Movie not found');
    }

    console.log('Movie ID:', movieId);
    console.log('Rating:', rating);
    console.log('Review:', review);

    // Update ratings
    movie.ratings = movie.ratings ?? [];
    movie.ratings.push(Number(rating));

    // Save review with user and date
    movie.reviews = movie.reviews ?? [];
    movie.reviews.push({
      user: 'Anonymous', // You can modify this based on your user model or requirements
      text: review,
      date: new Date(), // Add the timestamp
    });

    await movie.save();

    console.log('Updated Ratings:', movie.ratings);
    console.log('Updated Reviews:', movie.reviews);

    const updatedMovie = await Movie.findById(movieId);
    console.log('Updated Movie:', updatedMovie);

    // Redirect to the reviews page or any other page as needed
    res.redirect('/reviews');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const saveReview = async (req, res) => {
  const movieId = req.params.id;
  const { review } = req.body;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).send('Movie not found');
    }

    console.log('Movie ID:', movieId);
    console.log('Review:', review);

    // Save review with user and date
    movie.reviews = movie.reviews ?? [];
    movie.reviews.push({
      user: 'Anonymous', // You can modify this based on your user model or requirements
      text: review,
      date: new Date(), // Add the timestamp
    });

    await movie.save();

    console.log('Updated Reviews:', movie.reviews);

    const updatedMovie = await Movie.findById(movieId);
    console.log('Updated Movie:', updatedMovie);

    // Redirect to the movie details page or any other page as needed
    res.redirect(`/movie/${movieId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const showAllReviews = async (req, res) => {
  try {
    const allReviews = await getAllReviews();
    res.render('reviews', { allReviews });
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error processing request: ${error.message}`);
  }
};


const aggregateMoviesData = async () => {
  try {
    const result = await Movie.aggregate([
      {
        $group: {
          _id: null,
          totalMovies: { $sum: 1 },
          totalTimesWatched: { $sum: "$timesWatched" }
        }
      }
    ]);

    if (result.length > 0) {
      totalMovies = result[0].totalMovies;
      totalTimesWatched = result[0].totalTimesWatched;
      console.log(`Total Movies: ${totalMovies}, Total Times Watched: ${totalTimesWatched}`);
    } else {
      console.log("No data found.");
    }
  } catch (error) {
    console.error("Error aggregating movie data:", error);
  }
};

// Inside your mainController.js



export const decreaseWatchCount = async (req, res) => {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findById(movieId);
      req.flash('update', `You unwatched ${movie.title}. Did you know it was directed by ${movie.director}?!`);
    
    if (movie && movie.timesWatched > 0) {
      movie.timesWatched -= 1;

      if (movie.timesWatched === 0) {
        // If watch count is 0, delete the movie
        await Movie.findByIdAndDelete(movieId);
      } else {
        await movie.save();
      }
    }

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

/*
export const showMovieInfo = async (req, res) => {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findOne({ _id: movieId });
    if (movie) {
      res.render('info', { movie });
    } else {
      res.status(404).send('Movie not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};
*/

// for movieDetails.ejs page
export const showMovieDetails = async (req, res) => {
  
  const movieId = req.params.id;

  try {
    const movie = await Movie.findOne({ _id: movieId });
    if (movie) {
      //res.json(req.params.id);
      res.render('info', { movie });
    } else {
      res.status(404).send('Movie not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};