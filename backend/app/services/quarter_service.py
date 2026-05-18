from datetime import UTC, datetime

from fastapi import HTTPException, status


class QuarterService:
    def get_current_quarter(self) -> str:
        month = datetime.now(UTC).month
        if month <= 3:
            return "Q1"
        if month <= 6:
            return "Q2"
        if month <= 9:
            return "Q3"
        return "Q4"

    def ensure_active_quarter(self, quarter: str) -> None:
        current_quarter = self.get_current_quarter()
        if quarter != current_quarter:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Updates are only allowed during the active quarter: {current_quarter}",
            )
