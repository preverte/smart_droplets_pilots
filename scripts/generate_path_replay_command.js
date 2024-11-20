async function generatePathReplayRosMessage(pilotId, fieldId, pathName) {
    let jsonUrl;
    console.log(`Received pilotId: "${pilotId}"`);

    // Determine the correct JSON URL based on the pilotId
    if (pilotId.trim() === 'lspsim') {
        jsonUrl = `pilots/farms/lspsim.json?v=${new Date().getTime()}`;
    } else if (pilotId.trim() === 'lsps') {
        jsonUrl = `pilots/farms/lsps.json?v=${new Date().getTime()}`;
    } else if (pilotId.trim() === 'lspl') {
        jsonUrl = `pilots/farms/lspl.json?v=${new Date().getTime()}`;
    } else {
        alert(`Unknown pilotId "${pilotId}". Please enter either "lspsim", "lsps", or "lspl".`);
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

    // Find the path based on pathName
    const path = field.paths.find(p => p.name === pathName);
    if (!path) throw new Error(`Path with name "${pathName}" does not exist in field "${fieldId}".`);

    // Create waypoints from the path points
    const waypoints = path.points.map(point => ({
        map_id: "map",
        geographic_point: {
            latitude: point.lat,
            longitude: point.lon,
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
        type: 'path_replay',
        waypoints: waypoints
    }, null, 2);
}
