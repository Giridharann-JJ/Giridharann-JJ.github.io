// Grade point mapping based on the college grading system
const gradePoints = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'U': 0
};

// Subject counter for unique IDs
let subjectCounter = 0;

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    attachEventListeners();
});

function initializeCalculator() {
    // Create initial 6 subjects
    for (let i = 0; i < 6; i++) {
        addSubject();
    }
}

function attachEventListeners() {
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    
    addSubjectBtn.addEventListener('click', addSubject);
    calculateBtn.addEventListener('click', calculateCGPA);
}

function addSubject() {
    const subjectsContainer = document.getElementById('subjectsContainer');
    const currentRowCount = subjectsContainer.querySelectorAll('tr').length;
    const newRowNumber = currentRowCount + 1;
    
    const subjectRow = document.createElement('tr');
    subjectRow.setAttribute('data-subject-id', newRowNumber);
    
    subjectRow.innerHTML = `
        <td>
            <span class="course-number">${newRowNumber}.</span>
            ${newRowNumber > 6 ? '<button type="button" class="remove-subject" onclick="removeSubject(this)">Remove</button>' : ''}
        </td>
        <td>
            <div class="form-group">
                <input type="number" id="credits-${newRowNumber}" 
                       placeholder="" min="1" max="10" required>
            </div>
        </td>
        <td>
            <div class="form-group">
                <select id="grade-${newRowNumber}" required>
                    <option value="">Select</option>
                    <option value="O">O</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="U">U</option>
                </select>
            </div>
        </td>
    `;
    
    subjectsContainer.appendChild(subjectRow);
    
    // Update the global counter to match the actual number of rows
    subjectCounter = newRowNumber;
    
    // Add input validation listeners
    const creditsInput = subjectRow.querySelector(`#credits-${newRowNumber}`);
    const gradeSelect = subjectRow.querySelector(`#grade-${newRowNumber}`);
    
    creditsInput.addEventListener('input', validateCredits);
    gradeSelect.addEventListener('change', validateGrade);
}

function removeSubject(button) {
    const subjectRow = button.closest('tr');
    subjectRow.remove();
    updateSubjectNumbers();
    // Decrease the global counter if we're removing from the end
    const remainingRows = document.querySelectorAll('#subjectsContainer tr').length;
    if (remainingRows < subjectCounter) {
        subjectCounter = remainingRows;
    }
}

function updateSubjectNumbers() {
    const subjects = document.querySelectorAll('#subjectsContainer tr');
    subjects.forEach((subject, index) => {
        const courseNumber = subject.querySelector('.course-number');
        if (courseNumber) {
            courseNumber.textContent = `${index + 1}.`;
        }
        
        // Update the data attribute for proper tracking
        subject.setAttribute('data-subject-id', index + 1);
        
        // Update remove button visibility - only show for subjects beyond the first 6
        const removeBtn = subject.querySelector('.remove-subject');
        if (removeBtn) {
            if (index < 6) {
                removeBtn.style.display = 'none';
            } else {
                removeBtn.style.display = 'inline-block';
            }
        }
    });
}

function validateCredits(event) {
    const input = event.target;
    const value = parseFloat(input.value);
    const formGroup = input.closest('.form-group');
    
    // Remove previous error state
    formGroup.classList.remove('error');
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    if (input.value && (isNaN(value) || value < 1 || value > 10)) {
        formGroup.classList.add('error');
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Credits must be between 1 and 10';
        formGroup.appendChild(errorMsg);
    }
}



function validateGrade(event) {
    const select = event.target;
    const formGroup = select.closest('.form-group');
    
    // Remove previous error state
    formGroup.classList.remove('error');
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function calculateCGPA() {
    const subjects = document.querySelectorAll('#subjectsContainer tr');
    let totalCredits = 0;
    let totalGradePoints = 0;
    let isValid = true;
    let validSubjects = 0;
    
    // Clear all previous errors
    document.querySelectorAll('.form-group.error').forEach(group => {
        group.classList.remove('error');
        const errorMsg = group.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    });
    
    // Add calculating state
    document.body.classList.add('calculating');
    
    subjects.forEach((subject, index) => {
        const credits = parseFloat(subject.querySelector(`input[id*="credits"]`).value);
        const grade = subject.querySelector(`select[id*="grade"]`).value;
        
        // Skip empty subjects (both fields empty)
        if (!credits && !grade) {
            return;
        }
        
        // Validate individual fields for non-empty subjects
        let subjectValid = true;
        
        if (!credits || isNaN(credits) || credits < 1 || credits > 10) {
            showFieldError(subject.querySelector(`input[id*="credits"]`), 'Valid credits (1-10) required');
            subjectValid = false;
        }
        
        if (!grade) {
            showFieldError(subject.querySelector(`select[id*="grade"]`), 'Grade selection is required');
            subjectValid = false;
        }
        
        if (!subjectValid) {
            isValid = false;
            return;
        }
        
        // Calculate grade points for valid subjects
        const gradePoint = gradePoints[grade];
        
        // Debug log to verify U grades are included
        console.log(`Subject ${validSubjects + 1}: Credits=${credits}, Grade=${grade}, Points=${gradePoint}, Total Points=${credits * gradePoint}`);
        
        totalCredits += credits;
        totalGradePoints += (credits * gradePoint);
        validSubjects++;
    });
    
    // Remove calculating state
    setTimeout(() => {
        document.body.classList.remove('calculating');
    }, 500);
    
    if (!isValid) {
        hideResult();
        showNotification('Please fill in all required fields correctly', 'error');
        return;
    }
    
    if (validSubjects === 0) {
        hideResult();
        showNotification('Please add at least one course to calculate CGPA', 'warning');
        return;
    }
    
    // Calculate CGPA
    const cgpa = totalGradePoints / totalCredits;
    
    // Debug log to verify final calculation
    console.log(`Final Calculation: Total Credits=${totalCredits}, Total Grade Points=${totalGradePoints}, CGPA=${cgpa.toFixed(2)}`);
    
    // Display results
    displayResult(cgpa, totalCredits, validSubjects);
    showNotification('CGPA calculated successfully!', 'success');
}

function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.add('error');
    
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.textContent = message;
    formGroup.appendChild(errorMsg);
}

function displayResult(cgpa, totalCredits, subjectCount) {
    const resultSection = document.getElementById('resultSection');
    const cgpaValue = document.getElementById('cgpaValue');
    const totalCreditsSpan = document.getElementById('totalCredits');
    
    // Animate CGPA value
    animateValue(cgpaValue, 0, cgpa, 1000);
    totalCreditsSpan.textContent = totalCredits;
    
    // Show result section with animation
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = progress * (end - start) + start;
        element.textContent = currentValue.toFixed(2);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function hideResult() {
    const resultSection = document.getElementById('resultSection');
    resultSection.style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
    }
    
    const closeButton = notification.querySelector('button');
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
        opacity: 0.8;
        transition: opacity 0.2s ease;
    `;
    
    closeButton.addEventListener('mouseenter', () => closeButton.style.opacity = '1');
    closeButton.addEventListener('mouseleave', () => closeButton.style.opacity = '0.8');
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateY(0);
            max-height: 200px;
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
            max-height: 0;
        }
    }
`;
document.head.appendChild(style);

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to calculate
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        calculateCGPA();
    }
    
    // Ctrl/Cmd + Plus to add subject
    if ((event.ctrlKey || event.metaKey) && event.key === '+') {
        event.preventDefault();
        addSubject();
    }
});

// Add helpful tooltips
function addTooltips() {
    const tooltipElements = [
        { selector: '.grade-info', text: 'This shows the grading system used by your college' },
        { selector: '#addSubjectBtn', text: 'Click to add a new subject (Ctrl + +)' },
        { selector: '#calculateBtn', text: 'Calculate your CGPA (Ctrl + Enter)' }
    ];
    
    tooltipElements.forEach(({ selector, text }) => {
        const element = document.querySelector(selector);
        if (element) {
            element.title = text;
        }
    });
}

// Initialize tooltips when page loads
document.addEventListener('DOMContentLoaded', addTooltips);
