import { fabric } from 'fabric';

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
    const og_topLeftY: number = 240;

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
    const level: number = 0.61875;
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

export async function preprocess (file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        console.log('Using default preprocess');
        const reader = new FileReader();
        let modifiedFile: File;
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const img = document.createElement('img');
            img.onload = () => {
                const canvas: HTMLCanvasElement = document.createElement('canvas');
                const context: CanvasRenderingContext2D | null = canvas.getContext('2d', { willReadFrequently: true });
                if (!context) { reject(new Error('getContext failed (canvas, preprocessImage)')); }

                // Calculate the scale factor and new height
                const scaleFactor = img.width > 1920 ? 1920 / img.width : 1;
                const newWidth = img.width * scaleFactor;
                const newHeight = img.height * scaleFactor;

                canvas.width = newWidth;
                canvas.height = newHeight;

                if (context) {
                    context.drawImage(img, 0, 0, newWidth, newHeight);

                    const fabricImage = new fabric.Image(canvas, {
                        left: 0,
                        top: 0,
                        angle: 0,
                        opacity: 1,
                        scaleX: scaleFactor,
                        scaleY: scaleFactor
                    });

                    fabricImage.filters = fabricImage.filters || [];
                    fabricImage.filters.push(new fabric.Image.filters.Contrast({ contrast: 0.625 })); // this needs improvement, but works for now
                    fabricImage.filters.push(new fabric.Image.filters.Grayscale());
                    fabricImage.applyFilters();

                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(fabricImage.getElement(), 0, 0, newWidth, newHeight);

                    // download
                    // const a = document.createElement('a');
                    // a.href = canvas.toDataURL('image/png');
                    // a.download = file.name;
                    // a.click();
                }

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

                cropped_canvas.toBlob((blob) => {
                    modifiedFile = new File([blob as Blob], file.name, { type: file.type });
                    resolve(modifiedFile);
                }, file.type);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}

export async function preprocess1 (file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        console.log('Using preprocess 1');
        const reader = new FileReader();
        let modifiedFile: File;
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

                cropped_canvas.toBlob((blob) => {
                    modifiedFile = new File([blob as Blob], file.name, { type: file.type });
                    resolve(modifiedFile);
                }, file.type);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}

export async function preprocess2 (file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        console.log('Using preprocess 2');
        const reader = new FileReader();
        let modifiedFile: File;
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const img = document.createElement('img');
            img.onload = () => {
                const canvas: HTMLCanvasElement = document.createElement('canvas');
                const context: CanvasRenderingContext2D | null = canvas.getContext('2d', { willReadFrequently: true });
                if (!context) { reject(new Error('getContext failed (canvas, preprocessImage)')); }
                canvas.width = img.width;
                canvas.height = img.height;

                if (context) {
                    context.filter = 'contrast(2) saturate(0)';
                    context.drawImage(img, 0, 0);
                }

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

                cropped_canvas.toBlob((blob) => {
                    modifiedFile = new File([blob as Blob], file.name, { type: file.type });
                    resolve(modifiedFile);
                }, file.type);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}
