const express = require('express');
const router = express.Router();
const provincesController = require('../controllers/provincesController');

/**
 * Provinces Routes
 * Routes for province and district management
 */

// GET /api/provinces - Get all provinces with their districts
router.get('/', provincesController.getProvincesWithDistricts);

// GET /api/provinces/:provinceId - Get a specific province with its districts
router.get('/:provinceId', provincesController.getProvinceWithDistricts);

module.exports = router;