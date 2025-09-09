import os
import psycopg2
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import fitz  # PyMuPDF
import docx2txt
import spacy
import joblib
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size

# Database configuration
DB_CONFIG = {
    'dbname': os.getenv('DB_NAME', 'your_database'),
    'user': os.getenv('DB_USER', 'your_username'),
    'password': os.getenv('DB_PASSWORD', 'your_password'),
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432')
}

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

# Load your trained model
try:
    nlp = joblib.load('models/name_extraction_model.pkl')
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    nlp = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()
    return text.strip()

def extract_text_from_docx(docx_path):
    text = docx2txt.process(docx_path)
    return text.strip()

def extract_name(resume_text):
    if nlp is None:
        return "Model not available"
    
    try:
        doc = nlp(resume_text)
        names = [ent.text for ent in doc.ents if ent.label_ == "NAME"]
        return names[0] if names else "Name not found"
    except Exception as e:
        return f"Error extracting name: {str(e)}"

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'resume' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    if file and allowed_file(file.filename):
        # Generate secure filename and prepare file path
        original_filename = file.filename
        filename = secure_filename(original_filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Ensure upload directory exists
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # Save file
        file.save(file_path)
        
        # Get file info
        file_size = os.path.getsize(file_path)
        file_type = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'unknown'
        
        # Extract text based on file type
        try:
            if file_type == 'pdf':
                text = extract_text_from_pdf(file_path)
            elif file_type in ['doc', 'docx']:
                text = extract_text_from_docx(file_path)
            else:
                return jsonify({'error': 'Unsupported file type'})
        except Exception as e:
            return jsonify({'error': f'Error extracting text: {str(e)}'})
        
        # Extract name using your model
        candidate_name = extract_name(text)
        
        # For now, set position as "To be determined" - you can extend this later
        position = "To be determined"
        
        # Save to database
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute(
                """INSERT INTO resumes (filename, original_name, file_size, file_type, 
                candidate_name, position, file_path, upload_date) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                (filename, original_filename, file_size, file_type, candidate_name, 
                 position, file_path, datetime.now())
            )
            resume_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            
            return jsonify({
                'success': True,
                'id': resume_id,
                'filename': filename,
                'original_name': original_filename,
                'file_size': file_size,
                'file_type': file_type,
                'candidate_name': candidate_name,
                'position': position
            })
        except Exception as e:
            return jsonify({'error': f'Database error: {str(e)}'})
    
    return jsonify({'error': 'Invalid file type'})

@app.route('/resumes')
def get_resumes():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, filename, original_name, file_size, file_type, 
                   candidate_name, position, file_path, upload_date 
            FROM resumes ORDER BY upload_date DESC
        """)
        resumes = cur.fetchall()
        cur.close()
        conn.close()
        
        resume_list = []
        for resume in resumes:
            resume_list.append({
                'id': resume[0],
                'filename': resume[1],
                'original_name': resume[2],
                'file_size': resume[3],
                'file_type': resume[4],
                'candidate_name': resume[5],
                'position': resume[6],
                'file_path': resume[7],
                'upload_date': resume[8].strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return jsonify({'resumes': resume_list})
    except Exception as e:
        return jsonify({'error': f'Database error: {str(e)}'})

@app.route('/resume/<int:resume_id>')
def get_resume(resume_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, filename, original_name, file_size, file_type, 
                   candidate_name, position, file_path, upload_date 
            FROM resumes WHERE id = %s
        """, (resume_id,))
        resume = cur.fetchone()
        cur.close()
        conn.close()
        
        if resume:
            return jsonify({
                'id': resume[0],
                'filename': resume[1],
                'original_name': resume[2],
                'file_size': resume[3],
                'file_type': resume[4],
                'candidate_name': resume[5],
                'position': resume[6],
                'file_path': resume[7],
                'upload_date': resume[8].strftime('%Y-%m-%d %H:%M:%S')
            })
        else:
            return jsonify({'error': 'Resume not found'})
    except Exception as e:
        return jsonify({'error': f'Database error: {str(e)}'})

if __name__ == '__main__':
    # Create upload directory if it doesn't exist
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    app.run(debug=True)