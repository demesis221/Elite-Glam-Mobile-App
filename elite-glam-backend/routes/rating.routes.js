const express = require('express');
const router = express.Router();
const {
  createRating,
  getProductRatings,
} = require('../controllers/rating.controller');
const { protect } = require('../middleware/auth.middleware');

// These routes will be mounted at /api/ratings
router.route('/')
  .post(protect, createRating);

router.route('/:productId')
  .get(getProductRatings);

module.exports = router;
