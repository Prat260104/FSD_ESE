const router = require('express').Router();
const {
  saveShortlist,
  getShortlists,
  getShortlist,
  deleteShortlist
} = require('../controllers/shortlistController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', saveShortlist);
router.get('/', getShortlists);
router.get('/:id', getShortlist);
router.delete('/:id', deleteShortlist);

module.exports = router;
