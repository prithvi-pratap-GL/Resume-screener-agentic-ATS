"""
Pure-Python scoring engine.  No LLM calls — deterministic rule application.
"""


EXPERIENCE_MULTIPLIERS = [0.6, 0.8, 1.0, 1.1]   # bands 0-3


def _skill_score(skills_found: list[str], scoring_config: dict) -> float:
    """Weighted skill match 0-100."""
    configured = scoring_config.get("skills", [])
    if not configured:
        return 50.0

    total_weight = sum(s["weight"] for s in configured)
    if total_weight == 0:
        return 0.0

    found_lower = [s.lower() for s in skills_found]
    matched_weight = sum(
        s["weight"]
        for s in configured
        if any(s["name"].lower() in f or f in s["name"].lower() for f in found_lower)
    )
    return round((matched_weight / total_weight) * 100, 1)


def _experience_score(years: int, band_index: int) -> float:
    """Score 0-100 based on experience, adjusted by selected band multiplier."""
    # Ideal is the middle of the selected band
    ideal_years = [1, 3.5, 6, 10][band_index]
    diff = abs(years - ideal_years)
    raw = max(0, 100 - diff * 8)
    return round(raw * EXPERIENCE_MULTIPLIERS[band_index], 1)


def _profile_score(analysis: dict) -> float:
    """Heuristic profile quality 0-100."""
    score = 60.0
    if analysis.get("has_relevant_degree"):
        score += 20
    if analysis.get("employment_gaps_over_12m", 0) == 0:
        score += 10
    if analysis.get("job_count_last_2yr", 0) <= 2:
        score += 10
    return min(score, 100.0)


def _apply_penalties(base: float, analysis: dict, penalties: dict) -> float:
    score = base
    if analysis.get("employment_gaps_over_12m", 0) > 0:
        score -= penalties.get("gap_over_12m", 8)
    if not analysis.get("has_relevant_degree"):
        score -= penalties.get("no_degree", 5)
    if analysis.get("job_count_last_2yr", 0) >= 3:
        score -= penalties.get("job_hopping", 6)
    return max(0.0, score)


def calculate_score(analysis: dict, role: dict) -> dict:
    """
    Returns full score breakdown dict.
    """
    cfg = role["scoring_config"]
    band = int(cfg.get("experience_band", 2))
    penalties = cfg.get("penalties", {})

    skill_s = _skill_score(analysis.get("skills_found", []), cfg)
    exp_s = _experience_score(int(analysis.get("years_experience", 0)), band)
    prof_s = _profile_score(analysis)

    # Weighted average: skills 50%, experience 30%, profile 20%
    base = skill_s * 0.50 + exp_s * 0.30 + prof_s * 0.20
    final = _apply_penalties(base, analysis, penalties)
    final = round(final)

    threshold = cfg.get("threshold", 75)

    return {
        "overall": final,
        "skills": round(skill_s),
        "experience": round(exp_s),
        "profile": round(prof_s),
        "shortlisted": final >= threshold,
        "threshold": threshold,
    }