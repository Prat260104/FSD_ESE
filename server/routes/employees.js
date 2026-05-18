const router = require('express').Router();
const {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { validateEmployee } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', validateEmployee, createEmployee);
router.get('/', getEmployees);
router.get('/search', getEmployees); // Re-using getEmployees for search based on req.query
router.get('/:id', getEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;
