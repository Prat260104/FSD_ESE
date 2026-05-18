exports.evaluateEmployee = (employee, criteria) => {
  const { requiredSkills = [], minPerformanceScore = 0 } = criteria;
  
  if (employee.performanceScore < minPerformanceScore) return null;

  let score = 0;
  const matchedSkills = [];
  const missingSkills = [];

  const empSkills = employee.skills.map(s => s.toLowerCase());

  if (requiredSkills.length > 0) {
    requiredSkills.forEach(skill => {
      if (empSkills.includes(skill.toLowerCase())) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    const skillScore = (matchedSkills.length / requiredSkills.length) * 100;
    
    // Performance score also affects evaluation 
    score = (skillScore * 0.5) + (employee.performanceScore * 0.5);
  } else {
    score = employee.performanceScore;
  }

  return {
    employee,
    evaluationScore: Math.round(score),
    matchedSkills,
    missingSkills
  };
};

exports.rankEmployees = (employees, criteria) => {
  const evaluated = employees
    .map(emp => this.evaluateEmployee(emp, criteria))
    .filter(result => result !== null);

  return evaluated.sort((a, b) => b.evaluationScore - a.evaluationScore);
};
