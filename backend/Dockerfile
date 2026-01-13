FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt \
    && rm -rf /root/.cache/pip

COPY . .

EXPOSE 5000
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]