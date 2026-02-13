#!/bin/sh
set -e

echo "Waiting for MySQL to be ready..."

until python -c "import MySQLdb; MySQLdb.connect(host='$DB_HOST', user='$MYSQL_USER', passwd='$MYSQL_PASSWORD', db='$MYSQL_DATABASE')" > /dev/null 2>&1; do
  echo "MySQL is still starting up... waiting 5 seconds."
  sleep 5
done

echo "Database is UP!"

echo "Creating migration files..."
python manage.py makemigrations --noinput

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000