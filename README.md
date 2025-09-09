Setup:

- Create a virtual environment in a project folder on your device
- Install dependencies from requirements.txt (pip install -r requirements.txt)     
- Place the provided ML model <already exist> in the models/ directory (The ML model is already trained and provided as a .pkl file)
- Set up database connections using environment variables
- If all requirements are satisfied then Run the application: python app.py

Note : 
- Model training notebook [custom_SpaCy_NER_model.ipynb] provided just for practice purposes.
- All dependencies will be installed in the virtual environment. If you want to run the app then every time you will want to activate a virtual environment you created, otherwise it doesn't work.


#File Structure:
resume-management-system/
├── app.py             #python --version 3.11
├── requirements.txt    
├── models/
│   └── name_extraction_model.pkl
├── uploads/
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── templates/
│   └── index.html
└── .env (for database credentials)   # postgresql

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Implementation Details:

Setup:
- Create virtual environment and install dependencies from requirements.txt
- Place the provided ML model in the models/ directory
-Set up database connection using environment variables

Backend Implementation:
-Create Flask app with configured routes
-Implement file upload handling with security measures (file type validation, secure filename handling)
-Implement text extraction based on file type
-Integrate the ML model for name extraction
-Implement database operations (insert, select)

Frontend Implementation:
-Create responsive HTML layout based on the design mockup
-Style with CSS to match the professional HR application aesthetic
-Implement JavaScript for dynamic functionality:
  -File drag-and-drop and selection
  -API calls to backend
  -Dynamic population of resume list and details

Error Handling:
-Implement proper error handling for file processing
-Handle cases where ML model doesn't find a name
-Provide user feedback for successful operations and errors

Expected Behavior
-User visits the application and sees the upload interface
-User drags/drops or selects a resume file (PDF/DOC/DOCX)
-File is uploaded to the server, which:
  -Saves the file to the uploads/ directory
  -Extracts text content based on file type
  -Processes text with the ML model to extract candidate name
  -Stores filename, extracted name, and timestamp in database
-User can then select any resume from the dropdown in the Resume Library section
-When a resume is selected, the candidate information panel displays:
  -Extracted candidate name
  -Original filename
  -Upload date/time
-User can search resumes by filename or candidate name

Deliverables:
-Complete source code with the specified file structure
-Requirements.txt file with all dependencies
-Documentation on how to set up and run the application
-The application should run without errors when tested with sample resumes

