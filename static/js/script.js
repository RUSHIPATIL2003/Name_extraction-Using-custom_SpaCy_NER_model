document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const browseLink = document.getElementById('browseLink');
    const selectedFileContainer = document.getElementById('selectedFileContainer');
    const selectedFileName = document.getElementById('selectedFileName');
    const submitButton = document.getElementById('submitButton');
    const uploadStatus = document.getElementById('uploadStatus');
    const resumeSelect = document.getElementById('resumeSelect');
    const searchInput = document.getElementById('searchInput');
    const documentViewer = document.getElementById('documentViewer');
    const candidateName = document.getElementById('candidateName');
    const candidatePosition = document.getElementById('candidatePosition');
    const originalFileName = document.getElementById('originalFileName');
    const fileType = document.getElementById('fileType');
    const fileSize = document.getElementById('fileSize');
    const uploadDate = document.getElementById('uploadDate');
    
    let selectedFile = null;
    
    // Load resumes on page load
    loadResumes();
    
    // File selection handling
    browseLink.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFileSelection(this.files[0]);
        }
    });
    
    // Drag and drop handling
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });
    
    // Submit button handling
    submitButton.addEventListener('click', handleFileUpload);
    
    // Resume selection handling
    resumeSelect.addEventListener('change', function() {
        const resumeId = this.value;
        if (resumeId) {
            loadResumeDetails(resumeId);
        } else {
            clearResumeDetails();
        }
    });
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const options = resumeSelect.options;
        
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const text = option.text.toLowerCase();
            option.style.display = text.includes(searchTerm) || option.value === '' ? '' : 'none';
        }
    });
    
    function handleFileSelection(file) {
        if (!allowedFile(file.name)) {
            showStatus('Error: Please select a PDF, DOC, or DOCX file.', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            showStatus('Error: File size exceeds 10MB limit.', 'error');
            return;
        }
        
        selectedFile = file;
        selectedFileName.textContent = file.name;
        selectedFileContainer.style.display = 'block';
        clearStatus();
    }
    
    function handleFileUpload() {
        if (!selectedFile) {
            showStatus('Please select a file first.', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('resume', selectedFile);
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Uploading...';
        
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showStatus(`Resume uploaded successfully! Candidate: ${data.candidate_name}`, 'success');
                resetFileSelection();
                loadResumes(); // Refresh the resume list
            } else {
                showStatus(`Error: ${data.error}`, 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Resume';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showStatus('An error occurred during upload.', 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Resume';
        });
    }
    
    function resetFileSelection() {
        selectedFile = null;
        fileInput.value = '';
        selectedFileContainer.style.display = 'none';
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Resume';
    }
    
    function allowedFile(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        return ['pdf', 'doc', 'docx'].includes(extension);
    }
    
    function showStatus(message, type) {
        uploadStatus.textContent = message;
        uploadStatus.className = `status-message ${type}`;
        uploadStatus.style.display = 'block';
    }
    
    function clearStatus() {
        uploadStatus.style.display = 'none';
        uploadStatus.textContent = '';
    }
    
    function loadResumes() {
        fetch('/resumes')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error loading resumes:', data.error);
                return;
            }
            
            // Clear existing options except the first one
            while (resumeSelect.options.length > 1) {
                resumeSelect.remove(1);
            }
            
            // Add new options
            data.resumes.forEach(resume => {
                const option = document.createElement('option');
                option.value = resume.id;
                option.textContent = `${resume.original_name} - ${resume.candidate_name}`;
                resumeSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    function loadResumeDetails(resumeId) {
        fetch(`/resume/${resumeId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error loading resume details:', data.error);
                return;
            }
            
            // Update candidate information
            candidateName.textContent = data.candidate_name || '-';
            candidatePosition.textContent = data.position || '-';
            originalFileName.textContent = data.original_name;
            fileType.textContent = data.file_type.toUpperCase();
            fileSize.textContent = formatFileSize(data.file_size);
            uploadDate.textContent = data.upload_date;
            
            // Update document viewer
            documentViewer.innerHTML = `
                <div class="document-info">
                    <h4>${data.original_name}</h4>
                    <p><strong>Candidate:</strong> ${data.candidate_name || 'Not detected'}</p>
                    <p><strong>Position:</strong> ${data.position || 'Not specified'}</p>
                    <p><strong>File Type:</strong> ${data.file_type.toUpperCase()}</p>
                    <p><strong>File Size:</strong> ${formatFileSize(data.file_size)}</p>
                    <p><strong>Uploaded:</strong> ${data.upload_date}</p>
                    <p class="view-note">Note: For security reasons, the actual document content is not displayed here.</p>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    function clearResumeDetails() {
        candidateName.textContent = '-';
        candidatePosition.textContent = '-';
        originalFileName.textContent = '-';
        fileType.textContent = '-';
        fileSize.textContent = '-';
        uploadDate.textContent = '-';
        documentViewer.innerHTML = `
            <div class="no-document">
                <p>No document selected</p>
                <p>Select a resume from the list to view it here</p>
            </div>
        `;
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
});