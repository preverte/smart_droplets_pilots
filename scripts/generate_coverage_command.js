async function generateRosMessage(pilotId, fieldId, areaId) {
    let jsonUrl;
    if (pilotId === "lspsim") {
        jsonUrl = 'https://raw.githubusercontent.com/preverte/smart_droplets_pilots/main/farms/lspsim.json';
    } else if (pilotId === "lsps") {
        jsonUrl = 'https://raw.githubusercontent.com/preverte/smart_droplets_pilots/main/farms/lsps.json';
    } else {
        throw new Error(`Unknown pilotId "${pilotId}"`);
    }

    const response = await fetch(jsonUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch JSON: ${response.statusText}`);
    }
    const data = await response.json();

    const field = data.pilotId.fields.find(f => f.name === fieldId);
    if (!field) throw new Error(`Field with ID ${fieldId} does not exist.`);
    
    const area = field.areas.find(a => a.id === areaId);
    if (!area) throw new Error(`Area with ID ${areaId} does not exist in field ${fieldId}.`);

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

    return JSON.stringify({
        header: { stamp: { sec: 0, nanosec: 0 }, frame_id: 'map' },
        command: '',
        command_time: '0.0',
        type: 'coverage',
        waypoints: waypoints
    }, null, 2); 
}