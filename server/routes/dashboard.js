const router = require('express').Router();
const { getStats } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/stats', getStats);

module.exports = router;
