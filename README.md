# Fridger App
[Link to the application](https://mealer.3iavgloqklubq.eu-central-1.cs.amazonlightsail.com/)

## Project Description

The main goal of application is: make following meal plan easier. User can add weekly meal plan into this app with specific quantities of each meal. After inserting all this data, a grocery list will be generated accordingly and all food will be “placed” into “digital” fridge. When the user completes a meal, he ticks a box that meal was completed and fridge content is adjusted accordingly. 
Additional feature - AI generated meal suggestion. User can implement AI to generate a meal suggestion based on meal type and calories.

## !!This is a minimum viable product version!!
So far user can add meals, meal plans, ingredients to meals. Generate grocery list based on current active meal plan and populate fridge content.

## Setup Instructions

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. **Clone the repository:**
   ```sh
   git clone 
2. **Install dependencies:**
   ```sh
   npm install
3. **Environment Variables**

   ## IMPORTANT: Before running the application, ensure you have set up dummy (or real ones :)) databases.

   - Rename the `.env.example` file to `.env`.
   - Fill in your own database links and token key details in the `.env` file.

5. **Run Database Migrations**
   ```sh
   npm run migrate:latest
   npm run gen:types

## Running the Application
5. **Start the servers separate terminals (recommended)**
   ```sh
   npm run dev -w server
   npm run dev -w client
   ```
6. **Run tests**
    *IMPORTANT⚠️. To properly run the test suite it is _recommended_ to use safe mode. It will take longer to run all tests, but it is guaranteed that there will be no errors due to test base setups. Otherwise you can run regular test script:
   ```sh
   npm run test
   or
   npm run test:safe
   
## Using application's front-end locally
After you start both servers (server/client) visit http://localhost:5173/

## Using Controller methods in the back-end
To interact with the controller methods it is recommended to you http://localhost:3000/api/v1/trpc-panel in your browser. Or you can use tools like Postman or any similar API testing tool. If you choose to use tRPC-panel make sure that:
1. After logging in as user copy received token key
2. In the top right corner press "Headers"
3. Add Key = Authorization
5. Add Value = your received token key
6. Press "Save Headers" and "Confirm"
7. Explore various methods.

## Current Database structure
![image](https://github.com/user-attachments/assets/877b2479-b8ea-404c-a694-bb7827972bf1)
