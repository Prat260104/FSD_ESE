const router = require('express').Router();
const { evaluateEmployees, aiRecommend, generateFeedback } = require('../controllers/aiController');
const { validateEvaluation } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', validateEvaluation, evaluateEmployees);
router.post('/recommend', validateEvaluation, aiRecommend);
router.post('/feedback', generateFeedback);

module.exports = router;
