import express from 'express';
import * as mainController from '../controllers/mainController.js';

const router = express.Router();

// Home page route
router.get('/', mainController.showMovies);

// Movie actions
router.post('/search', mainController.searchMovies);
router.post('/save', mainController.saveMovie);
router.get('/watch/:id', mainController.watchMovie);
router.post('/watch/:id', mainController.watchMovie);
router.get('/delete/:id', mainController.deleteMovie);
//router.post('/delete/:id', mainController.deleteMovie);
router.post('/watch/:id/decrease', mainController.decreaseWatchCount);
router.get('/details/:id', mainController.showMovieDetails);

// Sorting routes
router.post('/sort', mainController.sortMovies);
router.post('/sort/rating', mainController.sortMovies);

// Review actions
router.post('/saveReview', mainController.saveReview);
router.post('/saveReview/:id', mainController.saveReview);
router.post('/rate/:id', mainController.rateMovie);

// Reviews page
router.get('/allReviews', mainController.showAllReviews);

export default router;



