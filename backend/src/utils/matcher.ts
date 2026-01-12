type Preferences = {
  preferredLocations?: string[];
  preferredWorkMode?: string[];   // e.g. ["REMOTE","HYBRID"]
  preferredJobTypes?: string[];   // e.g. ["FULL_TIME"]
  minSalary?: number;
};

type MatchResult = {
  score: number;          // 0..100
  reasons: string[];      // human-readable
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function intersectionCount(a: string[], b: string[]) {
  const setB = new Set(b.map(normalize));
  return a.map(normalize).filter(x => setB.has(x)).length;
}

export function computeJobMatch(params: {
  userSkills: string[];
  preferences?: Preferences | null;
  job: {
    title?: string;
    location?: string | null;
    workMode?: string | null;
    jobType?: string | null;
    requiredSkills?: string[] | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
  };
}): MatchResult {
  const { userSkills, preferences, job } = params;

  const reasons: string[] = [];
  let score = 0;

  // Weights (tweak later)
  const W_SKILLS = 50;
  const W_LOCATION = 15;
  const W_WORKMODE = 15;
  const W_JOBTYPE = 10;
  const W_SALARY = 10;

  // 1) Skill match (0..W_SKILLS)
  const reqSkills = job.requiredSkills ?? [];
  if (reqSkills.length === 0) {
    score += Math.round(W_SKILLS * 0.6);
    reasons.push("No requiredSkills listed, partial skill credit given.");
  } else {
    const hits = intersectionCount(userSkills, reqSkills);
    const ratio = hits / reqSkills.length;
    score += Math.round(W_SKILLS * ratio);
    reasons.push(`Skill match: ${hits}/${reqSkills.length}.`);
  }

  // 2) Location match
  const prefLoc = preferences?.preferredLocations ?? [];
  const jobLoc = job.location ?? "";
  if (prefLoc.length === 0) {
    score += Math.round(W_LOCATION * 0.5);
  } else if (prefLoc.map(normalize).includes(normalize(jobLoc))) {
    score += W_LOCATION;
    reasons.push("Location matches preference.");
  }

  // 3) Work mode match
  const prefWM = (preferences?.preferredWorkMode ?? []).map(s => s.toUpperCase());
  const jobWM = (job.workMode ?? "").toUpperCase();
  if (prefWM.length === 0) {
    score += Math.round(W_WORKMODE * 0.5);
  } else if (prefWM.includes(jobWM)) {
    score += W_WORKMODE;
    reasons.push("Work mode matches preference.");
  }

  // 4) Job type match
  const prefJT = (preferences?.preferredJobTypes ?? []).map(s => s.toUpperCase());
  const jobJT = (job.jobType ?? "").toUpperCase();
  if (prefJT.length === 0) {
    score += Math.round(W_JOBTYPE * 0.5);
  } else if (prefJT.includes(jobJT)) {
    score += W_JOBTYPE;
    reasons.push("Job type matches preference.");
  }

  // 5) Salary match (basic)
  const minSalary = preferences?.minSalary;
  if (minSalary == null) {
    score += Math.round(W_SALARY * 0.5);
  } else {
    const jobSalaryMax = job.salaryMax ?? job.salaryMin ?? null;
    if (jobSalaryMax == null) {
      score += Math.round(W_SALARY * 0.3);
      reasons.push("Salary not provided, low salary confidence.");
    } else if (jobSalaryMax >= minSalary) {
      score += W_SALARY;
      reasons.push("Salary meets minimum preference.");
    }
  }

  // Clamp 0..100
  score = Math.max(0, Math.min(100, score));
  return { score, reasons };
}
