# Order Management System 
## Description

This is an Order Management System made for the assessment of the summer internship at Slash

## Technology Stack



- NestJs
- Prisma
- PostgreSQL
- Docker
- Swagger

## Dependencies



- NPM
- NodeJs
- Docker

## Setting Up



- clone the repository `git clone https://github.com/helloworld877/slash-asessment.git`
- run `cd slash-asessment`
- run `npm install` to install the node dependencies
- then we run the setup script to launch a PostgreSQL Docker container, migrate the Prisma schema and populate the `Users` and `Products` tables (as Product and User creation were not requested in the requirements)
    - For Windows users
        - run `./setup.ps1`
    - For Linux users
        - run  `chmod +x setup.sh` then `./setup.sh`
- run `npm run start:dev`

## Documentation


To see the documentation visit <http://localhost:3000/api/> in your browser when the application is running

## Testing



- install the "Thunder client" VScode extension
- go to the Thunder Client tab you can find it on the left (bottom icon)

  
![image](https://github.com/helloworld877/slash-asessment/assets/74651584/f84fc954-22ba-4ce1-99e5-66e95610208c)

- click on the icon and go to the collections tab and import the collection JSON (`thunder-collection_Slash Assessment.JSON`) found in the main directory of the repository

![image](https://github.com/helloworld877/slash-asessment/assets/74651584/542cbba6-49ac-4cf4-8bd6-9a715ea628f1)


- After importing you will find pre-configured requests that you can edit to test the application


![image](https://github.com/helloworld877/slash-asessment/assets/74651584/231c403e-e170-47fe-b9a6-5c956a19e1bb)


## Notes



- To view the database you can connect to the database using PgAdmin 4
- The application runs on port `3000`
- The PostgreSQL docker container runs on port `5432`
- Ensure that ports `3000` and `5432` are open and have no apps running on them before running the project
- to stop the docker container from running run `docker-compose down`
- This will delete the container and the data will not persist
