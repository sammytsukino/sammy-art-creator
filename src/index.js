// Elementos de las pestañas
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Elementos de la pestaña ASCII Art
const asciiFileInput = document.getElementById('asciiFileInput');
const asciiPreviewCanvas = document.getElementById('asciiPreview');
const asciiOutputPre = document.getElementById('asciiOutput');
const densitySlider = document.getElementById('densitySlider');
const invertColorsCheckbox = document.getElementById('invertColors');
const charDarkInput = document.getElementById('charDark');
const charMediumInput = document.getElementById('charMedium');
const charBrightInput = document.getElementById('charBright');
const saveAsciiImageBtn = document.getElementById('saveAsciiImageBtn');
const downloadAsciiTextBtn = document.getElementById('downloadAsciiTextBtn');
const shareAsciiBtn = document.getElementById('shareAsciiBtn');
const asciiContext = asciiPreviewCanvas.getContext('2d');
const brightnessAsciiSlider = document.getElementById('brightnessAscii');
const contrastAsciiSlider = document.getElementById('contrastAscii');

// Elementos de la pestaña Pixelizer
const pixelFileInput = document.getElementById('pixelFileInput');
const pixelPreviewCanvas = document.getElementById('pixelPreview');
const pixelSizeSlider = document.getElementById('pixelSizeSlider');
const savePixelImageBtn = document.getElementById('savePixelImageBtn');
const sharePixelBtn = document.getElementById('sharePixelBtn');
const pixelContext = pixelPreviewCanvas.getContext('2d');
const pixelPaletteSelect = document.getElementById('pixelPalette');
const brightnessPixelSlider = document.getElementById('brightnessPixel');
const contrastPixelSlider = document.getElementById('contrastPixel');

let pixelImage = null; // Variable para almacenar la imagen del pixelizador



// Mosaic tab elements
const mosaicFileInput = document.getElementById('mosaicFileInput');
const mosaicPreviewCanvas = document.getElementById('mosaicPreview');
const mosaicTileSlider = document.getElementById('mosaicTileSlider');
const mosaicOpacitySlider = document.getElementById('mosaicOpacitySlider');
const saveMosaicImageBtn = document.getElementById('saveMosaicImageBtn');
const shareMosaicBtn = document.getElementById('shareMosaicBtn');
const mosaicContext = mosaicPreviewCanvas.getContext('2d');
const brightnessMosaicSlider = document.getElementById('brightnessMosaic');
const contrastMosaicSlider = document.getElementById('contrastMosaic');

let mosaicImage = null; // Variable to store the original image for the mosaic effect

// Funcionalidad de las pestañas
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.dataset.tab;
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(tab).classList.add('active');
    });
});

// Funciones comunes
const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;
const clamp = (value, min = 0, max = 255) => Math.min(max, Math.max(min, value));

const getFontRatio = () => {
    const pre = document.createElement('pre');
    pre.style.display = 'inline';
    pre.textContent = ' ';
    document.body.appendChild(pre);
    const { width, height } = pre.getBoundingClientRect();
    document.body.removeChild(pre);
    return height / width;
};

const fontRatio = getFontRatio();

const adjustBrightnessContrast = (context, width, height, brightness = 0, contrast = 0) => {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(factor * (data[i] - 128) + 128 + brightness);
        data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128 + brightness);
        data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128 + brightness);
    }
    context.putImageData(imageData, 0, 0);
};

// Funciones para ASCII Art
const convertToGrayScales = (context, width, height) => {
    const imageData = context.getImageData(0, 0, width, height);
    const grayScales = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const grayScale = toGrayScale(r, g, b);
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = grayScale;
        grayScales.push(grayScale);
    }
    context.putImageData(imageData, 0, 0);
    return grayScales;
};

const clampDimensions = (width, height, maxWidth = 80, maxHeight = 80) => {
    const rectifiedWidth = Math.floor(fontRatio * width);
    if (height > maxHeight) {
        const reducedWidth = Math.floor(rectifiedWidth * maxHeight / height);
        return [reducedWidth, maxHeight];
    }
    if (width > maxWidth) {
        const reducedHeight = Math.floor(height * maxWidth / rectifiedWidth);
        return [maxWidth, reducedHeight];
    }
    return [rectifiedWidth, height];
};

const defaultCharsDark = "$@B%#";
const defaultCharsMedium = "oahkbdpqwmZO0QLCJUYXzcvunxrjft";
const defaultCharsBright = "/|()1{}[]?-_+~<>i!lI;:,\"^`\'. ";

const getCharacterForGrayScale = grayScale => {
    const invertedGrayScale = invertColorsCheckbox.checked ? 255 - grayScale : grayScale;
    const density = parseInt(densitySlider.value);
    const numRanges = 3;
    const rangeSize = Math.floor(256 / numRanges);
    let chars;
    if (invertedGrayScale < rangeSize) {
        chars = charDarkInput.value || defaultCharsDark;
    } else if (invertedGrayScale < 2 * rangeSize) {
        chars = charMediumInput.value || defaultCharsMedium;
    } else {
        chars = charBrightInput.value || defaultCharsBright;
    }
    const rampLength = chars.length;
    return rampLength === 0 ? ' ' : chars[Math.floor((density - 1) * invertedGrayScale / 255) % rampLength];
};

const drawAscii = (grayScales, width) => {
    let ascii = '';
    for (let i = 0; i < grayScales.length; i++) {
        ascii += getCharacterForGrayScale(grayScales[i]);
        if ((i + 1) % width === 0) {
            ascii += '\n';
        }
    }
    asciiOutputPre.textContent = ascii;
    saveAsciiImageBtn.disabled = false;
    downloadAsciiTextBtn.disabled = false;
    shareAsciiBtn.disabled = false;
};

const handleAsciiImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const image = new Image();
        image.onload = () => {
            const [width, height] = clampDimensions(image.width, image.height);
            asciiPreviewCanvas.width = width;
            asciiPreviewCanvas.height = height;
            asciiContext.drawImage(image, 0, 0, width, height);
            adjustBrightnessContrast(asciiContext, width, height, parseInt(brightnessAsciiSlider.value), parseInt(contrastAsciiSlider.value));
            const grayScales = convertToGrayScales(asciiContext, width, height);
            drawAscii(grayScales, width);
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(file);
    saveAsciiImageBtn.disabled = true;
    downloadAsciiTextBtn.disabled = true;
    shareAsciiBtn.disabled = true;
};

asciiFileInput.onchange = (e) => {
    const file = e.target.files[0];
    handleAsciiImageUpload(file);
};

const redrawAscii = () => {
    if (asciiPreviewCanvas.width > 0) {
        const [width, height] = [asciiPreviewCanvas.width, asciiPreviewCanvas.height];
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const img = new Image();
        img.src = asciiPreviewCanvas.toDataURL();
        img.onload = () => {
            tempContext.drawImage(img, 0, 0);
            asciiContext.clearRect(0, 0, width, height);
            asciiContext.drawImage(tempCanvas, 0, 0);
            adjustBrightnessContrast(asciiContext, width, height, parseInt(brightnessAsciiSlider.value), parseInt(contrastAsciiSlider.value));
            const grayScales = convertToGrayScales(asciiContext, width, height);
            drawAscii(grayScales, width);
        };
    } else {
        downloadAsciiTextBtn.disabled = true;
        shareAsciiBtn.disabled = true;
    }
};

brightnessAsciiSlider.oninput = redrawAscii;
contrastAsciiSlider.oninput = redrawAscii;
densitySlider.oninput = redrawAscii;
invertColorsCheckbox.onchange = redrawAscii;
charDarkInput.oninput = redrawAscii;
charMediumInput.oninput = redrawAscii;
charBrightInput.oninput = redrawAscii;

const saveAsciiAsImage = () => {
    if (asciiPreviewCanvas.width > 0) {
        const dataURL = asciiPreviewCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'ascii_art.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

const downloadAsciiAsText = () => {
    const asciiText = asciiOutputPre.textContent;
    const blob = new Blob([asciiText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii_art.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const shareAscii = () => {
    if (navigator.share) {
        navigator.share({
            title: 'ASCII Art',
            text: asciiOutputPre.textContent,
            url: window.location.href,
        }).then(() => console.log('Shared successfully.'))
          .catch((error) => console.log('Sharing failed', error));
    } else {
        alert('Web Share API not supported.');
    }
};

saveAsciiImageBtn.addEventListener('click', saveAsciiAsImage);
downloadAsciiTextBtn.addEventListener('click', downloadAsciiAsText);
shareAsciiBtn.addEventListener('click', shareAscii);

charDarkInput.value = defaultCharsDark;
charMediumInput.value = defaultCharsMedium;
charBrightInput.value = defaultCharsBright;

// Funciones para Pixelizer
const pixelizeImage = (image, pixelSize, canvasElement, context) => {
    const scaledWidth = Math.floor(image.width / pixelSize);
    const scaledHeight = Math.floor(image.height / pixelSize);
    canvasElement.width = image.width;
    canvasElement.height = image.height;
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);

    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d');
    tempCanvas.width = scaledWidth;
    tempCanvas.height = scaledHeight;
    tempContext.drawImage(image, 0, 0, scaledWidth, scaledHeight);

    context.imageSmoothingEnabled = false;
    context.drawImage(tempCanvas, 0, 0, canvasElement.width, canvasElement.height);
};

const applyColorPalette = (context, width, height, palette) => {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        switch (palette) {
            case 'grayscale':
                const gray = toGrayScale(r, g, b);
                r = g = b = gray;
                break;
            case 'sepia':
                r = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
                g = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
                b = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
                break;
            // Agrega más casos para otras paletas
        }
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }
    context.putImageData(imageData, 0, 0);
};

const pixelizeAndApplyPalette = () => {
    if (pixelImage) {
        const pixelSize = parseInt(pixelSizeSlider.value);
        pixelizeImage(pixelImage, pixelSize, pixelPreviewCanvas, pixelContext);
        const selectedPalette = pixelPaletteSelect.value;
        applyColorPalette(pixelContext, pixelPreviewCanvas.width, pixelPreviewCanvas.height, selectedPalette);
        adjustBrightnessContrast(pixelContext, pixelPreviewCanvas.width, pixelPreviewCanvas.height, parseInt(brightnessPixelSlider.value), parseInt(contrastPixelSlider.value));
        savePixelImageBtn.disabled = false;
        sharePixelBtn.disabled = false;
    } else {
        savePixelImageBtn.disabled = true;
        sharePixelBtn.disabled = true;
    }
};

const handlePixelImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        pixelImage = new Image();
        pixelImage.onload = () => {
            pixelizeAndApplyPalette();
        };
        pixelImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
};

pixelFileInput.onchange = (e) => {
    const file = e.target.files[0];
    handlePixelImageUpload(file);
};

pixelSizeSlider.oninput = pixelizeAndApplyPalette;
pixelPaletteSelect.onchange = pixelizeAndApplyPalette;
brightnessPixelSlider.oninput = pixelizeAndApplyPalette;
contrastPixelSlider.oninput = pixelizeAndApplyPalette;

const savePixelatedImage = () => {
    if (pixelPreviewCanvas.width > 0) {
        const dataURL = pixelPreviewCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'pixelated_image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

const sharePixelImage = () => {
    if (navigator.share) {
        navigator.share({
            title: 'Pixelated Image',
            url: pixelPreviewCanvas.toDataURL('image/png')
        }).then(() => console.log('Shared successfully.'))
          .catch((error) => console.log('Sharing failed', error));
    } else {
        alert('Web Share API not supported.');
    }
};



savePixelImageBtn.addEventListener('click', savePixelatedImage);
sharePixelBtn.addEventListener('click', sharePixelImage);


const applyMosaicEffect = () => {
    if (!mosaicImage) return;
    
    // Calcular la altura proporcional
    const aspectRatio = mosaicImage.height / mosaicImage.width;
    const targetWidth = 1000;
    const targetHeight = Math.round(targetWidth * aspectRatio);
    
    // Establecer el tamaño del canvas a 1000px de ancho
    mosaicPreviewCanvas.width = targetWidth;
    mosaicPreviewCanvas.height = targetHeight;
    
    const tileSize = parseInt(mosaicTileSlider.value);
    const opacity = 1.0; // Opacidad al 100%
    
    // Limpiar canvas
    mosaicContext.clearRect(0, 0, mosaicPreviewCanvas.width, mosaicPreviewCanvas.height);
    
    // Crear un canvas temporal para trabajar con la imagen escalada
    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d');
    tempCanvas.width = targetWidth;
    tempCanvas.height = targetHeight;
    
    // Dibujar la imagen escalada en el canvas temporal
    tempContext.drawImage(mosaicImage, 0, 0, targetWidth, targetHeight);
    
    // Obtener los datos de la imagen escalada
    const imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Crear un tile pequeño como mosaico
    const tileCanvas = document.createElement('canvas');
    const tileContext = tileCanvas.getContext('2d');
    tileCanvas.width = tileSize;
    tileCanvas.height = tileSize;
    
    // Dibujar una versión pequeña de la imagen para usar como mosaico
    tileContext.drawImage(mosaicImage, 0, 0, tileSize, tileSize);
    const tileData = tileCanvas.toDataURL();
    
    // Crear una imagen del mosaico
    const previewTile = new Image();
    previewTile.onload = () => {
        // Calcular el número de mosaicos en cada dimensión
        const tilesX = Math.ceil(targetWidth / tileSize);
        const tilesY = Math.ceil(targetHeight / tileSize);
        
        // Recorrer cada celda de la cuadrícula
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                // Calcular la posición de esta celda
                const posX = x * tileSize;
                const posY = y * tileSize;
                
                // Calcular el color promedio de esta región
                const regionColor = getRegionAverageColor(imageData, posX, posY, tileSize, targetWidth);
                
                // Calcular la luminosidad del color promedio
                const luminance = 0.299 * regionColor.r + 0.587 * regionColor.g + 0.114 * regionColor.b;
                
                // Comprobar transparencia y color significativo
                const isTransparent = hasTransparentPixels(imageData, posX, posY, tileSize, targetWidth);
                const isWhite = luminance > 240;
                
                if (!isTransparent && !isWhite) {
                    // Dibujar el mosaico en esta posición
                    mosaicContext.drawImage(previewTile, posX, posY, tileSize, tileSize);
                }
            }
        }
        
        saveMosaicImageBtn.disabled = false;
        shareMosaicBtn.disabled = false;
    };
    
    previewTile.src = tileData;
};

// También necesitamos actualizar la función getRegionAverageColor
// para que funcione correctamente con las nuevas dimensiones
const getRegionAverageColor = (imageData, startX, startY, size, width) => {
    let r = 0, g = 0, b = 0;
    let pixelCount = 0;
    
    const endX = Math.min(startX + size, width);
    const endY = Math.min(startY + size, imageData.height);
    
    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const pixelIndex = (y * width + x) * 4;
            
            // Saltar píxeles transparentes
            if (imageData.data[pixelIndex + 3] < 50) continue;
            
            r += imageData.data[pixelIndex];
            g += imageData.data[pixelIndex + 1];
            b += imageData.data[pixelIndex + 2];
            
            pixelCount++;
        }
    }
    
    if (pixelCount === 0) return { r: 0, g: 0, b: 0 };
    
    return {
        r: Math.round(r / pixelCount),
        g: Math.round(g / pixelCount),
        b: Math.round(b / pixelCount)
    };
};

// La función hasTransparentPixels también debe actualizarse
const hasTransparentPixels = (imageData, startX, startY, size, width) => {
    const endX = Math.min(startX + size, width);
    const endY = Math.min(startY + size, imageData.height);
    
    let transparentCount = 0;
    let totalPixels = 0;
    
    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const pixelIndex = (y * width + x) * 4;
            totalPixels++;
            
            // Comprobar si el píxel es transparente o casi transparente
            if (imageData.data[pixelIndex + 3] < 50) {
                transparentCount++;
            }
        }
    }
    
    // Si más del 70% de los píxeles son transparentes, considerar la región transparente
    return (transparentCount / totalPixels) > 0.7;
};
// Handle mosaic image upload
const handleMosaicImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        mosaicImage = new Image();
        mosaicImage.onload = () => {
            applyMosaicEffect();
        };
        mosaicImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
    saveMosaicImageBtn.disabled = true;
    shareMosaicBtn.disabled = true;
};

// Event listeners for mosaic tab
mosaicFileInput.onchange = (e) => {
    const file = e.target.files[0];
    handleMosaicImageUpload(file);
};
mosaicTileSlider.oninput = applyMosaicEffect;
mosaicOpacitySlider.oninput = applyMosaicEffect;
brightnessMosaicSlider.oninput = applyMosaicEffect;
contrastMosaicSlider.oninput = applyMosaicEffect;

const saveMosaicImage = () => {
    if (mosaicPreviewCanvas.width > 0) {
        const dataURL = mosaicPreviewCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'mosaic_image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

const shareMosaicImage = () => {
    if (navigator.share) {
        navigator.share({
            title: 'Mosaic Image',
            url: mosaicPreviewCanvas.toDataURL('image/png')
        }).then(() => console.log('Shared successfully.'))
          .catch((error) => console.log('Sharing failed', error));
    } else {
        alert('Web Share API not supported.');
    }
};

saveMosaicImageBtn.addEventListener('click', saveMosaicImage);
shareMosaicBtn.addEventListener('click', shareMosaicImage);