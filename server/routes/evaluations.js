const router = require('express').Router();
const {
  saveEvaluation,
  getEvaluations,
  getEvaluation,
  deleteEvaluation
} = require('../controllers/evaluationController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', saveEvaluation);
router.get('/', getEvaluations);
router.get('/:id', getEvaluation);
router.delete('/:id', deleteEvaluation);

module.exports = router;
