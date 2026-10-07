import logging
import sys

def setup_logging() -> None:
    """Set up basic logs config for FastAPI app context."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

logger = logging.getLogger("zippr")
