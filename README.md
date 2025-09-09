Implementation Details

# Setup:

- Create a virtual environment in a project folder on your device
- Install dependencies from requirements.txt (pip install -r requirements.txt)     
- Place the provided ML model <already exist> in the models/ directory (The ML model is already trained and provided as a .pkl file)
- Set up database connections using environment variables
- If all requirements are satisfied then Run the application: python app.py

Note : 
- Model training notebook [custom_SpaCy_NER_model.ipynb] provided just for practice purposes.
- All dependencies will be installed in the virtual environment. If you want to run the app then every time you will want to activate a virtual environment you created, otherwise it doesn't work.


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

