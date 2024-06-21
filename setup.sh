#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Step 1: Start Docker containers
echo "Starting Docker containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker exec slash-asessment pg_isready -U $POSTGRES_USER -d $POSTGRES_DB; do
    sleep 2
done

# Step 2: Apply Prisma schema
echo "Applying Prisma schema..."
npx prisma generate
npx prisma migrate deploy

# Step 3: Populate the database
echo "Populating the database with initial data..."

# Users
docker exec -i $(docker-compose ps -q postgres) psql -U $POSTGRES_USER -d $POSTGRES_DB << EOF
INSERT INTO public."Users" (name, email, password, address)
VALUES
  ('John Doe', 'john.doe@example.com', 'password1', '123 Main St, Anytown'),
  ('Jane Smith', 'jane.smith@example.com', 'password2', '456 Elm St, Otherville'),
  ('Michael Johnson', 'michael.johnson@example.com', 'password3', '789 Oak St, Anycity'),
  ('Emily Brown', 'emily.brown@example.com', 'password4', '321 Pine St, Somewhere'),
  ('David Wilson', 'david.wilson@example.com', 'password5', '654 Birch St, Nowhere');
EOF

# Products
docker exec -i $(docker-compose ps -q postgres) psql -U $POSTGRES_USER -d $POSTGRES_DB << EOF
INSERT INTO public."Products" (name, description, price, stock)
VALUES
  ('Gold Necklace', 'Elegant gold necklace with intricate design', 299.99, 50),
  ('Diamond Ring', 'Stunning diamond ring with platinum band', 999.99, 30),
  ('Silver Pendant', 'Simple and stylish silver pendant', 49.99, 100),
  ('Pearl Earrings', 'Classic pearl earrings for any occasion', 149.99, 80),
  ('Ruby Bracelet', 'Luxurious ruby bracelet for a touch of glamour', 399.99, 20);
EOF

echo "Setup completed successfully!"
