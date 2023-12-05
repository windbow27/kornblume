export function exportLocalStorageToJson() {
  const localStorageData = {
    plannerSettings: localStorage.getItem('plannerSettings'),
    planner: localStorage.getItem('planner'), 
    wilderness: localStorage.getItem('wilderness'), 
    warehouse: localStorage.getItem('warehouse'), 
  };

  const localStorageJson = JSON.stringify(localStorageData, null, 2);

  const blob = new Blob([localStorageJson], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'localStorageData.json';

  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
}

export function importLocalStorageFromJson(file) {
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
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  reader.readAsText(file);
}


