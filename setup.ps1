# Load environment variables from .env file
$envVars = Get-Content '.env' | Where-Object { $_ -notlike '#*' } | ForEach-Object { $_ -split '=' }
foreach ($envVar in $envVars) {
    Set-Item -Path "env:\$($envVar[0])" -Value $envVar[1]
}

# Step 1: Start Docker containers
Write-Output "Starting Docker containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
Write-Output "Waiting for PostgreSQL to be ready..."
$retryCount = 0
$maxRetries = 30
$retryIntervalSeconds = 2

while ($retryCount -lt $maxRetries) {
    try {
        docker exec slash-asessment pg_isready -U $env:POSTGRES_USER -d $env:POSTGRES_DB
        Write-Output "PostgreSQL is ready!"
        break
    } catch {
        Write-Output "PostgreSQL is not ready yet. Retrying in $retryIntervalSeconds seconds..."
        Start-Sleep -Seconds $retryIntervalSeconds
        $retryCount++
    }
}

if ($retryCount -ge $maxRetries) {
    Write-Error "Timeout: PostgreSQL did not become ready after $maxRetries retries."
    exit 1
}

# Step 2: Apply Prisma schema
Write-Output "Applying Prisma schema..."
npx prisma generate
npx prisma migrate deploy

# Step 3: Populate the database
Write-Output "Populating the database with initial data..."

# Users
@"
INSERT INTO public."Users" (name, email, password, address)
VALUES
  ('John Doe', 'john.doe@example.com', 'password1', '123 Main St, Anytown'),
  ('Jane Smith', 'jane.smith@example.com', 'password2', '456 Elm St, Otherville'),
  ('Michael Johnson', 'michael.johnson@example.com', 'password3', '789 Oak St, Anycity'),
  ('Emily Brown', 'emily.brown@example.com', 'password4', '321 Pine St, Somewhere'),
  ('David Wilson', 'david.wilson@example.com', 'password5', '654 Birch St, Nowhere');
"@ | docker exec -i (docker-compose ps -q postgres) psql -U $env:POSTGRES_USER -d $env:POSTGRES_DB

# Products
@"
INSERT INTO public."Products" (name, description, price, stock)
VALUES
  ('Gold Necklace', 'Elegant gold necklace with intricate design', 299.99, 50),
  ('Diamond Ring', 'Stunning diamond ring with platinum band', 999.99, 30),
  ('Silver Pendant', 'Simple and stylish silver pendant', 49.99, 100),
  ('Pearl Earrings', 'Classic pearl earrings for any occasion', 149.99, 80),
  ('Ruby Bracelet', 'Luxurious ruby bracelet for a touch of glamour', 399.99, 20);
"@ | docker exec -i (docker-compose ps -q postgres) psql -U $env:POSTGRES_USER -d $env:POSTGRES_DB

Write-Output "Setup completed successfully!"
