async function generateRowFollowingRosMessage(pilotId, fieldNumber, lineNumbers) {
    let jsonUrl;

    // Determine the correct JSON URL based on the pilotId
    if (pilotId.trim() === 'lspsim') {
        jsonUrl = 'https://raw.githubusercontent.com/preverte/smart_droplets_pilots/main/farms/lspsim.json';
    } else if (pilotId.trim() === 'lsps') {
        jsonUrl = 'https://raw.githubusercontent.com/preverte/smart_droplets_pilots/main/farms/lsps.json';
    } else {
        throw new Error(`Unknown pilotId "${pilotId}". Please enter either "lspsim" or "lsps".`);
    }

    // Fetch the JSON data from the GitHub URL
    const response = await fetch(jsonUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch JSON: ${response.statusText}`);
    }
    const data = await response.json();

    // Check if the field exists in the JSON
    const field = data.farm.fields.find(f => f.name === fieldNumber);
    if (!field) {
        throw new Error(`Error: Field number "${fieldNumber}" does not exist.`);
    }

    // Convert lineNumbers from a comma-separated string to an array
    const linesArray = lineNumbers.split(',').map(line => line.trim());

    // Check if the 'lines' field exists within the selected field
    if (!field.lines || field.lines.length === 0) {
        throw new Error(`Error: 'lines' field is null or missing in field "${fieldNumber}".`);
    }

    const waypointsArray = [];

    // Process each line ID
    linesArray.forEach((lineId, index) => {
        const line = field.lines.find(l => l.id === lineId);
        if (line) {
            const { A, B } = line;
            if (A && B) {
                if (index % 2 === 0) {
                    // A -> B
                    waypointsArray.push(createWaypoint(A.lat, A.lon));
                    waypointsArray.push(createWaypoint(B.lat, B.lon));
                } else {
                    // B -> A
                    waypointsArray.push(createWaypoint(B.lat, B.lon));
                    waypointsArray.push(createWaypoint(A.lat, A.lon));
                }
            }
        }
    });

    // Create the final message content
    const messageContent = {
        header: { stamp: { sec: 0, nanosec: 0 }, frame_id: 'map' },
        command: '',
        command_time: '0.0',
        type: 'row_following',
        waypoints: waypointsArray
    };

    return(JSON.stringify(messageContent, null, 2));
}

function createWaypoint(lat, lon) {
    return {
        map_id: "map",
        geographic_point: {
            latitude: lat,
            longitude: lon,
            altitude: 0.0
        },
        orientation_3d: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
            w: 1.0
        }
    };
}