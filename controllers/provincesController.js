const { query } = require('../config/database');

/**
 * Provinces Controller
 * Handles province and district related operations
 */

/**
 * Get all provinces with their districts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProvincesWithDistricts = async (req, res) => {
  try {
    // Query to get provinces with their districts
    const provincesQuery = `
      SELECT
        p.id as province_id,
        p.province_name,
        p.province_code,
        json_agg(
          json_build_object(
            'id', d.id,
            'district_name', d.district_name,
            'district_code', d.district_code
          ) ORDER BY d.district_name
        ) as districts
      FROM provinces p
      LEFT JOIN districts d ON p.id = d.province_id
      GROUP BY p.id, p.province_name, p.province_code
      ORDER BY p.province_name;
    `;

    const result = await query(provincesQuery);

    // Transform the data to match the requested format
    const provinces = result.rows.map(row => ({
      id: row.province_id,
      province_name: row.province_name,
      province_code: row.province_code,
      districts: row.districts || []
    }));

    res.status(200).json({
      success: true,
      message: 'Provinces with districts retrieved successfully',
      data: provinces,
      count: provinces.length
    });

  } catch (error) {
    console.error('Error fetching provinces with districts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve provinces and districts',
      error: error.message
    });
  }
};

/**
 * Get a specific province with its districts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProvinceWithDistricts = async (req, res) => {
  try {
    const { provinceId } = req.params;

    const provinceQuery = `
      SELECT
        p.id as province_id,
        p.province_name,
        p.province_code,
        json_agg(
          json_build_object(
            'id', d.id,
            'district_name', d.district_name,
            'district_code', d.district_code
          ) ORDER BY d.district_name
        ) as districts
      FROM provinces p
      LEFT JOIN districts d ON p.id = d.province_id
      WHERE p.id = $1
      GROUP BY p.id, p.province_name, p.province_code;
    `;

    const result = await query(provinceQuery, [provinceId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Province not found'
      });
    }

    const province = {
      id: result.rows[0].province_id,
      province_name: result.rows[0].province_name,
      province_code: result.rows[0].province_code,
      districts: result.rows[0].districts || []
    };

    res.status(200).json({
      success: true,
      message: 'Province with districts retrieved successfully',
      data: province
    });

  } catch (error) {
    console.error('Error fetching province with districts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve province and districts',
      error: error.message
    });
  }
};

module.exports = {
  getProvincesWithDistricts,
  getProvinceWithDistricts
};