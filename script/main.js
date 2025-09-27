const uploadInput = document.getElementById('upload');
const colorButtons = document.querySelectorAll('#colorOptions .color-btn');
const previewsContainer = document.getElementById('previews');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const generateAllButton = document.getElementById('generateAll');
const downloadAllButton = document.getElementById('downloadAll');
let uploadedImages = [];
let originalFileNames = [];
let selectedColor = '#ff0000'; // Default background color (red)

// A3 dimensions in pixels at 300 DPI
const A3_WIDTH = 3508;
const A3_HEIGHT = 4961;

// Thumbnail dimensions for preview
const THUMBNAIL_SIZE = 200;

// Handle file upload via input field
uploadInput.addEventListener('change', handleFileSelect);

// Handle file upload via drag-and-drop
const uploadArea = document.getElementById('uploadArea');

uploadArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadArea.style.borderColor = '#0056b3';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#007bff';
});

uploadArea.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadArea.style.borderColor = '#007bff';
    handleFileSelect(event);
});

function handleFileSelect(event) {
    const files = event.target.files || event.dataTransfer.files;
    if (!files.length) return;

    // Clear existing previews and uploaded images
    previewsContainer.innerHTML = '';
    uploadedImages = [];
    originalFileNames = [];

    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    uploadedImages.push(img);
                    originalFileNames.push(file.name);
                    displayPreviews();
                };
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please upload image files only.');
        }
    });
}

function displayPreviews() {
    previewsContainer.innerHTML = '';
    uploadedImages.forEach((img, index) => {
        const div = document.createElement('div');
        div.classList.add('preview-item');
        div.innerHTML = `
            <img src="${img.src}" alt="Preview Image">
            <button class="preview-remove" data-index="${index}">×</button>
            <button class="preview-download" data-index="${index}">↓</button>
        `;
        previewsContainer.appendChild(div);
    });

    // Add event listeners for remove and download buttons
    document.querySelectorAll('.preview-remove').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.getAttribute('data-index');
            uploadedImages.splice(index, 1);
            originalFileNames.splice(index, 1);
            displayPreviews(); // Refresh previews
        });
    });

    document.querySelectorAll('.preview-download').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.getAttribute('data-index');
            generateAndDownloadImage(index, originalFileNames[index]);
        });
    });

    // Enable "Download All" button if there are images
    downloadAllButton.disabled = uploadedImages.length === 0;
}

// Handle color selection
colorButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        colorButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to the clicked button
        button.classList.add('active');
        // Update the selected color
        selectedColor = button.getAttribute('data-color');
    });
});

// Generate and display previews of all images
function generatePreviews() {
    previewsContainer.innerHTML = '';
    uploadedImages.forEach((img, index) => {
        canvas.width = THUMBNAIL_SIZE;
        canvas.height = THUMBNAIL_SIZE;

        // Fill canvas with the selected background color
        ctx.fillStyle = selectedColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the uploaded image on the canvas with scaling
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        ctx.drawImage(img, (canvas.width - img.width * scale) / 2, (canvas.height - img.height * scale) / 2, img.width * scale, img.height * scale);

        const jpgDataURL = canvas.toDataURL('image/jpeg'); // Ensure JPEG format

        const div = document.createElement('div');
        div.classList.add('preview-item');
        div.innerHTML = `
            <img src="${jpgDataURL}" alt="Preview Image">
            <button class="preview-remove" data-index="${index}">×</button>
            <button class="preview-download" data-index="${index}">↓</button>
        `;
        previewsContainer.appendChild(div);
    });

    // Re-add event listeners for remove and download buttons in the new previews
    document.querySelectorAll('.preview-remove').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.getAttribute('data-index');
            uploadedImages.splice(index, 1);
            originalFileNames.splice(index, 1);
            displayPreviews(); // Refresh previews
        });
    });

    document.querySelectorAll('.preview-download').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.getAttribute('data-index');
            generateAndDownloadImage(index, originalFileNames[index]);
        });
    });
}

// Generate and download an individual image
function generateAndDownloadImage(index, fileName) {
    const img = uploadedImages[index];

    // Set canvas size to A3 dimensions
    canvas.width = A3_WIDTH;
    canvas.height = A3_HEIGHT;

    // Fill canvas with the selected background color
    ctx.fillStyle = selectedColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the uploaded image on the canvas
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    ctx.drawImage(img, (canvas.width - img.width * scale) / 2, (canvas.height - img.height * scale) / 2, img.width * scale, img.height * scale);

    // Generate and download the image
    const jpgDataURL = canvas.toDataURL('image/jpeg'); // Ensure JPEG format
    const link = document.createElement('a');
    link.href = jpgDataURL;
    link.download = `converted_${fileName.replace(/\.[^/.]+$/, "")}.jpg`; // Remove original extension and add .jpg
    link.click();
}

// Generate and preview all images
generateAllButton.addEventListener('click', generatePreviews);

// Download all images
downloadAllButton.addEventListener('click', () => {
    uploadedImages.forEach((_, index) => {
        generateAndDownloadImage(index, originalFileNames[index]);
    });
});
