/**
 * Core Matching Engine
 * Implements skill overlap %, experience filtering, and ranking system
 */

class MatchingService {
  /**
   * Normalize a skill string for comparison
   */
  static normalizeSkill(skill) {
    return skill.toLowerCase().trim().replace(/[.\-_]/g, '').replace(/\s+/g, ' ');
  }

  /**
   * Check if two skills match (supports partial matching)
   */
  static skillsMatch(candidateSkill, requiredSkill) {
    const normCandidate = this.normalizeSkill(candidateSkill);
    const normRequired = this.normalizeSkill(requiredSkill);

    // Exact match
    if (normCandidate === normRequired) return true;

    // One contains the other
    if (normCandidate.includes(normRequired) || normRequired.includes(normCandidate)) return true;

    // Common abbreviation handling
    const abbreviations = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'react': 'reactjs',
      'node': 'nodejs',
      'vue': 'vuejs',
      'angular': 'angularjs',
      'mongo': 'mongodb',
      'postgres': 'postgresql',
      'k8s': 'kubernetes',
      'tf': 'tensorflow',
      'ml': 'machine learning',
      'ai': 'artificial intelligence',
      'aws': 'amazon web services',
      'gcp': 'google cloud platform',
      'css3': 'css',
      'html5': 'html'
    };

    const expandCandidate = abbreviations[normCandidate] || normCandidate;
    const expandRequired = abbreviations[normRequired] || normRequired;

    return expandCandidate === expandRequired ||
           expandCandidate.includes(expandRequired) ||
           expandRequired.includes(expandCandidate);
  }

  /**
   * Calculate skill overlap score
   */
  static calculateSkillScore(candidateSkills, requiredSkills, preferredSkills = []) {
    const matchedRequired = [];
    const missingRequired = [];
    const matchedPreferred = [];

    // Check required skills
    for (const req of requiredSkills) {
      const found = candidateSkills.some(cs => this.skillsMatch(cs, req));
      if (found) {
        matchedRequired.push(req);
      } else {
        missingRequired.push(req);
      }
    }

    // Check preferred skills
    for (const pref of preferredSkills) {
      const found = candidateSkills.some(cs => this.skillsMatch(cs, pref));
      if (found) {
        matchedPreferred.push(pref);
      }
    }

    // Calculate scores
    const requiredScore = requiredSkills.length > 0
      ? (matchedRequired.length / requiredSkills.length) * 100
      : 100;

    const preferredScore = preferredSkills.length > 0
      ? (matchedPreferred.length / preferredSkills.length) * 100
      : 0;

    // Weighted: 75% required, 25% preferred
    const hasPreferred = preferredSkills.length > 0;
    const skillScore = hasPreferred
      ? (requiredScore * 0.75) + (preferredScore * 0.25)
      : requiredScore;

    return {
      skillScore: Math.round(skillScore * 100) / 100,
      matchedRequired,
      missingRequired,
      matchedPreferred,
      matchedSkills: [...matchedRequired, ...matchedPreferred],
      missingSkills: missingRequired
    };
  }

  /**
   * Calculate experience score
   */
  static calculateExperienceScore(candidateExp, minExperience) {
    if (!minExperience || minExperience === 0) return 100;

    if (candidateExp >= minExperience * 1.5) return 100;
    if (candidateExp >= minExperience) {
      return 70 + ((candidateExp - minExperience) / (minExperience * 0.5)) * 30;
    }
    if (candidateExp >= minExperience * 0.5) {
      return 30 + ((candidateExp - minExperience * 0.5) / (minExperience * 0.5)) * 40;
    }
    return (candidateExp / (minExperience * 0.5)) * 30;
  }

  /**
   * Get recommendation label based on score
   */
  static getRecommendation(score) {
    if (score >= 75) return 'High Match';
    if (score >= 50) return 'Medium Match';
    return 'Low Match';
  }

  /**
   * Match a single candidate against requirements
   */
  static matchCandidate(candidate, requirements) {
    const { requiredSkills, preferredSkills = [], minExperience = 0 } = requirements;

    const skillResult = this.calculateSkillScore(
      candidate.skills,
      requiredSkills,
      preferredSkills
    );

    const experienceScore = this.calculateExperienceScore(
      candidate.experience,
      minExperience
    );

    // Overall score: 60% skills, 40% experience
    const overallScore = Math.round((skillResult.skillScore * 0.6) + (experienceScore * 0.4));

    return {
      candidate: {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        skills: candidate.skills,
        experience: candidate.experience,
        bio: candidate.bio,
        projects: candidate.projects
      },
      matchScore: overallScore,
      skillScore: Math.round(skillResult.skillScore),
      experienceScore: Math.round(experienceScore),
      matchedSkills: skillResult.matchedSkills,
      matchedRequired: skillResult.matchedRequired,
      matchedPreferred: skillResult.matchedPreferred,
      missingSkills: skillResult.missingSkills,
      recommendation: this.getRecommendation(overallScore)
    };
  }

  /**
   * Match all candidates against requirements and rank them
   */
  static rankCandidates(candidates, requirements) {
    const results = candidates.map(candidate =>
      this.matchCandidate(candidate, requirements)
    );

    // Sort by match score (descending)
    results.sort((a, b) => b.matchScore - a.matchScore);

    // Add rank
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    // Summary statistics
    const summary = {
      totalCandidates: results.length,
      highMatch: results.filter(r => r.recommendation === 'High Match').length,
      mediumMatch: results.filter(r => r.recommendation === 'Medium Match').length,
      lowMatch: results.filter(r => r.recommendation === 'Low Match').length,
      averageScore: results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.matchScore, 0) / results.length)
        : 0
    };

    return { results, summary };
  }
}

module.exports = MatchingService;
