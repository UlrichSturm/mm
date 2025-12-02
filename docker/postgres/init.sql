-- PostgreSQL initialization script for Memento Mori
-- This script runs automatically when the container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create databases
CREATE DATABASE memento_mori_dev;
CREATE DATABASE memento_mori_test;
CREATE DATABASE keycloak;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE memento_mori_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE memento_mori_test TO postgres;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO postgres;

-- Connect to dev database and create extensions there too
\c memento_mori_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Connect to test database and create extensions there too
\c memento_mori_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Log completion
\echo 'Database initialization completed successfully!'

