import math
from typing import List, Dict

# Standard normal cumulative distribution function
def norm_cdf(x: float) -> float:
    return (1.0 + math.erf(x / math.sqrt(2.0))) / 2.0

def next_question(current_theta: float, available_questions: List[Dict]) -> Dict | None:
    """
    Selects the next assessment item using targeted difficulty matching.
    Chooses the item whose difficulty parameter minimizes |b_i - theta|.
    """
    if not available_questions:
        return None

    return min(
        available_questions,
        key=lambda q: abs(q["difficulty"] - current_theta)
    )

def estimate_theta(responses: List[Dict]) -> float:
    """
    Estimates candidate latent ability (theta) based on response history.
    Format of each response: {'difficulty': float, 'discrimination': float, 'is_correct': bool}

    Uses a weighted step update bounded within [-3.0, 3.0] standard deviations.
    """
    if not responses:
        return 0.0

    theta = 0.0
    for r in responses:
        change = 0.5 * r.get('discrimination', 1.0)
        if r['is_correct']:
            theta += change * (1.0 if r['difficulty'] >= theta else 0.5)
        else:
            theta -= change * (1.0 if r['difficulty'] <= theta else 0.5)

    # Bound theta to standard psychometric normal range [-3, 3]
    return max(-3.0, min(3.0, theta))

def estimate_iq(theta: float) -> int:
    """
    Converts a theta score (z-score) to an IQ score (mean 100, SD 15)
    """
    return round(100 + (15 * theta))

def calculate_percentile(iq: int) -> int:
    """
    Calculates percentile for a given IQ score using normal distribution.
    """
    z = (iq - 100) / 15
    return round(norm_cdf(z) * 100)
