import logging
import os
from datetime import datetime, timezone

# Use UTC for log filename (Industry Standard)
LOG_FILE=f"{datetime.now(timezone.utc).strftime('%m_%d_%Y_%H_%M_%S')}.log"

logs_path=os.path.join(os.getcwd(),"logs",LOG_FILE)
os.makedirs(logs_path,exist_ok=True)

LOG_FILE_PATH=os.path.join(logs_path,LOG_FILE)

# Force the logging module to ALWAYS use UTC instead of local computer time
def custom_time(*args):
    return datetime.now(timezone.utc).timetuple()

logging.Formatter.converter = custom_time

logging.basicConfig(
    filename=LOG_FILE_PATH,
    format="[ %(asctime)s ] %(lineno)d %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)