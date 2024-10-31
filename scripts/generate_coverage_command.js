async function generateRosMessage(pilotId, fieldId, areaId) {
    let jsonUrl;
    console.log(`Received pilotId: "${pilotId}"`);

    // Determine the correct JSON URL based on the pilotId
    if (pilotId.trim() === 'lspsim') {
        jsonUrl = 'https://raw.githubusercontent.com/preverte/smart_droplets_pilots/main/farms/lspsim.json';
    } else if (pilotId.trim() === 'lsps') {
        jsonUrl = 'https://raw.githubusercontent.com/preverte/smart_droplets_pilots/main/farms/lsps.json';
    } else {
        alert(`Unknown pilotId "${pilotId}". Please enter either "lspsim" or "lsps".`);
        throw new Error(`Unknown pilotId "${pilotId}"`);
    }

    // Fetch the JSON data
    const response = await fetch(jsonUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch JSON: ${response.statusText}`);
    }
    const data = await response.json();

    // Find the field based on fieldId
    const field = data.farm.fields.find(f => f.name === fieldId);
    if (!field) throw new Error(`Field with ID "${fieldId}" does not exist.`);

    // Find the area based on areaId
    const area = field.areas.find(a => a.id === areaId);
    if (!area) throw new Error(`Area with ID "${areaId}" does not exist in field "${fieldId}".`);

    // Create waypoints from the area coordinates A, B, C, D
    const waypoints = ['A', 'B', 'C', 'D'].map(point => ({
        map_id: "map",
        geographic_point: {
            latitude: area[point].lat,
            longitude: area[point].lon,
            altitude: 0.0
        },
        orientation_3d: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
            w: 1.0
        }
    }));

    // Return the ROS message as a JSON string
    return JSON.stringify({
        header: { stamp: { sec: 0, nanosec: 0 }, frame_id: 'map' },
        command: '',
        command_time: '0.0',
        type: 'coverage',
        waypoints: waypoints
    }, null, 2); 
}