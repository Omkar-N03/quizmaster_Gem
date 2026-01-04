/* ==========================================================================
   GLOBAL VARIABLES & DATA REPOSITORY
   ========================================================================== */
let currentStep = 1;
const totalSteps = 3;

// 🟢 DATABASE: PRESET QUESTIONS FOR SPECIFIC TOPICS
const TOPIC_VAULT = {
    'dsa': [
        { text: "What is the time complexity of searching in a balanced BST?", type: "multiple_choice", marks: 5, options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], correct: 1, explanation: "Height is log(n) in balanced trees." },
        { text: "Which data structure implements LIFO?", type: "multiple_choice", marks: 5, options: ["Queue", "Stack", "Array", "Graph"], correct: 1, explanation: "Stack is Last-In-First-Out." },
        { text: "In a min-heap, the smallest element is at the...", type: "multiple_choice", marks: 5, options: ["Root", "Leaf", "Middle", "Random"], correct: 0, explanation: "Root always holds the minimum in a min-heap." },
        { text: "Worst case complexity of QuickSort?", type: "multiple_choice", marks: 5, options: ["O(n log n)", "O(n^2)", "O(n)", "O(1)"], correct: 1, explanation: "Occurs when the pivot is the smallest or largest element repeatedly." },
        { text: "A graph without cycles is a...", type: "multiple_choice", marks: 2, options: ["Tree", "Ring", "Mesh", "Star"], correct: 0, explanation: "A connected acyclic graph is a tree." },
        { text: "Linked Lists require contiguous memory.", type: "true_false", marks: 2, options: ["True", "False"], correct: 1, explanation: "They use pointers to link scattered memory blocks." },
        { text: "Which traversal gives sorted order in BST?", type: "multiple_choice", marks: 5, options: ["Preorder", "Inorder", "Postorder", "BFS"], correct: 1, explanation: "Inorder traversal visits Left-Root-Right." },
        { text: "Stack overflow occurs when...", type: "multiple_choice", marks: 3, options: ["Stack is empty", "Stack is full", "Heap is full", "None"], correct: 1, explanation: "When you push to a full stack." },
        { text: "Binary Search can be applied to...", type: "multiple_choice", marks: 4, options: ["Sorted arrays", "Unsorted arrays", "Linked Lists", "Any list"], correct: 0, explanation: "The data must be sorted for binary search logic." },
        { text: "Which is not a linear data structure?", type: "multiple_choice", marks: 4, options: ["Array", "LinkedList", "Tree", "Queue"], correct: 2, explanation: "Trees are hierarchical, not linear." }
    ],
    'python': [
        { text: "Which keyword is used to define a function in Python?", type: "multiple_choice", marks: 5, options: ["func", "def", "function", "define"], correct: 1, explanation: "'def' is the keyword." },
        { text: "Lists in Python are immutable.", type: "true_false", marks: 2, options: ["True", "False"], correct: 1, explanation: "False. Lists are mutable; Tuples are immutable." },
        { text: "What is the output of print(2 ** 3)?", type: "multiple_choice", marks: 3, options: ["6", "8", "9", "Error"], correct: 1, explanation: "** is the exponentiation operator (2^3 = 8)." },
        { text: "Which collection stores unique items only?", type: "multiple_choice", marks: 5, options: ["List", "Tuple", "Set", "Dictionary"], correct: 2, explanation: "Sets automatically remove duplicates." },
        { text: "How do you start a comment in Python?", type: "multiple_choice", marks: 2, options: ["//", "/*", "#", "--"], correct: 2, explanation: "# is used for single line comments." },
        { text: "What data type is the result of input()?", type: "multiple_choice", marks: 3, options: ["Integer", "String", "Float", "Boolean"], correct: 1, explanation: "input() always returns a string." },
        { text: "Which library is used for data analysis?", type: "multiple_choice", marks: 4, options: ["Django", "Pandas", "Flask", "PyGame"], correct: 1, explanation: "Pandas is the standard for data manipulation." },
        { text: "Python supports multiple inheritance.", type: "true_false", marks: 5, options: ["True", "False"], correct: 0, explanation: "Yes, a class can inherit from multiple parent classes." },
        { text: "What is the output of len(['a', 'b', 'c'])?", type: "multiple_choice", marks: 3, options: ["2", "3", "4", "0"], correct: 1, explanation: "There are 3 elements." },
        { text: "Which method adds an element to the end of a list?", type: "multiple_choice", marks: 4, options: ["add()", "insert()", "append()", "extend()"], correct: 2, explanation: "append() adds to the tail." }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Video Background
    const video = document.querySelector('.video-background video');
    if (video) {
        video.addEventListener('error', () => {
            const bg = document.querySelector('.video-background');
            if (bg) { bg.style.display = 'none'; }
        });
        video.play().catch(() => {});
    }

    // 2. Initialize Form Submission
    const form = document.getElementById('createQuizForm');
    if (form) form.addEventListener('submit', handleFormSubmit);

    // 3. Initialize Generate Button
    const aiBtn = document.getElementById('ai-generate-btn');
    if (aiBtn) {
        aiBtn.addEventListener('click', (e) => {
            e.preventDefault();
            generateQuestionsBasedOnTopic();
        });
    }

    // 4. Initial Setup
    updateProgressLine();
    renumberQuestions(); 
});

/* ==========================================================================
   GENERATION LOGIC (UPDATED)
   ========================================================================== */
function generateQuestionsBasedOnTopic() {
    // 1. Get the topic from user input
    const topicInput = document.getElementById('aiTopic');
    const rawTopic = topicInput ? topicInput.value.trim().toLowerCase() : '';

    if (!rawTopic) {
        showNotification('⚠️ Please enter a topic (e.g., "DSA", "Python")', 'warning');
        topicInput.focus();
        return;
    }

    // 2. Clear existing questions
    document.getElementById('questionsContainer').innerHTML = '';
    
    showAILoading(true);

    // 3. Determine which set to load
    let selectedQuestions = [];
    let detectedTopic = "";

    // Simple keyword matching
    if (rawTopic.includes('dsa') || rawTopic.includes('algorithm') || rawTopic.includes('structure')) {
        selectedQuestions = TOPIC_VAULT['dsa'];
        detectedTopic = "Data Structures & Algorithms";
    } else if (rawTopic.includes('python') || rawTopic.includes('py')) {
        selectedQuestions = TOPIC_VAULT['python'];
        detectedTopic = "Python Programming";
    } else {
        // Fallback for unknown topics (Generic Mock)
        detectedTopic = "General Knowledge (Fallback)";
        selectedQuestions = [
            { text: `What is a key feature of ${rawTopic}?`, type: "multiple_choice", marks: 5, options: ["Speed", "Flexibility", "Security", "All of the above"], correct: 3 },
            { text: `Is ${rawTopic} popular in 2025?`, type: "true_false", marks: 5, options: ["True", "False"], correct: 0 },
            // ... add more generic ones if needed
        ];
        showNotification(`ℹ️ Exact preset not found for "${rawTopic}". Generating generic questions.`, 'info');
    }

    // 4. Update Form Meta Fields
    document.getElementById('title').value = `${detectedTopic} Quiz`;
    document.getElementById('category').value = detectedTopic;
    document.getElementById('total_marks').value = selectedQuestions.reduce((sum, q) => sum + q.marks, 0);

    // 5. Inject Questions with delay for effect
    setTimeout(() => {
        selectedQuestions.forEach((q, index) => {
            addQuestion(q);
        });
        showAILoading(false);
        showNotification(`✅ Generated 10 Questions for ${detectedTopic}!`, 'success');
        
        // Scroll to questions
        document.getElementById('questionsContainer').scrollIntoView({ behavior: 'smooth' });
    }, 1000); // 1 second "processing" delay
}

function showAILoading(show) {
    const loading = document.getElementById('aiLoading');
    const btn = document.getElementById('ai-generate-btn');
    
    if (loading) loading.style.display = show ? 'block' : 'none';
    if (btn) {
        btn.disabled = show;
        btn.innerHTML = show ? 'Generating... <i class="fas fa-spinner fa-spin"></i>' : '✨ Generate Questions';
    }
}

/* ==========================================================================
   NAVIGATION FUNCTIONS
   ========================================================================== */
function nextStep() {
    if (!validateStep(currentStep)) return;

    if (currentStep < totalSteps) {
        toggleStepClasses(currentStep, false);
        currentStep++;
        toggleStepClasses(currentStep, true);
        updateProgressLine();

        if (currentStep === 3) populateReview();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevStep() {
    if (currentStep > 1) {
        toggleStepClasses(currentStep, false);
        currentStep--;
        toggleStepClasses(currentStep, true);
        updateProgressLine();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function toggleStepClasses(step, isActive) {
    const formStep = document.querySelector(`.form-step[data-step="${step}"]`);
    const progressStep = document.querySelector(`.step[data-step="${step}"]`);
    
    if (isActive) {
        if (formStep) formStep.classList.add('active');
        if (progressStep) {
            progressStep.classList.add('active');
            progressStep.classList.remove('completed');
        }
    } else {
        if (formStep) formStep.classList.remove('active');
        if (progressStep) {
            progressStep.classList.remove('active');
            if (step < currentStep) progressStep.classList.add('completed');
        }
    }
}

function updateProgressLine() {
    const progressLine = document.getElementById('progressLine');
    if (progressLine) {
        const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressLine.style.width = `${percentage}%`;
    }
}

/* ==========================================================================
   VALIDATION LOGIC
   ========================================================================== */
function validateStep(step) {
    if (step === 1) return validateStepOne();
    if (step === 2) return validateStepTwo();
    return true;
}

function validateStepOne() {
    const ids = ['title', 'category', 'difficulty', 'total_marks'];
    for (const id of ids) {
        const el = document.getElementById(id);
        if (!el || !el.value.trim()) {
            showNotification(`⚠️ Please check the ${id.replace('_', ' ')} field`, 'warning');
            el?.focus();
            return false;
        }
    }
    return true;
}

function validateStepTwo() {
    const questions = document.querySelectorAll('.question-block');
    if (questions.length === 0) {
        showNotification('⚠️ Please add at least one question', 'warning');
        return false;
    }
    for (let i = 0; i < questions.length; i++) {
        if (!validateSingleQuestion(questions[i], i + 1)) return false;
    }
    return true;
}

function validateSingleQuestion(question, num) {
    const text = question.querySelector('textarea[name*="[text]"]')?.value.trim();
    if (!text) {
        showNotification(`⚠️ Question ${num} is missing text`, 'warning');
        question.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
    }
    const correct = question.querySelector('input[type="radio"][name*="[correct]"]:checked');
    if (!correct) {
        showNotification(`⚠️ Select answer for Question ${num}`, 'warning');
        question.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
    }
    return true;
}

/* ==========================================================================
   QUESTION MANAGEMENT
   ========================================================================== */
function addQuestion(data = null) {
    const isManual = !data || data instanceof Event;
    const q = isManual ? { text: '', type: 'multiple_choice', marks: 1, explanation: '', options: ['', '', '', ''], correct: 0 } : data;
    const tempId = document.querySelectorAll('.question-block').length + 1;
    
    const html = `
        <div class="question-block" data-question="${tempId}">
            <div class="question-header">
                <h4>Question ${tempId}</h4>
                <button type="button" class="remove-question-btn" onclick="removeQuestion(this)">✕</button>
            </div>
            <div class="form-group">
                <label>Question Text *</label>
                <textarea name="questions[${tempId}][text]" required rows="2">${q.text}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Type</label>
                    <select name="questions[${tempId}][type]" onchange="toggleQuestionType(this)">
                        <option value="multiple_choice" ${q.type === 'multiple_choice' ? 'selected' : ''}>Multiple Choice</option>
                        <option value="true_false" ${q.type === 'true_false' ? 'selected' : ''}>True/False</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Marks</label>
                    <input type="number" name="questions[${tempId}][marks]" value="${q.marks}" min="1" required>
                </div>
            </div>
            <div class="options-container">
                ${generateOptionsHTML(tempId, q.type, q.options, q.correct)}
            </div>
            <div class="form-group" style="margin-top:15px;">
                <label>Explanation</label>
                <textarea name="questions[${tempId}][explanation]" rows="1">${q.explanation || ''}</textarea>
            </div>
        </div>
    `;
    
    document.getElementById('questionsContainer').insertAdjacentHTML('beforeend', html);
    renumberQuestions(); 
}

function generateOptionsHTML(id, type, vals = [], correct = 0) {
    if (type === 'true_false') {
        return `
            <div class="option-group"><input type="text" value="True" readonly><input type="radio" name="questions[${id}][correct]" value="0" ${correct == 0 ? 'checked' : ''}><label>Correct</label></div>
            <div class="option-group"><input type="text" value="False" readonly><input type="radio" name="questions[${id}][correct]" value="1" ${correct == 1 ? 'checked' : ''}><label>Correct</label></div>
        `;
    }
    const labels = ['A', 'B', 'C', 'D'];
    const options = (vals && vals.length) ? vals : ['', '', '', ''];
    return options.map((val, i) => `
        <div class="option-group">
            <input type="text" name="questions[${id}][options][]" value="${val}" placeholder="Option ${labels[i]}" required>
            <input type="radio" name="questions[${id}][correct]" value="${i}" ${i === parseInt(correct) ? 'checked' : ''} ${i === 0 ? 'required' : ''}>
            <label>Correct</label>
        </div>
    `).join('');
}

function toggleQuestionType(select) {
    const block = select.closest('.question-block');
    const id = block.dataset.question;
    block.querySelector('.options-container').innerHTML = generateOptionsHTML(id, select.value);
}

function removeQuestion(btn) {
    if (confirm('Remove this question?')) {
        const block = btn.closest('.question-block');
        block.remove();
        renumberQuestions();
    }
}

function renumberQuestions() {
    document.querySelectorAll('.question-block').forEach((q, index) => {
        const newNum = index + 1;
        q.dataset.question = newNum;
        q.querySelector('h4').textContent = `Question ${newNum}`;
        q.querySelectorAll('input, select, textarea').forEach(input => {
            if (input.name) input.name = input.name.replace(/questions\[.*?\]/, `questions[${newNum}]`);
        });
    });
    updateQuestionsSummary();
}

function updateQuestionsSummary() {
    const count = document.querySelectorAll('.question-block').length;
    const summary = document.getElementById('questionsSummary');
    const countEl = document.getElementById('questionsCount');
    if (countEl) countEl.textContent = count;
    if (summary) summary.style.display = count > 0 ? 'block' : 'none';
}

/* ==========================================================================
   REVIEW & UTILS
   ========================================================================== */
function populateReview() {
    const reviewContent = document.getElementById('reviewContent');
    if (!reviewContent) return;
    
    const qHTML = [...document.querySelectorAll('.question-block')].map((q, i) => {
        const text = q.querySelector('textarea[name*="[text]"]').value;
        return `<div class="review-question"><strong>Q${i+1}:</strong> ${text}</div>`;
    }).join('');

    reviewContent.innerHTML = `
        <div class="review-section">
            <h3>Summary</h3>
            <p><strong>Title:</strong> ${document.getElementById('title').value}</p>
            <p><strong>Questions:</strong> ${document.querySelectorAll('.question-block').length}</p>
        </div>
        <div class="review-section">${qHTML}</div>
    `;
}

function handleFormSubmit(e) {
    if (!validateStepTwo()) { e.preventDefault(); return false; }
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'total_questions';
    input.value = document.querySelectorAll('.question-block').length;
    e.target.appendChild(input);
    return true;
}

function showNotification(msg, type) {
    const n = document.createElement('div');
    n.className = `notification notification-${type}`;
    n.textContent = msg;
    n.style.cssText = `position:fixed;top:20px;right:20px;padding:15px;background:${type=='success'?'#4caf50':type=='error'?'#f44336':'#2196f3'};color:white;border-radius:5px;z-index:9999;`;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
}

// Global Exports
Object.assign(globalThis, { nextStep, prevStep, addQuestion, removeQuestion, toggleQuestionType, generateQuestionsBasedOnTopic });