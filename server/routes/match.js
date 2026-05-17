const router = require('express').Router();
const { matchCandidates, aiShortlist, generateInterviewQuestions } = require('../controllers/matchController');
const { validateMatch } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', validateMatch, matchCandidates);
router.post('/ai/shortlist', validateMatch, aiShortlist);
router.post('/ai/interview-questions', generateInterviewQuestions);

module.exports = router;
