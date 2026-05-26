from pydantic import (
    BaseModel,
    Field,
)
from typing import List


class ResumeAnalysisSchema(
    BaseModel
):
    candidate_name: str = Field(
        default="Unknown"
    )

    years_experience: int = Field(
        ge=0,
        le=50
    )

    skills_found: List[str]

    summary: str

    has_relevant_degree: bool

    employment_gaps_over_12m: int = Field(
        ge=0
    )

    job_count_last_2yr: int = Field(
        ge=0
    )