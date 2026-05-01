import logging
import os
from datetime import datetime, timezone, timedelta

# Define IST timezone (UTC + 5:30)
IST = timezone(timedelta(hours=5, minutes=30))

# Use IST for log filename
LOG_FILE=f"{datetime.now(IST).strftime('%m_%d_%Y_%H_%M_%S')}.log"

logs_path=os.path.join(os.getcwd(),"logs",LOG_FILE)
os.makedirs(logs_path,exist_ok=True)

LOG_FILE_PATH=os.path.join(logs_path,LOG_FILE)

# Force the logging module to use IST instead of server local time (UTC)
def custom_time(*args):
    return datetime.now(IST).timetuple()

logging.Formatter.converter = custom_time

logging.basicConfig(
    filename=LOG_FILE_PATH,
    format="[ %(asctime)s ] %(lineno)d %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)