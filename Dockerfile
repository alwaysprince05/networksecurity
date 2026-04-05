FROM python:3.10-slim-bookworm   # ✅ updated base image

WORKDIR /app

COPY . /app

# ✅ install python dependencies only
RUN pip install --no-cache-dir -r requirements.txt

CMD ["python3", "app.py"]