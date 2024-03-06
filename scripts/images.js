const fs = require('fs');
const sharp = require('sharp');

// Define the input directory
const arcanistsIconDirectory = './public/images/arcanists/icon';
const arcanistI0PortraitDirectory = './public/images/arcanists/i0';
const itemsIconDirectory = './public/images/items/icon';
const itemsBorderDirectory = './public/images/items/border';
const stagesIconDirectory = './public/images/items/stage';

// Define config
const settingConfigs = {
    [arcanistsIconDirectory]: {
        maxWidth: 64, lossless: true, nearLossless: false
    },
    [arcanistI0PortraitDirectory]: {
        maxWidth: 114, lossless: false, nearLossless: true
    },
    [itemsIconDirectory]: {
        maxWidth: 96, lossless: false, nearLossless: true
    },
    [itemsBorderDirectory]: {
        maxWidth: 96, lossless: false, nearLossless: true
    },
    [stagesIconDirectory]: {
        maxWidth: 192, lossless: false, nearLossless: true
    }
}

// Function to process images in a directory
async function processImagesInDirectory (input) {
    const inputFolder = input;
    const outputFolder = `${input}/thumbnails`;

    // Create the output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    const files = fs.readdirSync(inputFolder);
    const config = settingConfigs[input]

    for (const file of files) {
        if (file !== 'thumbnails') {
            const inputPath = `${inputFolder}/${file}`;
            const image = await sharp(inputPath);

            // Resize and optimize the image
            await image
                .resize({ width: config.maxWidth })
                .webp({ lossless: config.lossless, nearLossless: config.nearLossless })
                .toFile(`${outputFolder}/${file}`);
        }
    }
}

// Main function to process all images
async function processAllImages () {
    await processImagesInDirectory(arcanistsIconDirectory)
    await processImagesInDirectory(arcanistI0PortraitDirectory)
    await processImagesInDirectory(itemsIconDirectory)
    await processImagesInDirectory(itemsBorderDirectory)
    await processImagesInDirectory(stagesIconDirectory)
}

// Start the image processing
processAllImages()
    .then(() => {
        console.log('Image processing completed.');
    })
    .catch((error) => {
        console.error('Error processing images:', error);
    });
