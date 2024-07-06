# Load environment variables from .env file
$envVars = Get-Content ".env" | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [PSCustomObject]@{
            Name = $Matches[1].Trim()
            Value = $Matches[2].Trim()
        }
    }
}

foreach ($envVar in $envVars) {
    [System.Environment]::SetEnvironmentVariable($envVar.Name, $envVar.Value, "Machine")
}

# Step 1: Start Docker containers
Write-Output "Starting Docker containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
Write-Output "Waiting for PostgreSQL to be ready..."
$pgReady = $false
$maxAttempts = 10
$attempt = 0

while (-not $pgReady -and $attempt -lt $maxAttempts) {
    $output = docker exec slash-asessment pg_isready -U root -d nestjs_prisma
    if ($output -match "accepting connections") {
        $pgReady = $true
    } else {
        $attempt++
        Start-Sleep -Seconds 5
    }
}

if (-not $pgReady) {
    Write-Error "PostgreSQL did not become ready after $maxAttempts attempts."
    exit 1
}

# Step 2: Apply Prisma schema
Write-Output "Applying Prisma schema..."
npx prisma generate
npx prisma migrate deploy

# Step 3: Populate the database
Write-Output "Populating the database with initial data..."

# Users
$usersQuery = @"
INSERT INTO public."Users" (name, email, password, address)
VALUES
  ('John Doe', 'john.doe@example.com', 'password1', '123 Main St, Anytown'),
  ('Jane Smith', 'jane.smith@example.com', 'password2', '456 Elm St, Otherville'),
  ('Michael Johnson', 'michael.johnson@example.com', 'password3', '789 Oak St, Anycity'),
  ('Emily Brown', 'emily.brown@example.com', 'password4', '321 Pine St, Somewhere'),
  ('David Wilson', 'david.wilson@example.com', 'password5', '654 Birch St, Nowhere');
"@

docker exec -i slash-asessment psql  -U root -d nestjs_prisma -c $usersQuery

# Products
$productsQuery = @"
INSERT INTO public."Products" (name, description, price, stock)
VALUES
  ('Gold Necklace', 'Elegant gold necklace with intricate design', 299.99, 50),
  ('Diamond Ring', 'Stunning diamond ring with platinum band', 999.99, 30),
  ('Silver Pendant', 'Simple and stylish silver pendant', 49.99, 100),
  ('Pearl Earrings', 'Classic pearl earrings for any occasion', 149.99, 80),
  ('Ruby Bracelet', 'Luxurious ruby bracelet for a touch of glamour', 399.99, 20);
"@

docker exec -i slash-asessment psql  -U root -d nestjs_prisma -c $productsQuery

Write-Output "Setup completed successfully!"
