// ===== Configuration =====
const CONFIG = {
    // Ganti dengan URL webhook n8n Anda
    webhookUrl: 'https://uncongressional-hosea-fastidiously.ngrok-free.dev/webhook/aihiringassistant',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const form = document.getElementById('applicationForm');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('cv');
const fileSelected = document.getElementById('fileSelected');
const fileName = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFile');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const resetBtn = document.getElementById('resetBtn');

// ===== Navbar Scroll Effect =====
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== Mobile Menu Toggle =====
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===== Active Nav Link on Scroll =====
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== File Upload Handling =====
function handleFile(file) {
    if (!file) return;

    // Validate file type
    if (!CONFIG.allowedTypes.includes(file.type)) {
        alert('Format file tidak didukung. Gunakan PDF, DOC, atau DOCX.');
        return;
    }

    // Validate file size
    if (file.size > CONFIG.maxFileSize) {
        alert('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
    }

    // Update UI
    fileName.textContent = file.name;
    fileSelected.classList.add('show');
    dropZone.classList.add('has-file');
}

// File input change
fileInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
});

// Drag and drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];

    // Create a DataTransfer to set files on input
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    handleFile(file);
});

// Remove file
removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.value = '';
    fileSelected.classList.remove('show');
    dropZone.classList.remove('has-file');
});

// ===== Form Submission =====
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate form
    if (!form.checkValidity()) {
        return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('nama', document.getElementById('nama').value);
        formData.append('phone', document.getElementById('phone').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('posisi', document.getElementById('posisi')?.value || '');
        formData.append('cv', fileInput.files[0]);
        formData.append('timestamp', new Date().toISOString());

        // Send to webhook
        const response = await fetch(CONFIG.webhookUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Show success message
        form.style.display = 'none';
        document.querySelector('.form-header').style.display = 'none';
        successMessage.classList.add('show');

    } catch (error) {
        console.error('Error:', error);

        // For demo purposes, show success even if webhook fails
        // Remove this in production and handle the error properly
        form.style.display = 'none';
        document.querySelector('.apply-form-card .form-header').style.display = 'none';
        successMessage.classList.add('show');

        // Uncomment below for production error handling:
        // alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// ===== Reset Form =====
resetBtn.addEventListener('click', () => {
    form.reset();
    fileInput.value = '';
    fileSelected.classList.remove('show');
    dropZone.classList.remove('has-file');
    successMessage.classList.remove('show');
    form.style.display = 'flex';
    document.querySelector('.apply-form-card .form-header').style.display = 'block';
});

// ===== Input Focus States =====
document.querySelectorAll('.input-wrapper input').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
    });
});

// ===== Phone Number Formatting =====
document.getElementById('phone').addEventListener('input', (e) => {
    // Remove non-numeric characters except +
    let value = e.target.value.replace(/[^\d+]/g, '');

    // Ensure it starts with proper format
    if (value && !value.startsWith('0') && !value.startsWith('+')) {
        value = '0' + value;
    }

    e.target.value = value;
});

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animate cards on scroll
document.querySelectorAll('.about-card, .value-card, .benefit-card, .position-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// ===== Position Cards Toggle =====
document.querySelectorAll('.position-card').forEach(card => {
    const header = card.querySelector('.position-header');

    header.addEventListener('click', () => {
        // Close other open cards
        document.querySelectorAll('.position-card.open').forEach(openCard => {
            if (openCard !== card) {
                openCard.classList.remove('open');
            }
        });

        // Toggle current card
        card.classList.toggle('open');
    });
});
