export function exportLocalStorageToJson () {
    const localStorageData = {
        plannerSettings: localStorage.getItem('plannerSettings'),
        planner: localStorage.getItem('planner'),
        wilderness: localStorage.getItem('wilderness'),
        warehouse: localStorage.getItem('warehouse')
    };

    const localStorageJson = JSON.stringify(localStorageData, null, 2);

    const blob = new Blob([localStorageJson], { type: 'application/json' });

    const now = new Date();

    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const dateString = `${day}${month}${year}`;
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}${minutes}`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kornblume_data_${dateString}_${timeString}.json`;

    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}

export function importLocalStorageFromJson (file) {
    const reader = new FileReader();

    reader.onload = async (event) => {
        try {
            const importedData = JSON.parse(event.target.result);

            // Assuming importedData has the same structure as localStorageData
            localStorage.setItem('plannerSettings', importedData.plannerSettings);
            localStorage.setItem('planner', importedData.planner);
            localStorage.setItem('wilderness', importedData.wilderness);
            localStorage.setItem('warehouse', importedData.warehouse);

            console.log('Import successful!');
            window.location.reload();
        } catch (error) {
            console.error('Error importing data:', error);
        }
    };

    reader.readAsText(file);
}
