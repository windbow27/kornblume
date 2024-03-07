import { onMounted, onUnmounted, readonly, ref, watch, watchEffect } from 'vue';
import { setKornblumeData, getKornblumeData } from '@/utils';
import { gapi } from 'gapi-script';

const loaded = ref(false);
const isLoading = ref(false);
const error = ref(false);
const subscriberCount = ref(0);

const createScriptTag = (url) => {
    const scriptTag = document.createElement('script');
    scriptTag.src = url;
    scriptTag.async = true;
    scriptTag.defer = true;
    return scriptTag;
};

const initialize = () => {
    console.log('initialize');
    isLoading.value = true;

    const scriptTagGAPI = createScriptTag('https://apis.google.com/js/api.js');
    document.head.appendChild(scriptTagGAPI);
    scriptTagGAPI.onload = () => {
        isLoading.value = false;
        loaded.value = true;
    };
    scriptTagGAPI.onerror = () => {
        isLoading.value = false;
        error.value = true;
    };
};

watch(
    () => subscriberCount.value,
    (newCount) => {
        if (newCount > 0 && !loaded.value && !isLoading.value) {
            initialize();
        }
    }
);

export function useGapi () {
    onMounted(() => {
        subscriberCount.value++;
    });
    onUnmounted(() => {
        subscriberCount.value--;
    });
    return {
        scriptLoaded: readonly(loaded),
        scriptLoadError: readonly(error)
    };
}

export class GApiSvc {
    static init () {
        const { scriptLoaded } = useGapi();
        console.log('init scriptLoaded:' + scriptLoaded.value);

        return new Promise<void>((resolve, reject) => {
            watchEffect(() => {
                if (scriptLoaded.value) { // Check if the script is loaded
                    // eslint-disable-next-line no-undef
                    gapi.load('client:auth2', () => {
                        // eslint-disable-next-line no-undef
                        gapi.client.init({
                            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
                            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                            discoveryDocs: [
                                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
                            ],
                            scope: 'https://www.googleapis.com/auth/drive'
                        }).then(resolve).catch(reject);
                    });
                }
            });
        });
    }

    static async signIn () {
        return gapi.auth2.getAuthInstance().signIn();
    }

    static async signOut () {
        return gapi.auth2.getAuthInstance().signOut();
    }

    static async isSignedIn () {
        return gapi.auth2.getAuthInstance().isSignedIn.get();
    }

    static getEmail () {
        return gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail();
    }

    static async getFiles () {
        try {
            const response = await gapi.client.drive.files.list({
                pageSize: 10,
                fields: 'nextPageToken, files(id, name)'
            });
            return response.result.files;
        } catch (err) {
            // alert((err as Error).message);
            return null;
        }
    }

    static async createFile (filename, content) {
        const boundary = '-------314159265358979323846';
        const delimiter = '\r\n--' + boundary + '\r\n';
        const close_delim = '\r\n--' + boundary + '--';

        const contentType = 'application/json';
        const metadata = {
            name: filename,
            mimeType: contentType
        };

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n\r\n' +
            content +
            close_delim;

        const request = gapi.client.request({
            path: '/upload/drive/v3/files',
            method: 'POST',
            params: { uploadType: 'multipart' },
            headers: {
                'Content-Type': 'multipart/related; boundary="' + boundary + '"'
            },
            body: multipartRequestBody
        });

        return await request.execute();
    }

    static async downloadFile (fileId) {
        try {
            const response = await gapi.client.drive.files.get({
                fileId,
                alt: 'media'
            });
            return JSON.parse(response.body); // assuming the file content is JSON
        } catch (err) {
            alert((err as Error).message);
            return null;
        }
    }

    static async updateFile (fileId: string, newContent: string) {
        const boundary = '-------314159265358979323846';
        const delimiter = '\r\n--' + boundary + '\r\n';
        const close_delim = '\r\n--' + boundary + '--';

        const contentType = 'application/json';
        const metadata = {
            mimeType: contentType
        };

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n\r\n' +
            newContent +
            close_delim;

        const request = gapi.client.request({
            path: '/upload/drive/v3/files/' + fileId,
            method: 'PATCH',
            params: { uploadType: 'multipart' },
            headers: {
                'Content-Type': 'multipart/related; boundary="' + boundary + '"'
            },
            body: multipartRequestBody
        });

        return await request.execute();
    }
}

export async function syncDrive () {
    if (await GApiSvc.isSignedIn()) {
        console.log(GApiSvc.isSignedIn());
        const files = await GApiSvc.getFiles();
        // console.log(files);
        const file = files.find((file: { name: string; }) => file.name === 'kornblume.json');
        if (!file) {
        // If 'kornblume.json' doesn't exist, create it with the data from localStorage
            GApiSvc.createFile('kornblume.json', JSON.stringify(localStorage));
        } else {
        // If 'kornblume.json' does exist, download it
            const localData = getKornblumeData();
            const driveData = GApiSvc.downloadFile(file.id);
            const actualDriveData = await driveData;
            if (localData.lastModified < actualDriveData.lastModified) {
                console.log('drive is newer. updating local data')
                setKornblumeData(driveData);
            } else {
                console.log('local is newer. updating drive data')
                GApiSvc.updateFile(file.id, JSON.stringify(localStorage));
            }
        }
    }
}
