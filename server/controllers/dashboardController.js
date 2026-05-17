const Candidate = require('../models/Candidate');
const Shortlist = require('../models/Shortlist');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      totalCandidates,
      totalShortlists,
      recentCandidates,
      skillDistribution
    ] = await Promise.all([
      Candidate.countDocuments({ createdBy: userId }),
      Shortlist.countDocuments({ createdBy: userId }),
      Candidate.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email skills experience createdAt'),
      Candidate.aggregate([
        { $match: { createdBy: userId } },
        { $unwind: '$skills' },
        { $group: { _id: { $toLower: '$skills' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    // Experience distribution
    const experienceDistribution = await Candidate.aggregate([
      { $match: { createdBy: userId } },
      {
        $bucket: {
          groupBy: '$experience',
          boundaries: [0, 2, 5, 10, 20, 51],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            candidates: { $push: '$name' }
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
        totalCandidates,
        totalShortlists,
        avgExperience: totalCandidates > 0
          ? Math.round((await Candidate.aggregate([
              { $match: { createdBy: userId } },
              { $group: { _id: null, avg: { $avg: '$experience' } } }
            ]))[0]?.avg || 0)
          : 0,
        totalSkills: skillDistribution.length
      },
      recentCandidates,
      skillDistribution: skillDistribution.map(s => ({
        skill: s._id,
        count: s.count
      })),
      experienceDistribution: expData
    });
  } catch (error) {
    next(error);
  }
};
