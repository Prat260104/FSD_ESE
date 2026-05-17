const router = require('express').Router();
const {
  createCandidate,
  getCandidates,
  getCandidate,
  updateCandidate,
  deleteCandidate
} = require('../controllers/candidateController');
const { validateCandidate } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', validateCandidate, createCandidate);
router.get('/', getCandidates);
router.get('/:id', getCandidate);
router.put('/:id', updateCandidate);
router.delete('/:id', deleteCandidate);

module.exports = router;
