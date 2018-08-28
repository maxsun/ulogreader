
console.log("Display Running...");

function roll(q) {
    return Math.atan2(2 * (
        q[0] * q[1] + 
        q[2] * q[3]
        ), 1 - 2 * (
        q[1] * q[1] + 
        q[2] * q[2]
    )) * 57.3;
}

function pitch(q) {
    return Math.asin(2 * (
        q[0] * q[2] - 
        q[3] * q[1]
    )) * 57.3;
}

function yaw(q) {
    return Math.atan2(2 * (
        q[0] * q[3] + 
        q[1] * q[2]
        ), 1 - 2 * (
        q[2] * q[2] + 
        q[3] * q[3]
        )) * 57.3;
}

function deltaT(messages) {
    let deltas = [];
    for (let i = 1; i < messages.length; i++) {
        deltas.push(messages[i].timestamp - messages[i - 1].timestamp);
    }
    return deltas;
}

// input is a list of lists of coords
function graph(data, title) {
    // let colors = ["red", "blue", "green", "orange", "purple"];
    let graphs = [];
    for (let i = 0; i < data.length; i++) {
        graphs.push({
            x: data[i].x,
            y: data[i].y,
            type: "markers",
            name: data[i].name,
        });
    }
    let layout = {
        title: title
    };
    layout = title ? layout : null;
    let graphDiv = document.createElement("div");
    graphDiv.id = "graph-" + title;
    document.getElementById("graphs").appendChild(graphDiv);

    Plotly.newPlot('graph-' + title, graphs, layout);
}

function displayULogBinary(binary) {
    readULog(binary, (d) => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("display").style.display = "block";
        console.log(d);

        for (key in d.info) {
            let row = document.createElement("tr");
            let keyDom = document.createElement("td");
            let valDom = document.createElement("td");
            keyDom.innerText = key;
            valDom.innerText = d.info[key];
            row.appendChild(keyDom);
            row.appendChild(valDom);
            document.getElementById("infoTable").appendChild(row);
        }

        for (key in d.multiInfo) {
            let row = document.createElement("tr");
            let keyDom = document.createElement("td");
            let valDom = document.createElement("td");
            keyDom.innerText = key;
            valDom.innerText = d.multiInfo[key].join(" ");
            row.appendChild(keyDom);
            row.appendChild(valDom);
            document.getElementById("multiInfoTable").appendChild(row);
        }

        for (let i = 0; i < d.logs.length; i++) {
            let row = document.createElement("tr");
            let timeDom = document.createElement("td");
            let levelDom = document.createElement("td");
            let messageDom = document.createElement("td");
            timeDom.innerText = d.logs[i].timestamp;
            levelDom.innerText = d.logs[i].log_level;
            messageDom.innerText = d.logs[i].message;
            row.appendChild(timeDom);
            row.appendChild(levelDom);
            row.appendChild(messageDom);
            document.getElementById("logTable").appendChild(row);
        }

        document.getElementById("numDropouts").innerText = d.dropouts.length.toString();
        document.getElementById("dropoutTime").innerText = (d.dropouts.reduce((a, b) => a + b, 0) / 1000).toString();

        graph([
            {
                x: _.map(d.data.sensor_baro_0, (x) => {return x.timestamp}),
                y: _.map(d.data.sensor_baro_0, (x) => {return x.altitude}),
                name: "Barometer Altitude"
            },
            {
                x: _.map(d.data.vehicle_gps_position_0, (x) => {return x.timestamp}),
                y: _.map(d.data.vehicle_gps_position_0, (x) => {return x.alt / 1000}),
                name: "GPS Altitude"
            }
        ], "Altitude");

        graph([
            {
                x: _.map(d.data.sensor_accel_0, (x) => {return x.timestamp}),
                y: _.map(d.data.sensor_accel_0, (x) => {return x.x}),
                name: "x"
            },
            {
                x: _.map(d.data.sensor_accel_0, (x) => {return x.timestamp}),
                y: _.map(d.data.sensor_accel_0, (x) => {return x.y}),
                name: "y"
            },
            {
                x: _.map(d.data.sensor_accel_0, (x) => {return x.timestamp}),
                y: _.map(d.data.sensor_accel_0, (x) => {return x.z}),
                name: "z"
            }
        ], "Acceleration");
        // only take mag sensor data from one with device id ending in '600'
        let magSensorData = _.filter(d.data.sensor_mag_0, (x) => {return x.device_id % 1000 == 600});
        graph([
            {
                x: _.map(magSensorData, (x) => {return x.timestamp}),
                y: _.map(magSensorData, (x) => {return x.x}),
                name: "x"
            },
            {
                x: _.map(magSensorData, (x) => {return x.timestamp}),
                y: _.map(magSensorData, (x) => {return x.y}),
                name: "y"
            },
            {
                x: _.map(magSensorData, (x) => {return x.timestamp}),
                y: _.map(magSensorData, (x) => {return x.z}),
                name: "z"
            }
        ], "Mag Sensor");
        graph([
            {
                x: _.map(d.data.sensor_gyro_0, (x) => {return x.timestamp}),
                y: _.map(d.data.sensor_gyro_0, (x) => {return x.x}),
                name: "x"
            },
            {
                x: _.map(d.data.sensor_gyro_0, (x) => {return x.timestamp}),
                y: _.map(d.data.sensor_gyro_0, (x) => {return x.y}),
                name: "y"
            },
            {
                x: _.map(d.data.sensor_gyro_0, (x) => {return x.timestamp}),
                y: _.map(d.data.sensor_gyro_0, (x) => {return x.z}),
                name: "z"
            }
        ], "Gyroscope");
        
        graph([
            {
                x: _.map(d.data.vehicle_attitude_0, (x) => {return x.timestamp}),
                y: _.map(d.data.vehicle_attitude_0, (x) => {return roll(x.q)}),
                name: "x"
            }
        ], "Roll Angle");

        graph([
            {
                x: _.map(d.data.vehicle_attitude_0, (x) => {return x.timestamp}),
                y: _.map(d.data.vehicle_attitude_0, (x) => {return x.rollspeed}),
                name: "x"
            }
        ], "Roll Angular Rate");

        graph([
            {
                x: _.map(d.data.vehicle_attitude_0, (x) => {return x.timestamp}),
                y: _.map(d.data.vehicle_attitude_0, (x) => {return pitch(x.q)}),
                name: "x"
            }
        ], "Pitch Angle");

        graph([
            {
                x: _.map(d.data.vehicle_attitude_0, (x) => {return x.timestamp}),
                y: _.map(d.data.vehicle_attitude_0, (x) => {return x.pitchspeed}),
                name: "x"
            }
        ], "Pitch Angular Rate");

        graph([
            {
                x: _.map(d.data.vehicle_attitude_0, (x) => {return x.timestamp}),
                y: _.map(d.data.vehicle_attitude_0, (x) => {return yaw(x.q)}),
                name: "x"
            }
        ], "Yaw Angle");

        graph([
            {
                x: _.map(d.data.vehicle_attitude_0, (x) => {return x.timestamp}),
                y: _.map(d.data.vehicle_attitude_0, (x) => {return x.yawspeed}),
                name: "x"
            }
        ], "Yaw Angular Rate");

        graph([
            {
                x: _.map(d.data.vehicle_gps_position_0, (x) => {return x.timestamp}),
                y: _.map(d.data.vehicle_gps_position_0, (x) => {return x.satellites_used}),
                name: "Num Satellites Used"
            },
            {
                x: _.map(d.data.vehicle_gps_position_0, (x) => {return x.timestamp}),
                y: _.map(d.data.vehicle_gps_position_0, (x) => {return x.fix_type}),
                name: "GPS Fix"
            },
            {
                x: _.map(d.data.vehicle_gps_position_0, (x) => {return x.timestamp}),
                y: _.map(d.data.vehicle_gps_position_0, (x) => {return x.hdop}),
                name: "Horizontal Position Accuracy [m]"
            },
            {
                x: _.map(d.data.vehicle_gps_position_0, (x) => {return x.timestamp}),
                y: _.map(d.data.vehicle_gps_position_0, (x) => {return x.vdop}),
                name: "Vertical Position Accuracy [m]"
            }
        ], "GPS Uncertainty");

        graph([
            {
                x: _.map(d.data.vehicle_gps_position_0, (x) => {return x.timestamp}),
                y: _.map(d.data.vehicle_gps_position_0, (x) => {return x.noise_per_ms}),
                name: "Noise per ms"
            },
            {
                x: _.map(d.data.vehicle_gps_position_0, (x) => {return x.timestamp}),
                y: _.map(d.data.vehicle_gps_position_0, (x) => {return x.jamming_indicator}),
                name: "Jamming"
            }
        ], "GPS Noise & Jamming");

        graph([
            {
                x: _.map(d.data.estimator_status_0, (x) => {return x.timestamp}),
                y: _.map(d.data.estimator_status_0, (x) => {return x.nan_flags}),
                name: "Noise per ms"
            },
        ], "Estimator Watchdog");

        graph([
            {
                x: _.map(d.data.vehicle_status_0, (x) => {return x.timestamp}),
                y: _.map(d.data.vehicle_status_0, (x) => {return x.rc_signal_lost ? 1 : 0}),
                name: "RC Lost (Detected)"
            },
        ], "RC Quality");

        graph([
            {
                x: _.map(d.data.sensor_combined_0, (x) => {return x.timestamp}),
                y: deltaT(d.data.sensor_combined_0),
                name: "delta t (between 2 logged samples)"
            },
            {
                x: _.map(d.data.estimator_status_0, (x) => {return x.timestamp}),
                y: _.map(d.data.estimator_status_0, (x) => {return x.time_slip}),
                name: "Estimator Time Slip"
            }
        ], "Sampling Regularity of Sensor Data");
    });
}

function handleFileSelect(evt) {
    document.getElementById("loading").style.display = "block";
    let files = evt.target.files;

    for (let i = 0; i < files.length; i++) {
        let reader = new FileReader();

        reader.onload = (e) => {displayULogBinary(e.target.result)};
            
        reader.readAsArrayBuffer(files[i]);
    }
}
document.getElementById('files').addEventListener('change', handleFileSelect, false);