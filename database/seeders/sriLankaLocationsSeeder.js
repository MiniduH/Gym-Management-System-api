const { query } = require('../../config/database');

/**
 * Sri Lanka Provinces and Districts Seeder
 * Seeds provinces and districts data for Sri Lanka
 */

const sriLankaData = [
  {
    "province_name": "Western",
    "province_code": "WP",
    "districts": [
      { "district_name": "Colombo", "district_code": "CO" },
      { "district_name": "Gampaha", "district_code": "GA" },
      { "district_name": "Kalutara", "district_code": "KA" }
    ]
  },
  {
    "province_name": "Central",
    "province_code": "CP",
    "districts": [
      { "district_name": "Kandy", "district_code": "KD" },
      { "district_name": "Matale", "district_code": "MT" },
      { "district_name": "Nuwara Eliya", "district_code": "NE" }
    ]
  },
  {
    "province_name": "Southern",
    "province_code": "SP",
    "districts": [
      { "district_name": "Galle", "district_code": "GL" },
      { "district_name": "Matara", "district_code": "MR" },
      { "district_name": "Hambantota", "district_code": "HB" }
    ]
  },
  {
    "province_name": "Northern",
    "province_code": "NP",
    "districts": [
      { "district_name": "Jaffna", "district_code": "JA" },
      { "district_name": "Kilinochchi", "district_code": "KL" },
      { "district_name": "Mannar", "district_code": "MN" },
      { "district_name": "Mullaitivu", "district_code": "MU" },
      { "district_name": "Vavuniya", "district_code": "VA" }
    ]
  },
  {
    "province_name": "Eastern",
    "province_code": "EP",
    "districts": [
      { "district_name": "Trincomalee", "district_code": "TC" },
      { "district_name": "Batticaloa", "district_code": "BT" },
      { "district_name": "Ampara", "district_code": "AM" }
    ]
  },
  {
    "province_name": "North Western",
    "province_code": "NWP",
    "districts": [
      { "district_name": "Kurunegala", "district_code": "KG" },
      { "district_name": "Puttalam", "district_code": "PU" }
    ]
  },
  {
    "province_name": "North Central",
    "province_code": "NCP",
    "districts": [
      { "district_name": "Anuradhapura", "district_code": "AN" },
      { "district_name": "Polonnaruwa", "district_code": "PO" }
    ]
  },
  {
    "province_name": "Uva",
    "province_code": "UP",
    "districts": [
      { "district_name": "Badulla", "district_code": "BD" },
      { "district_name": "Monaragala", "district_code": "MO" }
    ]
  },
  {
    "province_name": "Sabaragamuwa",
    "province_code": "SG",
    "districts": [
      { "district_name": "Ratnapura", "district_code": "RT" },
      { "district_name": "Kegalle", "district_code": "KE" }
    ]
  }
];

const seed = async () => {
  try {
    console.log('🌱 Seeding Sri Lanka provinces and districts...');

    // Insert provinces and their districts
    for (const provinceData of sriLankaData) {
      // Insert province
      const provinceQuery = `
        INSERT INTO provinces (province_name, province_code)
        VALUES ($1, $2)
        ON CONFLICT (province_code) DO NOTHING
        RETURNING id, province_name;
      `;

      const provinceResult = await query(provinceQuery, [
        provinceData.province_name,
        provinceData.province_code
      ]);

      if (provinceResult.rows.length > 0) {
        const provinceId = provinceResult.rows[0].id;
        console.log(`  ✓ Province: ${provinceData.province_name} (ID: ${provinceId})`);

        // Insert districts for this province
        for (const district of provinceData.districts) {
          const districtQuery = `
            INSERT INTO districts (district_name, district_code, province_id)
            VALUES ($1, $2, $3)
            ON CONFLICT (district_code) DO NOTHING
            RETURNING id, district_name;
          `;

          const districtResult = await query(districtQuery, [
            district.district_name,
            district.district_code,
            provinceId
          ]);

          if (districtResult.rows.length > 0) {
            console.log(`    ✓ District: ${district.district_name} (ID: ${districtResult.rows[0].id})`);
          }
        }
      }
    }

    console.log('✅ Sri Lanka provinces and districts seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding provinces and districts:', error.message);
    throw error;
  }
};

module.exports = { seed, sriLankaData };