
const imageInput = document.getElementById('imageInput');
const colorInput = document.getElementById('colorInput');
const changeColorBtn = document.getElementById('changeColorBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let originalImageData; // Store the original image data for reference
let selectedX = null; 
let selectedY = null; 

// Event listener for image upload
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Get the uploaded file
    const reader = new FileReader(); // Create a FileReader to read the file

    reader.onload = (e) => {
        const img = new Image(); // Create a new Image object
        img.src = e.target.result; // Set the image source to the uploaded file
        img.onload = () => {
            // When the image loads, set canvas size and draw the image
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            // Store the original image data for later use
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        };
    };

    reader.readAsDataURL(file); // Read the image file as a Data URL
});

// Detect mouse clicks on the canvas
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect(); // Get the canvas dimensions
    // Calculate the selected pixel coordinates
    selectedX = Math.floor((event.clientX - rect.left) / (rect.width / canvas.width));
    selectedY = Math.floor((event.clientY - rect.top) / (rect.height / canvas.height));
});

let isProcessing = false; // Flag to prevent multiple clicks while processing
changeColorBtn.addEventListener('click', () => {
    // Check if processing or no selection has been made
    if (isProcessing || selectedX === null || selectedY === null) return; 
    isProcessing = true; 

    const newColor = hexToRgb(colorInput.value); // Convert selected hex color to RGB
    const targetColor = getPixelColor(selectedX, selectedY); // Get the color of the selected pixel

    // Create a new ImageData object from the original image data
    const imageData = new ImageData(new Uint8ClampedArray(originalImageData.data), originalImageData.width, originalImageData.height);
    const data = imageData.data; // Access the pixel data array

    // Flood fill function to change color
    function floodFill(x, y, targetColor, newColor) {
        const stack = [[x, y]]; // Initialize a stack with the starting pixel
        const width = canvas.width; // Get canvas width
        const height = canvas.height; // Get canvas height

        while (stack.length) {
            const [currentX, currentY] = stack.pop(); // Get current pixel from stack
            
            // Check if the current pixel is out of bounds
            if (currentX < 0 || currentX >= width || currentY < 0 || currentY >= height) continue;

            const index = (currentY * width + currentX) * 4; // Calculate the pixel index
            const currentColor = {
                r: data[index], // Red component
                g: data[index + 1], // Green component
                b: data[index + 2] // Blue component
            };

            // Check if the current pixel color matches the target color
            if (
                currentColor.r === targetColor.r &&
                currentColor.g === targetColor.g &&
                currentColor.b === targetColor.b
            ) {
                // Change the pixel color to the new color
                data[index] = newColor.r;
                data[index + 1] = newColor.g;
                data[index + 2] = newColor.b;

                // Push neighboring pixels onto the stack
                stack.push([currentX - 1, currentY]); 
                stack.push([currentX + 1, currentY]); 
                stack.push([currentX, currentY - 1]); 
                stack.push([currentX, currentY + 1]); 
            }
        }
    }

    // Start the flood fill algorithm at the selected coordinates
    floodFill(selectedX, selectedY, targetColor, newColor);

    ctx.putImageData(imageData, 0, 0); // Update the canvas with the modified image data
    
    isProcessing = false; // Reset processing flag
});

// Function to get the pixel color at given coordinates
function getPixelColor(x, y) {
    const index = (y * originalImageData.width + x) * 4; // Calculate the pixel index
    return {
        r: originalImageData.data[index],
        g: originalImageData.data[index + 1],
        b: originalImageData.data[index + 2] 
    };
}

// Function to convert hex color to RGB format
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16); // Convert hex to an integer
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255, 
        b: bigint & 255 
    };
}
