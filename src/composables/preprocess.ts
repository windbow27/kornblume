import Tesseract, { createWorker } from 'tesseract.js';

type cropOptions = { x: number, y: number, width: number, height: number };
function getCropOptions (context: CanvasRenderingContext2D | null, width: number, height: number): cropOptions {
    const imageData: ImageData | undefined = context?.getImageData(0, 0, width, height);
    if (!imageData) {
        console.log('failed to obtain image data (getCropOptions)');
        return { x: 0, y: 0, width: 0, height: 0 };
    }
    const pixels: Uint8ClampedArray = imageData?.data;
    if (!pixels) {
        console.log('failed to obtain pixel data (getCropOptions)');
        return { x: 0, y: 0, width: 0, height: 0 };
    }
    const x_half: number = ~~((width - 1) / 2);
    const y_half: number = ~~((height - 1) / 2);

    /* search for bottom of border, indicates corner y coordinate */
    let bottomRightY: number = 0;
    for (let i: number = height - 1; i > y_half; i--) {
        if (pixels[(x_half + width * i) * 4] === 255) {
            bottomRightY = i;
            break;
        }
    }

    /* search for right side of border, indicates corner x coordinate */
    let bottomRightX: number = 0;
    for (let i: number = width - 1; i > x_half; i--) {
        if (pixels[(i + width * y_half) * 4] === 255) {
            bottomRightX = i;
            break;
        }
    }
    /* original measurements needed to construct ratios */
    const og_width: number = 2400;
    const og_height: number = 1080;
    const og_topLeftX: number = 775;
    const og_topLeftY: number = 315;

    const imageX_scale: number = width / og_width;
    const imageY_scale: number = height / og_height;
    const target_width: number = bottomRightX - og_topLeftX * imageX_scale;
    const target_height: number = bottomRightY - og_topLeftY * imageY_scale;

    return {
        x: ~~(og_topLeftX * imageX_scale),
        y: ~~(og_topLeftY * imageY_scale),
        width: ~~target_width,
        height: ~~target_height
    };
}

function binarize (context: CanvasRenderingContext2D | null, width: number, height: number): ImageData {
    const imageData: ImageData | undefined = context?.getImageData(0, 0, width, height);
    if (!imageData) {
        console.log('failed to obtain image data (binarize)');
        return new ImageData(0, 0);
    }
    const pixels: Uint8ClampedArray = imageData?.data;
    if (!pixels) {
        console.log('failed to obtain pixel data (binarize)');
        return new ImageData(0, 0);
    }
    const level: number = 0.6;
    const thresh: number = Math.floor(level * 255);
    for (let i = 0; i < pixels.length; i += 4) {
        const r: number = pixels[i];
        const g: number = pixels[i + 1];
        const b: number = pixels[i + 2];
        const grey: number = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const val: number = grey >= thresh ? 255 : 0;
        pixels[i] = pixels[i + 1] = pixels[i + 2] = val;
    }
    return imageData;
}

async function debugLineByLineOCR (pullIndex: number, source: string, result: string): Promise<void> {
    const img: HTMLElement | null = document.getElementById('testing');
    if (!img) console.log('uncomment img w/ testing id in template below');
    (img as HTMLImageElement).src = source;
    console.log('pull index: ', pullIndex + 1, '\nocr result:', result);
    await new Promise(resolve => setTimeout(resolve, 1000));
}

export async function lineByLineOCR (preprocessCanvas: HTMLCanvasElement, debug?: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
        let output: string = '';
        const pullCanvas: HTMLCanvasElement = document.createElement('canvas');
        const pullContext: CanvasRenderingContext2D | null = pullCanvas.getContext('2d');
        if (!pullContext) { reject(new Error('getContext failed (splitImage)')); }
        pullCanvas.width = preprocessCanvas.width;
        pullCanvas.height = ~~(preprocessCanvas.height / 11); /* divide by number of rows in image */

        (async (): Promise<void> => {
            const worker: Tesseract.Worker = await createWorker('eng');
            for (let pullIndex = 0; pullIndex < 10; pullIndex++) {
                pullContext?.drawImage(preprocessCanvas,
                    0, pullCanvas.height * pullIndex, preprocessCanvas.width, pullCanvas.height, /* src */
                    0, 0, pullCanvas.width, pullCanvas.height /* dst */
                );
                const ret: Tesseract.RecognizeResult = await worker.recognize(pullCanvas.toDataURL());
                output += ret.data.text;
                if (debug) { await debugLineByLineOCR(pullIndex, pullCanvas.toDataURL(), ret.data.text); }
            }
            await worker.terminate();
            resolve(output);
        })();
    });
}

export async function preprocessImage (file: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
        const reader: FileReader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const img = document.createElement('img');
            img.onload = () => {
                const canvas: HTMLCanvasElement = document.createElement('canvas');
                const context: CanvasRenderingContext2D | null = canvas.getContext('2d', { willReadFrequently: true });
                if (!context) { reject(new Error('getContext failed (canvas, preprocessImage)')); }
                canvas.width = img.width;
                canvas.height = img.height;
                context?.drawImage(img, 0, 0);

                const newData: ImageData = binarize(context, canvas.width, canvas.height);
                if (!newData) { reject(new Error('binarize failed (preprocessImage)')); }
                context?.putImageData(newData, 0, 0);

                const options: cropOptions = getCropOptions(context, canvas.width, canvas.height);
                const cropped_canvas: HTMLCanvasElement = document.createElement('canvas');
                const cropped_context: CanvasRenderingContext2D | null = cropped_canvas.getContext('2d');
                if (!cropped_context) { reject(new Error('getContext failed (cropped_canvas, preprocessImage)')); }

                cropped_canvas.width = options.width;
                cropped_canvas.height = options.height;
                cropped_context?.drawImage(canvas,
                    options.x, options.y, options.width, options.height, /* src */
                    0, 0, cropped_canvas.width, cropped_canvas.height /* dst */
                );

                resolve(cropped_canvas);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}

export function convertGoldenThreadString (goldenThread: string, value: 'digit' | 'romanNumeral'): string {
    const tempArray: string[] = goldenThread.split(' ');
    const numberPart: string = tempArray[tempArray.length - 1];
    if (value === 'digit') {
        return goldenThread.replace(numberPart, String(numberPart.length));
    } else if (value === 'romanNumeral') {
        return goldenThread.replace(numberPart, 'I'.repeat(parseInt(numberPart)));
    }
    console.log('error converting golden thread string');
    return '';
}
