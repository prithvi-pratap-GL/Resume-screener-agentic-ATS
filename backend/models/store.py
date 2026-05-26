import uuid
from datetime import datetime

# ---------------------------------------------------------------------------
# In-memory stores (future implementattion : DB integration)
# ---------------------------------------------------------------------------
_roles: dict = {}
_candidates: dict = {}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def new_id() -> str:
    return str(uuid.uuid4())[:8]


def now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


# ---------------------------------------------------------------------------
# Default scoring config shape
# ---------------------------------------------------------------------------
def default_scoring_config() -> dict:
    return {
        "skills": [],                   # [{name, weight, required}]
        "experience_band": 2,           # index 0-3  (0-2yr / 3-4yr / 5-7yr / 8+yr)
        "threshold": 75,                # auto-shortlist %
        "penalties": {
            "gap_over_12m": 8,
            "no_degree": 5,
            "job_hopping": 6,
            "missing_required_skills_pct": 12,
        },
        "bias_safeguards": {
            "anonymise_names": True,
            "suppress_university_prestige": True,
            "remove_graduation_year": False,
        },
    }


# ---------------------------------------------------------------------------
# Role CRUD
# ---------------------------------------------------------------------------
def create_role(title: str, department: str, description: str) -> dict:
    role = {
        "id": new_id(),
        "title": title,
        "department": department,
        "description": description,
        "scoring_config": default_scoring_config(),
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    _roles[role["id"]] = role
    return role


def get_all_roles() -> list:
    return list(_roles.values())


def get_role(role_id: str) -> dict | None:
    return _roles.get(role_id)


def update_role(role_id: str, data: dict) -> dict | None:
    role = _roles.get(role_id)
    if not role:
        return None
    for k, v in data.items():
        if k != "id":
            role[k] = v
    role["updated_at"] = now_iso()
    return role


def delete_role(role_id: str) -> bool:
    return _roles.pop(role_id, None) is not None


# ---------------------------------------------------------------------------
# Candidate store
# ---------------------------------------------------------------------------
def save_candidate(candidate: dict) -> dict:
    candidate["id"] = candidate.get("id") or new_id()
    candidate["created_at"] = now_iso()
    _candidates[candidate["id"]] = candidate
    return candidate


def get_all_candidates() -> list:
    return list(_candidates.values())


def get_candidate(cid: str) -> dict | None:
    return _candidates.get(cid)


# ---------------------------------------------------------------------------
# Seed a demo role so the app isn't empty on first run
# ---------------------------------------------------------------------------
def seed_demo():
    if _roles:
        return
    role = create_role(
        title="Senior ML Engineer",
        department="Engineering",
        description="Build and deploy production ML systems at scale.",
    )
    role["scoring_config"]["skills"] = [
        {"name": "Python", "weight": 90, "required": True},
        {"name": "PyTorch", "weight": 75, "required": True},
        {"name": "MLOps", "weight": 65, "required": False},
        {"name": "Kubernetes", "weight": 50, "required": False},
        {"name": "System Design", "weight": 70, "required": True},
        {"name": "AWS / GCP", "weight": 55, "required": False},
    ]
    role["scoring_config"]["threshold"] = 75