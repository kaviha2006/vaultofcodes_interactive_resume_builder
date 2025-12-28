// STATE MANAGEMENT
const resumeData = {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: '',
    education: [],
    experience: [],
    projects: [],
    skills: [],
    achievements: []
};

// DOM ELEMENTS
const form = document.getElementById('resume-form');
const landingPage = document.getElementById('landing-page');
const appContainer = document.getElementById('app-container');

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    // Load from local storage if needed
    loadFromStorage();
    renderPreview();
    updateAnalysis();

    // Check Dark Mode
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        updateThemeIcons();
    }

    // Check View Mode
    if (localStorage.getItem('appMode') === 'builder') {
        landingPage.classList.add('hidden');
        appContainer.classList.remove('hidden');
    }
});

// NAVIGATION LOGIC
function goHome() {
    if (appContainer.classList.contains('hidden')) {
        location.reload(); // Already at home, simple reload
    } else {
        if (confirm("Exit builder and return to home? Unsaved changes are auto-saved.")) {
            appContainer.classList.add('hidden');
            landingPage.classList.remove('hidden');
            localStorage.setItem('appMode', 'landing');
            window.scrollTo(0, 0);
        }
    }
}

function enterBuilder() {
    landingPage.classList.add('hidden');
    appContainer.classList.remove('hidden');
    localStorage.setItem('appMode', 'builder');
    window.scrollTo(0, 0);
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        if (!landingPage.classList.contains('hidden')) {
            el.scrollIntoView({ behavior: 'smooth' });
        } else {
            // If in builder, go home then scroll
            goHome();
            // Note: goHome is async if user cancels, but if they confirm we can't easily callback.
            // Simplified: Just go home. User can click again.
        }
    }
}

// TEMPLATE SELECTION
function selectTemplateAndBuild(templateName) {
    // Set template in dropdown
    const select = document.getElementById('template-select');
    if (select) {
        select.value = templateName;
        // Trigger change event
        const event = new Event('change');
        select.dispatchEvent(event);
    }
    enterBuilder();
}


// INPUT HANDLERS
form.addEventListener('input', (e) => {
    const { name, value } = e.target;

    // Handle simple fields
    if (name && name in resumeData) {
        resumeData[name] = value;
    }

    renderPreview();
    updateAnalysis();
    saveToStorage();
});


// DYNAMIC SECTIONS HELPERS

function createInput(type, name, placeholder, value = '', className = '') {
    const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
    if (type !== 'textarea') input.type = type;
    input.placeholder = placeholder;
    input.value = value;
    input.className = className;
    return input;
}

// 1. EDUCATION
function addEducationField(data = {}) {
    const id = data.id || Date.now();
    const container = document.getElementById('education-list');

    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.dataset.id = id;

    div.innerHTML = `
        <button type="button" class="btn-remove" onclick="removeEducation('${id}')"><i class="fa-solid fa-times"></i></button>
        <div class="form-grid">
            <div class="form-group">
                <label>Degree</label>
                <input type="text" placeholder="e.g. BSc Computer Science" class="edu-degree" value="${data.degree || ''}" oninput="updateEducation('${id}')">
            </div>
            <div class="form-group">
                <label>Institution</label>
                <input type="text" placeholder="e.g. University of Tech" class="edu-school" value="${data.school || ''}" oninput="updateEducation('${id}')">
            </div>
            <div class="form-group">
                <label>Year</label>
                <input type="text" placeholder="2019 - 2023" class="edu-year" value="${data.year || ''}" oninput="updateEducation('${id}')">
            </div>
             <div class="form-group">
                <label>Grade/CGPA</label>
                <input type="text" placeholder="e.g. 9.0 CGPA" class="edu-grade" value="${data.grade || ''}" oninput="updateEducation('${id}')">
            </div>
        </div>
    `;

    container.appendChild(div);
    if (!data.id) {
        resumeData.education.push({ id, degree: '', school: '', year: '', grade: '' });
    }
}

function updateEducation(id) {
    const div = document.querySelector(`#education-list .dynamic-item[data-id="${id}"]`);
    const index = resumeData.education.findIndex(e => e.id == id);
    if (index > -1 && div) {
        resumeData.education[index] = {
            id,
            degree: div.querySelector('.edu-degree').value,
            school: div.querySelector('.edu-school').value,
            year: div.querySelector('.edu-year').value,
            grade: div.querySelector('.edu-grade').value
        };
        renderPreview();
        updateAnalysis();
        saveToStorage();
    }
}

function removeEducation(id) {
    resumeData.education = resumeData.education.filter(e => e.id != id);
    document.querySelector(`#education-list .dynamic-item[data-id="${id}"]`).remove();
    renderPreview();
    updateAnalysis();
    saveToStorage();
}

// 2. EXPERIENCE
function addExperienceField(data = {}) {
    const id = data.id || Date.now();
    const container = document.getElementById('experience-list');

    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.dataset.id = id;

    div.innerHTML = `
        <button type="button" class="btn-remove" onclick="removeExperience('${id}')"><i class="fa-solid fa-times"></i></button>
        <div class="form-group">
            <label>Role / Position</label>
            <input type="text" class="exp-role" value="${data.role || ''}" placeholder="e.g. Senior Developer" oninput="updateExperience('${id}')">
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>Company</label>
                <input type="text" class="exp-company" value="${data.company || ''}" placeholder="e.g. Google" oninput="updateExperience('${id}')">
            </div>
            <div class="form-group">
                <label>Duration</label>
                <input type="text" class="exp-duration" value="${data.duration || ''}" placeholder="Jan 2020 - Present" oninput="updateExperience('${id}')">
            </div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea class="exp-desc" rows="3" placeholder="Describe your responsibilities..." oninput="updateExperience('${id}')">${data.description || ''}</textarea>
        </div>
    `;
    container.appendChild(div);
    if (!data.id) {
        resumeData.experience.push({ id, role: '', company: '', duration: '', description: '' });
    }
}

function updateExperience(id) {
    const div = document.querySelector(`#experience-list .dynamic-item[data-id="${id}"]`);
    const index = resumeData.experience.findIndex(e => e.id == id);
    if (index > -1 && div) {
        resumeData.experience[index] = {
            id,
            role: div.querySelector('.exp-role').value,
            company: div.querySelector('.exp-company').value,
            duration: div.querySelector('.exp-duration').value,
            description: div.querySelector('.exp-desc').value
        };
        renderPreview();
        updateAnalysis();
        saveToStorage();
    }
}

function removeExperience(id) {
    resumeData.experience = resumeData.experience.filter(e => e.id != id);
    document.querySelector(`#experience-list .dynamic-item[data-id="${id}"]`).remove();
    renderPreview();
    updateAnalysis();
    saveToStorage();
}

// 3. PROJECTS
function addProjectField(data = {}) {
    const id = data.id || Date.now();
    const container = document.getElementById('project-list');

    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.dataset.id = id;

    div.innerHTML = `
        <button type="button" class="btn-remove" onclick="removeProject('${id}')"><i class="fa-solid fa-times"></i></button>
        <div class="form-group">
            <label>Project Title</label>
            <input type="text" class="proj-title" value="${data.title || ''}" placeholder="e.g. E-commerce App" oninput="updateProject('${id}')">
        </div>
        <div class="form-group">
            <label>Tech Stack</label>
            <input type="text" class="proj-tech" value="${data.tech || ''}" placeholder="React, Node.js, MongoDB" oninput="updateProject('${id}')">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea class="proj-desc" rows="2" placeholder="What did you build and what was the outcome?" oninput="updateProject('${id}')">${data.description || ''}</textarea>
        </div>
    `;
    container.appendChild(div);
    if (!data.id) {
        resumeData.projects.push({ id, title: '', tech: '', description: '' });
    }
}

function updateProject(id) {
    const div = document.querySelector(`#project-list .dynamic-item[data-id="${id}"]`);
    const index = resumeData.projects.findIndex(e => e.id == id);
    if (index > -1 && div) {
        resumeData.projects[index] = {
            id,
            title: div.querySelector('.proj-title').value,
            tech: div.querySelector('.proj-tech').value,
            description: div.querySelector('.proj-desc').value
        };
        renderPreview();
        updateAnalysis();
        saveToStorage();
    }
}

function removeProject(id) {
    resumeData.projects = resumeData.projects.filter(e => e.id != id);
    document.querySelector(`#project-list .dynamic-item[data-id="${id}"]`).remove();
    renderPreview();
    updateAnalysis();
    saveToStorage();
}

// 4. ACHIEVEMENTS
function addAchievementField(data = {}) {
    const id = data.id || Date.now();
    const container = document.getElementById('achievement-list');

    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.dataset.id = id;

    div.innerHTML = `
        <button type="button" class="btn-remove" onclick="removeAchievement('${id}')"><i class="fa-solid fa-times"></i></button>
        <div class="form-group">
            <label>Achievement / Certification</label>
            <input type="text" class="ach-title" value="${data.title || ''}" placeholder="e.g. AWS Certified Solutions Architect" oninput="updateAchievement('${id}')">
        </div>
    `;
    container.appendChild(div);
    if (!data.id) {
        resumeData.achievements.push({ id, title: '' });
    }
}

function updateAchievement(id) {
    const div = document.querySelector(`#achievement-list .dynamic-item[data-id="${id}"]`);
    const index = resumeData.achievements.findIndex(e => e.id == id);
    if (index > -1 && div) {
        resumeData.achievements[index] = {
            id,
            title: div.querySelector('.ach-title').value
        };
        renderPreview();
        updateAnalysis();
        saveToStorage();
    }
}

function removeAchievement(id) {
    resumeData.achievements = resumeData.achievements.filter(e => e.id != id);
    document.querySelector(`#achievement-list .dynamic-item[data-id="${id}"]`).remove();
    renderPreview();
    updateAnalysis();
    saveToStorage();
}


// SKILLS (Tags Input)
const skillInput = document.getElementById('skill-input');
const skillsContainer = document.getElementById('skills-container');

if (skillInput) {
    skillInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = skillInput.value.trim();
            if (val && !resumeData.skills.includes(val)) {
                resumeData.skills.push(val);
                renderSkills();
                skillInput.value = '';
                renderPreview();
                updateAnalysis();
                saveToStorage();
            }
        }
    });
}

function renderSkills() {
    const existingChips = skillsContainer.querySelectorAll('.skill-tag');
    existingChips.forEach(chip => chip.remove());

    resumeData.skills.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'skill-tag';
        span.innerHTML = `${skill} <i class="fa-solid fa-times" onclick="removeSkill('${skill}')"></i>`;
        skillsContainer.insertBefore(span, skillInput);
    });
}

function removeSkill(skill) {
    resumeData.skills = resumeData.skills.filter(s => s !== skill);
    renderSkills();
    renderPreview();
    updateAnalysis();
    saveToStorage();
}


// RENDER PREVIEW
function renderPreview() {
    // Basic Info
    document.getElementById('preview-name').textContent = resumeData.fullName || 'Your Name';
    document.getElementById('preview-title').textContent = resumeData.jobTitle || 'Job Title';

    setPreviewText('preview-email', resumeData.email);
    setPreviewText('preview-phone', resumeData.phone);
    setPreviewText('preview-location', resumeData.location);
    setPreviewText('preview-linkedin', resumeData.linkedin);
    setPreviewText('preview-website', resumeData.website);
    setPreviewText('preview-summary', resumeData.summary);

    toggleSectionVisibility('preview-summary-section', resumeData.summary);
    toggleSectionVisibility('preview-education-section', resumeData.education.length > 0);
    toggleSectionVisibility('preview-experience-section', resumeData.experience.length > 0);
    toggleSectionVisibility('preview-projects-section', resumeData.projects.length > 0);
    toggleSectionVisibility('preview-skills-section', resumeData.skills.length > 0);
    toggleSectionVisibility('preview-achievements-section', resumeData.achievements.length > 0);

    const eduList = document.getElementById('preview-education-list');
    eduList.innerHTML = resumeData.education.map(e => `
        <div class="resume-item">
            <h4>${e.degree}</h4>
            <div class="subtitle">
                <span>${e.school}</span>
                <span>${e.year}</span>
            </div>
            ${e.grade ? `<small>Grade: ${e.grade}</small>` : ''}
        </div>
    `).join('');

    const expList = document.getElementById('preview-experience-list');
    expList.innerHTML = resumeData.experience.map(e => `
        <div class="resume-item">
            <h4>${e.role}</h4>
            <div class="subtitle">
                <span>${e.company}</span>
                <span>${e.duration}</span>
            </div>
            <ul>${e.description.split('\\n').map(line => `<li>${line}</li>`).join('')}</ul>
        </div>
    `).join('');

    const projList = document.getElementById('preview-project-list');
    projList.innerHTML = resumeData.projects.map(p => `
        <div class="resume-item">
            <h4>${p.title}</h4>
            <div class="subtitle">
                <span>Tech: ${p.tech}</span>
            </div>
            <p>${p.description}</p>
        </div>
    `).join('');

    const skillsList = document.getElementById('preview-skills-list');
    skillsList.innerHTML = resumeData.skills.map(s => `<span class="preview-skill-tag">${s}</span>`).join('');

    const achList = document.getElementById('preview-achievement-list');
    achList.innerHTML = resumeData.achievements.map(a => `
        <div class="resume-item">
            <li>${a.title}</li>
        </div>
    `).join('');
}

function setPreviewText(id, value) {
    const el = document.getElementById(id);
    if (el) {
        if (value) {
            el.innerHTML = el.innerHTML.split('</i>')[0] + '</i> ' + value;
            el.style.display = 'inline-block';
        } else {
            el.style.display = 'none';
        }
    }
}

function toggleSectionVisibility(id, condition) {
    const el = document.getElementById(id);
    if (el) el.style.display = condition ? 'block' : 'none';
}


// RESUME ANALYZER
function updateAnalysis() {
    let score = 0;
    const suggestions = [];

    if (resumeData.fullName) score += 5;
    if (resumeData.email) score += 5;
    if (resumeData.phone) score += 5;
    if (resumeData.location) score += 5;
    if (resumeData.linkedin) score += 5;
    if (resumeData.summary && resumeData.summary.length > 50) score += 5;
    else if (!resumeData.summary) suggestions.push("Add a profile summary.");
    else suggestions.push("Lengthen summary (> 50 chars).");

    if (resumeData.education.length > 0) score += 10;
    else suggestions.push("Add education.");

    if (resumeData.experience.length > 0) score += 10;
    else suggestions.push("Add work experience.");

    if (resumeData.skills.length >= 3) score += 10;
    else suggestions.push("Add 3+ skills.");

    if (resumeData.projects.length > 0) score += 10;
    else suggestions.push("Add projects.");

    const descLength = resumeData.experience.reduce((acc, curr) => acc + (curr.description ? curr.description.length : 0), 0);
    if (descLength > 100) score += 15;

    const projDesc = resumeData.projects.reduce((acc, curr) => acc + (curr.description ? curr.description.length : 0), 0);
    if (projDesc > 50) score += 15;

    score = Math.min(100, score);
    renderAnalysis(score, suggestions);
}

function renderAnalysis(score, suggestions) {
    const circle = document.getElementById('score-circle');
    const text = document.getElementById('score-text');
    const status = document.getElementById('score-status');
    const suggestionList = document.getElementById('suggestion-list');

    // Safety check
    if (!circle) return;

    const circumference = 2 * Math.PI * 15.9155;
    const offset = circumference - (score / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    if (score < 50) {
        circle.style.stroke = 'var(--danger)';
        status.textContent = 'Weak';
        status.className = 'score-status weak';
    } else if (score < 80) {
        circle.style.stroke = 'var(--warning)';
        status.textContent = 'Average';
        status.className = 'score-status average';
    } else {
        circle.style.stroke = 'var(--success)';
        status.textContent = 'Strong';
        status.className = 'score-status strong';
    }

    text.textContent = score + '%';

    if (suggestions.length === 0) {
        suggestionList.innerHTML = '<li>🎉 Great job!</li>';
    } else {
        suggestionList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
    }
}

// STORAGE
function saveToStorage() {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
}

function loadFromStorage() {
    const saved = localStorage.getItem('resumeData');
    if (saved) {
        Object.assign(resumeData, JSON.parse(saved));

        document.querySelector('[name="fullName"]').value = resumeData.fullName;
        document.querySelector('[name="jobTitle"]').value = resumeData.jobTitle;
        document.querySelector('[name="email"]').value = resumeData.email;
        document.querySelector('[name="phone"]').value = resumeData.phone;
        document.querySelector('[name="location"]').value = resumeData.location;
        document.querySelector('[name="linkedin"]').value = resumeData.linkedin;
        document.querySelector('[name="website"]').value = resumeData.website;
        document.querySelector('[name="summary"]').value = resumeData.summary;

        resumeData.education.forEach(e => addEducationField(e));
        resumeData.experience.forEach(e => addExperienceField(e));
        resumeData.projects.forEach(p => addProjectField(p));
        resumeData.achievements.forEach(a => addAchievementField(a));
        renderSkills();
    }
}

// UI HELPERS
function toggleSection(header) {
    header.parentElement.classList.toggle('expanded');
}

document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Clear all data?')) {
        localStorage.removeItem('resumeData');
        location.reload();
    }
});

document.getElementById('btn-download').addEventListener('click', () => {
    window.print();
});

const templateSelect = document.getElementById('template-select');
if (templateSelect) {
    templateSelect.addEventListener('change', (e) => {
        document.getElementById('resume-preview').className = `resume-paper ${e.target.value}`;
    });
}

// PREVIEW ZOOM & DARK MODE LOGIC
let currentZoom = 1;
function zoomPreview(amount) {
    currentZoom += amount;
    currentZoom = Math.max(0.5, Math.min(currentZoom, 1.5));
    document.getElementById('resume-preview').style.transform = `scale(${currentZoom})`;
}

// DARK MODE LOGIC
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateThemeIcons();
}

function updateThemeIcons() {
    const isDark = document.body.classList.contains('dark-mode');
    const iconHtml = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';

    // Update Landing Page Button
    const btnLanding = document.getElementById('btn-theme-toggle-landing');
    if (btnLanding) btnLanding.innerHTML = iconHtml;

    // Update Builder Button
    const btnBuilder = document.getElementById('btn-theme-toggle');
    if (btnBuilder) btnBuilder.innerHTML = iconHtml;
}

// Attach listeners inside initialization or explicitly here if elements exist
const btnThemeBuilder = document.getElementById('btn-theme-toggle');
if (btnThemeBuilder) {
    btnThemeBuilder.onclick = toggleDarkMode;
}

const btnThemeLanding = document.getElementById('btn-theme-toggle-landing');
if (btnThemeLanding) {
    btnThemeLanding.onclick = toggleDarkMode;
}


// WRAPPER FOR MODAL
const btnAnalyzeHero = document.getElementById('btn-analyze-hero');
const modal = document.getElementById('analysis-modal');

if (btnAnalyzeHero) {
    btnAnalyzeHero.addEventListener('click', openModal);
}

function openModal() {
    modal.classList.remove('hidden');
    document.getElementById('upload-step').classList.remove('hidden');
    document.getElementById('analysis-loading').classList.add('hidden');
    document.getElementById('analysis-results').classList.add('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

document.getElementById('file-upload').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        startAnalysis(e.target.files[0]);
    }
});

function startAnalysis(file) {
    document.getElementById('upload-step').classList.add('hidden');
    document.getElementById('analysis-loading').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('analysis-loading').classList.add('hidden');
        document.getElementById('analysis-results').classList.remove('hidden');
    }, 2500);
}
