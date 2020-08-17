const express = require('express');
const tourController = require('./../controllers/tourControllers');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();

router.use('/:tourid/reviews', reviewRouter);

// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
//tours-distance/20/center/-45,45/unit/mi

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.deleteTour
  );

module.exports = router;
