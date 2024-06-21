# Order Management System 
## Description

---
This is an Order Management System made for the assessment of the summer internship at Slash

## Technology Stack

---

- NestJs
- Prisma
- PostgreSQL
- Docker
- Swagger

## Dependencies

---

- NPM
- NodeJs
- Docker

## Setting Up

---

- run `npm install` to install the node dependencies
- then we run the setup script to launch a PostgreSQL Docker container, migrate the Prisma schema and populate the `Users` and `Products` tables (as Product and User creation were not requested in the requirements)
- For Windows users
- run `./setup.ps1`
- For Linux users
- run  `chmod +x setup.sh` then `./setup.sh`
- run `npm run start:dev`

## Documentation

---
To see the documentation visit <http://localhost:3000/api/> in your browser when the application is running

## Testing

---

- install the "Thunder client" VScode extension
- go to the Thunder Client tab you can find it on the left (bottom icon)
![[Pasted image 20240621203332.png|]]
- click on the icon and go to the collections tab and import the collection JSON (`thunder-collection_Slash Assessment.JSON`) found in the main directory of the repository
![[Pasted image 20240621203457.png]]
- After importing you will find pre-configured requests that you can edit to test the application
![[Pasted image 20240621203652.png]]

## Notes

---

- To view the database you can connect to the database using PgAdmin 4
- The application runs on port `3000`
- The PostgreSQL docker container runs on port `5432`
- to stop the docker container from running run `docker-compose down`
- This will delete the container and the data will not persist
