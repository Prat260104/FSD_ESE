const Employee = require('../models/Employee');
const Evaluation = require('../models/Evaluation');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      totalEmployees,
      totalEvaluations,
      topPerformers,
      skillDistribution,
      departmentDistribution
    ] = await Promise.all([
      Employee.countDocuments({ createdBy: userId }),
      Evaluation.countDocuments({ createdBy: userId }),
      Employee.find({ createdBy: userId })
        .sort({ performanceScore: -1 })
        .limit(5)
        .select('name email department performanceScore experience'),
      Employee.aggregate([
        { $match: { createdBy: userId } },
        { $unwind: '$skills' },
        { $group: { _id: { $toLower: '$skills' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Employee.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    // Experience distribution
    const experienceDistribution = await Employee.aggregate([
      { $match: { createdBy: userId } },
      {
        $bucket: {
          groupBy: '$experience',
          boundaries: [0, 2, 5, 10, 20, 51],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    const expLabels = ['0-2 yrs', '2-5 yrs', '5-10 yrs', '10-20 yrs', '20+ yrs'];
    const expData = experienceDistribution.map((bucket, i) => ({
      range: expLabels[i] || `${bucket._id}+ yrs`,
      count: bucket.count
    }));

    res.json({
      stats: {
        totalEmployees,
        totalEvaluations,
        avgPerformance: totalEmployees > 0
          ? Math.round((await Employee.aggregate([
              { $match: { createdBy: userId } },
              { $group: { _id: null, avg: { $avg: '$performanceScore' } } }
            ]))[0]?.avg || 0)
          : 0,
        totalDepartments: departmentDistribution.length
      },
      topPerformers,
      skillDistribution: skillDistribution.map(s => ({
        skill: s._id,
        count: s.count
      })),
      departmentDistribution: departmentDistribution.map(d => ({
        department: d._id || 'Unassigned',
        count: d.count
      })),
      experienceDistribution: expData
    });
  } catch (error) {
    next(error);
  }
};
