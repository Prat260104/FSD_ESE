const Employee = require('../models/Employee');
const evaluationService = require('../services/evaluationService');
const aiService = require('../services/aiService');

exports.evaluateEmployees = async (req, res, next) => {
  try {
    const criteria = req.body;
    
    let query = { createdBy: req.user.id };
    if (criteria.targetDepartment) {
      query.department = new RegExp(criteria.targetDepartment, 'i');
    }

    const employees = await Employee.find(query);
    if (employees.length === 0) {
      return res.status(200).json({ success: true, results: [], summary: { totalEmployees: 0 } });
    }

    const ranked = evaluationService.rankEmployees(employees, criteria);
    
    const results = ranked.map((r, i) => ({
      employee: r.employee,
      evaluationScore: r.evaluationScore,
      strengths: r.matchedSkills, // mapping matched -> strengths
      areasForImprovement: r.missingSkills,
      rank: i + 1,
      recommendation: r.evaluationScore >= 80 ? 'Excellent' : r.evaluationScore >= 60 ? 'Good' : 'Average'
    }));

    res.status(200).json({
      success: true,
      criteria,
      results,
      summary: {
        totalEmployees: employees.length,
        topPerformers: results.filter(r => r.evaluationScore >= 80).length,
        averageScore: Math.round(results.reduce((acc, curr) => acc + curr.evaluationScore, 0) / results.length)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.aiRecommend = async (req, res, next) => {
  try {
    const criteria = req.body;
    
    let query = { createdBy: req.user.id };
    if (criteria.targetDepartment) {
      query.department = new RegExp(criteria.targetDepartment, 'i');
    }

    const employees = await Employee.find(query);
    if (employees.length === 0) {
      return res.status(200).json({ success: true, results: [], summary: { totalEmployees: 0 } });
    }

    // Pre-calculate algorithmic scores to combine
    const algoResults = evaluationService.rankEmployees(employees, criteria);
    
    // AI analysis
    const aiAnalysis = await aiService.analyzeEmployees(employees, criteria);
    
    // Merge results
    const results = aiAnalysis.results.map(aiRes => {
      const emp = employees[aiRes.index - 1];
      const algoRes = algoResults.find(r => r.employee._id.toString() === emp._id.toString());
      
      return {
        employee: emp,
        evaluationScore: algoRes ? algoRes.evaluationScore : emp.performanceScore,
        aiScore: aiRes.aiScore,
        strengths: aiRes.strengths || [],
        areasForImprovement: aiRes.areasForImprovement || [],
        aiFeedback: aiRes.aiFeedback,
        recommendation: aiRes.recommendation
      };
    }).sort((a, b) => b.aiScore - a.aiScore).map((r, i) => ({ ...r, rank: i + 1 }));

    res.status(200).json({
      success: true,
      criteria,
      results,
      summary: {
        totalEmployees: employees.length,
        aiAnalysis: aiAnalysis.summary?.aiAnalysisSummary || 'Analysis complete.',
        averageScore: Math.round(results.reduce((acc, curr) => acc + curr.aiScore, 0) / results.length)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.generateFeedback = async (req, res, next) => {
  try {
    const { employeeId, requiredSkills, targetDepartment, minPerformanceScore } = req.body;
    
    const employee = await Employee.findOne({ _id: employeeId, createdBy: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const feedback = await aiService.generateFeedback(employee, { requiredSkills, targetDepartment, minPerformanceScore });
    
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};
