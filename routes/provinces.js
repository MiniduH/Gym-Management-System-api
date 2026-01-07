const express = require('express');
const router = express.Router();
const provincesController = require('../controllers/provincesController');
const { auth } = require('../middleware/auth');

/**
 * Provinces Routes
 * Routes for province and district management
 */

// GET /api/provinces - Get all provinces with their districts
router.get('/', auth, provincesController.getProvincesWithDistricts);

// GET /api/provinces/:provinceId - Get a specific province with its districts
router.get('/:provinceId', auth, provincesController.getProvinceWithDistricts);

module.exports = router;