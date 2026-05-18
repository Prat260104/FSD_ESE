const Employee = require('../models/Employee');

exports.createEmployee = async (req, res, next) => {
  try {
    const employeeData = { ...req.body, createdBy: req.user.id };
    const employee = await Employee.create(employeeData);
    res.status(201).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

exports.getEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, department, minExperience, maxExperience, minPerformance } = req.query;
    const query = { createdBy: req.user.id };

    if (search) query.$text = { $search: search };
    if (department) query.department = new RegExp(department, 'i');
    if (minPerformance) query.performanceScore = { ...query.performanceScore, $gte: Number(minPerformance) };
    if (minExperience || maxExperience) {
      query.experience = {};
      if (minExperience) query.experience.$gte = Number(minExperience);
      if (maxExperience) query.experience.$lte = Number(maxExperience);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: employees.length,
      pagination: {
        totalEmployees: total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        hasNextPage: startIndex + employees.length < total,
        hasPrevPage: startIndex > 0
      },
      employees
    });
  } catch (error) {
    next(error);
  }
};

exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.status(200).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.status(200).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
