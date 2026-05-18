const Evaluation = require('../models/Evaluation');

exports.saveEvaluation = async (req, res, next) => {
  try {
    const evaluationData = {
      ...req.body,
      createdBy: req.user.id
    };
    const evaluation = await Evaluation.create(evaluationData);
    res.status(201).json({ success: true, evaluation });
  } catch (error) {
    next(error);
  }
};

exports.getEvaluations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const query = { createdBy: req.user.id };
    const total = await Evaluation.countDocuments(query);
    const evaluations = await Evaluation.find(query)
      .populate('employees.employee', 'name email department experience')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: evaluations.length,
      pagination: {
        totalEvaluations: total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        hasNextPage: startIndex + evaluations.length < total,
        hasPrevPage: startIndex > 0
      },
      evaluations
    });
  } catch (error) {
    next(error);
  }
};

exports.getEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findOne({ _id: req.params.id, createdBy: req.user.id })
      .populate('employees.employee', 'name email department experience skills performanceScore');
    
    if (!evaluation) return res.status(404).json({ success: false, message: 'Evaluation not found' });
    res.status(200).json({ success: true, evaluation });
  } catch (error) {
    next(error);
  }
};

exports.deleteEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!evaluation) return res.status(404).json({ success: false, message: 'Evaluation not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
