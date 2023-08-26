# SpaceApplication
Data-Driven Web Application with Custom API and User Authentication

## Project Overview
This repository encompasses a website designed to provide an array of capabilities, including data visualization and manipulation. To ensure the security of the data, the website implements user authentication. The underlying infrastructure involves a MongoDB database and a customized API.

## Features
1.	Enhanced Website:
    - Incorporation of a dynamic Chart.js chart.
2.	Custom API and Data Management:
    - Transition from external API to internal data management.
    - The server fetches data from the chosen API and stores it in MongoDB for local storage.
    - The API facilitates essential CRUD operations (Create, Read, Update, Delete) for managing the data stored in MongoDB.
3.	User Authentication and Access Control:
    - A secondary website is managing user registration and login functionalities.
    - Access control: Only users with valid session cookies are granted access to the main website.
