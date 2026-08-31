#!/usr/bin/env bash
set -euo pipefail

DB_USER="${DB_USER:-travel_user}"
DB_PASSWORD="${DB_PASSWORD:-travel_pass}"
DB_NAME="${DB_NAME:-travel_site}"
PG_USER="${PG_USER:-postgres}"

for required_bin in psql sudo; do
  if ! command -v "$required_bin" >/dev/null 2>&1; then
    echo "Required command not found: $required_bin"
    exit 1
  fi
done

if sudo -u "$PG_USER" psql -tAc "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER';" | grep -q 1; then
  echo "Role '$DB_USER' already exists."
else
  echo "Creating role '$DB_USER'..."
  sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -c "CREATE ROLE \"$DB_USER\" WITH LOGIN PASSWORD '$DB_PASSWORD';"
fi

if sudo -u "$PG_USER" psql -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" | grep -q 1; then
  echo "Database '$DB_NAME' already exists."
else
  echo "Creating database '$DB_NAME'..."
  sudo -u "$PG_USER" createdb -O "$DB_USER" "$DB_NAME"
fi

sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c "ALTER DATABASE \"$DB_NAME\" OWNER TO \"$DB_USER\";"
sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON DATABASE \"$DB_NAME\" TO \"$DB_USER\";"
sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON SCHEMA public TO \"$DB_USER\";"
sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c "ALTER SCHEMA public OWNER TO \"$DB_USER\";"
sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c "ALTER TABLE public.bookings OWNER TO \"$DB_USER\";"
sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c "ALTER TABLE public.rooms OWNER TO \"$DB_USER\";"
sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c "ALTER TABLE public.hotels OWNER TO \"$DB_USER\";"
sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c "ALTER SEQUENCE public.bookings_id_seq OWNER TO \"$DB_USER\";"
sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c "ALTER SEQUENCE public.rooms_id_seq OWNER TO \"$DB_USER\";"
sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c "ALTER SEQUENCE public.hotels_id_seq OWNER TO \"$DB_USER\";"
sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO \"$DB_USER\";"
sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO \"$DB_USER\";"
sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO \"$DB_USER\";"
sudo -u "$PG_USER" psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO \"$DB_USER\";"

echo "Database setup complete."
echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
