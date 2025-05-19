# PDF Table Finder UI

This project is a React-based user interface designed for an application that automatically detects and extracts tables from PDF files. It provides an interactive environment where users can review and adjust the results of the detection and extraction process. Users can adjust the borders of automatically detected tables, manually draw table boundaries when necessary, and edit both the extracted data and the overall table structure.

## Demo
Deployed application is available at following URL: https://pdf-table-extractor.dyn.cloud.e-infra.cz/

## Technologies
- React
- Node.js (v22.13.1)
- Material UI
- Fabric.js
- Handsontable

## Setup Instructions

### 1. Prerequisites
- Node.js (v22.13.1)
- npm
- Back-end API for PDF processing available at https://github.com/ztunova/pdf-table-finder_BE 

### 2. Configuration
The application communicates with a back-end API for PDF processing. Ensure the API is running and its base URL is properly configured in `/src/constants.ts` file. Use first URL in the file for deployed back-end and the second URL for locally running API.

### 3. Installation and Running the Application
1) Clone the repository with `git clone`
2) Use `cd` to navigate to the project root directory
3) Install dependencies using `npm install`
4) Run project locally with `npm run dev`


### 4. Build Docker Image
The project includes a Dockerfile for containerized deployment. <br>
To build the Docker image, navigate to the project root directory and use command `docker build -t pdf-table-extractor-fe .`

## Project Structure
```
src/
├── components/
│   ├── pdf-components/   # Components for PDF rendering and interaction
│   ├── table-components/ # Components for table visualization and editing
│   └── ...               # Common component files
├── custom-context/       # Context providers for state management
└── pages/                # Application pages/routes
```

