from datetime import date, datetime


def _to_number(value: str | int | float | None) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _to_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value).date()
    except ValueError:
        return None


def _clamp_score(value: float) -> float:
    return round(max(0, min(value, 100)), 2)


def calculate_progress(uom_type: str | None, target: str | None, actual: str | None) -> float:
    normalized_type = (uom_type or "numeric").lower()

    if normalized_type == "timeline":
        target_date = _to_date(target)
        actual_date = _to_date(actual)
        if target_date is None or actual_date is None:
            return 0
        return 100 if actual_date <= target_date else 0

    target_value = _to_number(target)
    actual_value = _to_number(actual)
    if target_value is None or actual_value is None:
        return 0

    if normalized_type in {"zero", "zero_based"}:
        return 100 if actual_value == 0 else 0

    # MVP convention: numeric_max / percent_max can be used for lower-is-better
    # goals such as TAT or cost, while numeric / percent are higher-is-better.
    if normalized_type in {"max", "numeric_max", "percent_max"}:
        if actual_value <= 0:
            return 0
        return _clamp_score((target_value / actual_value) * 100)

    if target_value <= 0:
        return 0
    return _clamp_score((actual_value / target_value) * 100)
