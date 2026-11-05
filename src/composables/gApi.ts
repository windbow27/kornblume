import { onMounted, onUnmounted, readonly, ref, watch, watchEffect } from "vue";
import { setKornblumeData } from "@/utils";
import { gapi } from "gapi-script";

const loaded = ref(false);
const isLoading = ref(false);
const error = ref(false);
const subscriberCount = ref(0);

let isSyncing = false;
let pendingSync = false;
let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const bootLastModified = localStorage.getItem("lastModified");
let hasLocalEdits = false;

export const parseSyncTimestamp = (value: string | null | undefined) => {
  const date = new Date(value ?? 0);
  return isNaN(date.getTime()) ? new Date(0) : date;
};

const createScriptTag = (url) => {
  const scriptTag = document.createElement("script");
  scriptTag.src = url;
  scriptTag.async = true;
  scriptTag.defer = true;
  return scriptTag;
};

const initialize = () => {
  // console.log('initialize');
  isLoading.value = true;

  const scriptTagGAPI = createScriptTag("https://apis.google.com/js/api.js");
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
  },
);

export function useGapi() {
  onMounted(() => {
    subscriberCount.value++;
  });
  onUnmounted(() => {
    subscriberCount.value--;
  });
  return {
    scriptLoaded: readonly(loaded),
    scriptLoadError: readonly(error),
  };
}

export class GApiSvc {
  private static _initPromise: Promise<void> | null = null;

  static init() {
    if (GApiSvc._initPromise) return GApiSvc._initPromise;

    const { scriptLoaded } = useGapi();
    // console.log('init scriptLoaded:' + scriptLoaded.value);

    GApiSvc._initPromise = new Promise<void>((resolve, reject) => {
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        // If client ID is not set, resolve without initializing GApi.
        return resolve();
      }

      watchEffect(() => {
        if (scriptLoaded.value) {
          // Check if the script is loaded
          // eslint-disable-next-line no-undef
          gapi.load("client:auth2", () => {
            // eslint-disable-next-line no-undef
            gapi.client
              .init({
                apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
                clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                discoveryDocs: [
                  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
                ],
                scope:
                  "https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.appfolder https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive.file",
              })
              .then(resolve)
              .catch(reject);
          });
        }
      });
    });

    return GApiSvc._initPromise;
  }

  static async signIn() {
    return gapi.auth2?.getAuthInstance().signIn();
  }

  static async signOut() {
    return gapi.auth2?.getAuthInstance().signOut();
  }

  static async isSignedIn() {
    return gapi.auth2?.getAuthInstance().isSignedIn.get();
  }

  static getEmail() {
    return gapi.auth2
      ?.getAuthInstance()
      ?.currentUser.get()
      .getBasicProfile()
      .getEmail();
  }

  static async getFiles() {
    try {
      const response = await gapi.client.drive.files.list({
        pageSize: 10,
        fields: "nextPageToken, files(id, name)",
      });
      return response.result.files;
    } catch (err) {
      // alert((err as Error).message);
      return null;
    }
  }

  static async createFile(filename, content) {
    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = "application/json";
    const metadata = {
      name: filename,
      mimeType: contentType,
    };

    const multipartRequestBody =
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: " +
      contentType +
      "\r\n\r\n" +
      content +
      close_delim;

    const request = gapi.client.request({
      path: "/upload/drive/v3/files",
      method: "POST",
      params: { uploadType: "multipart" },
      headers: {
        "Content-Type": 'multipart/related; boundary="' + boundary + '"',
      },
      body: multipartRequestBody,
    });

    return await request.execute();
  }

  static async downloadFile(fileId) {
    try {
      const response = await gapi.client.drive.files.get({
        fileId,
        alt: "media",
      });
      return JSON.parse(response.body); // assuming the file content is JSON
    } catch (err) {
      alert((err as Error).message);
      return null;
    }
  }

  static async updateFile(fileId: string, newContent: string) {
    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = "application/json";
    const metadata = {
      mimeType: contentType,
    };

    const multipartRequestBody =
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: " +
      contentType +
      "\r\n\r\n" +
      newContent +
      close_delim;

    const request = gapi.client.request({
      path: "/upload/drive/v3/files/" + fileId,
      method: "PATCH",
      params: { uploadType: "multipart" },
      headers: {
        "Content-Type": 'multipart/related; boundary="' + boundary + '"',
      },
      body: multipartRequestBody,
    });

    return await request.execute();
  }
}

export async function syncDrive({ isInitialSync = false } = {}) {
  // cancel any pending debounced sync
  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer);
    syncDebounceTimer = null;
  }

  // a sync is already running: queue another one instead of dropping the
  // changes that triggered this call
  if (isSyncing) {
    pendingSync = true;
    return;
  }
  isSyncing = true;

  try {
    if (!(await GApiSvc.isSignedIn())) return;

    const files = await GApiSvc.getFiles();
    if (!files) return;

    const file = files.find(
      (file: { name: string }) => file.name === "kornblume.json",
    );
    if (!file) {
      // If 'kornblume.json' doesn't exist, create it with the data from localStorage
      await GApiSvc.createFile("kornblume.json", JSON.stringify(localStorage));
    } else {
      // download drive data first to compare
      const actualDriveData = await GApiSvc.downloadFile(file.id);
      if (!actualDriveData) return;

      const localLastModified =
        isInitialSync && !hasLocalEdits
          ? bootLastModified
          : localStorage.getItem("lastModified");

      const localDataLastModified = parseSyncTimestamp(localLastModified);
      const actualDriveDataLastModified = parseSyncTimestamp(
        actualDriveData.lastModified,
      );

      if (localDataLastModified < actualDriveDataLastModified) {
        console.log("drive is newer. updating local data");
        setKornblumeData(actualDriveData);
        localStorage.setItem(
          "lastModified",
          actualDriveDataLastModified.toISOString(),
        );
        setTimeout(() => window.location.reload());
      } else if (localDataLastModified > actualDriveDataLastModified) {
        console.log("local is newer. updating drive data");
        await GApiSvc.updateFile(file.id, JSON.stringify(localStorage));
      }
      // if timestamps are equal, no sync needed
    }
  } catch (err) {
    console.error("syncDrive error:", err);
  } finally {
    isSyncing = false;
    if (pendingSync) {
      pendingSync = false;
      runSyncSoon(0);
    }
  }
}

function runSyncSoon(delayMs: number) {
  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer);
  }
  syncDebounceTimer = setTimeout(() => {
    syncDebounceTimer = null;
    syncDrive();
  }, delayMs);
}

export function scheduleSyncDrive(delayMs = 3000) {
  hasLocalEdits = true;
  runSyncSoon(delayMs);
}
