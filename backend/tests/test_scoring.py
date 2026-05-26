from services.scoring import calculate_score


def test_candidate_shortlisted():

    role = {
        "scoring_config": {
            "skills": [{"name": "Python", "required": True, "weight": 90}],
            "threshold": 50,
        }
    }

    analysis = {
        "skills_found": ["Python"],
        "years_experience": 5,
        "employment_gaps_over_12m": 0,
        "job_count_last_2yr": 1,
        "has_relevant_degree": True,
    }

    result = calculate_score(analysis, role)

    assert result["shortlisted"] is True

    assert result["overall"] >= 50


def test_candidate_rejected():

    role = {
        "scoring_config": {
            "skills": [{"name": "Python", "required": True, "weight": 90}],
            "threshold": 90,
        }
    }

    analysis = {
        "skills_found": [],
        "years_experience": 0,
        "employment_gaps_over_12m": 3,
        "job_count_last_2yr": 5,
        "has_relevant_degree": False,
    }

    result = calculate_score(analysis, role)

    assert result["shortlisted"] is False


def test_required_skill_impacts_score():

    role = {
        "scoring_config": {
            "skills": [{"name": "Python", "required": True, "weight": 100}],
            "threshold": 50,
        }
    }

    analysis = {
        "skills_found": [],
        "years_experience": 5,
        "employment_gaps_over_12m": 0,
        "job_count_last_2yr": 1,
        "has_relevant_degree": True,
    }

    result = calculate_score(analysis, role)

    assert result["skills"] < 100
