document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        document.getElementById('title').classList.add('visible');
    }, 100);
    setTimeout(function() {
        document.getElementById('duration_input').classList.add('visible');
    }, 1000);
});

document.querySelectorAll('#days_input, #hours_input, #minutes_input').forEach(function(input) {
    input.addEventListener('input', function() {
        const min = parseInt(input.min, 10);
        const max = parseInt(input.max, 10);
        
        if (input.value !== '') {
            if (input.value < min) {
                input.value = min;
            } else if (input.value > max) {
                input.value = max;
            }
        }
        document.getElementById('distance_input').classList.add('visible');
        document.getElementById('kilometer_input').disabled = false;
    });
});

document.getElementById('kilometer_input').addEventListener('input', function() {
    let input = this;
    const min = parseInt(input.min, 10);
    const max = parseInt(input.max, 10);
    if (input.value !== '') {
        if (input.value < min) {
            input.value = min;
        } else if (input.value > max) {
            input.value = max;
        }
    }
    document.getElementById('calculate_button').classList.add('visible');
    document.getElementById('data_submission').disabled = false;
});

function dataSubmission() {
    const getInputValue = (id) => parseInt(document.getElementById(id).value) || 0;

    const minutes = getInputValue('minutes_input');
    const hours = getInputValue('hours_input');
    const days = getInputValue('days_input');
    const kilometers = getInputValue('kilometer_input');

    priceCalculations({minutes, hours, days, weeks: 0, kilometers});
}

function createTable(priceData) {
    const table_div = document.getElementById('result_table');

    const table = document.createElement('table');
    const table_head = table.createTHead();
    const headerRow = table_head.insertRow();
    const headers = ['Company', 'Car', 'Rental Form', 'Price'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    const table_body = table.createTBody();
    priceData.forEach(rowData => {
        const row = table_body.insertRow();
        rowData.forEach(cellData =>{
            const cell = row.insertCell();
            cell.textContent = cellData;
        });
    });

    table_div.innerHTML = '';
    table_div.appendChild(table);
}

async function fetchData() {
    try {
        const response = await fetch('/cars/data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

function generateForm(rentConditions){
    const { minutes = 0, hours = 0, days = 0, weeks = 0, kilometers = 0 } = rentConditions;
    let timeComponents = [];

    if (weeks > 0) timeComponents.push(`${weeks} w`);
    if (days > 0) timeComponents.push(`${days} d`);
    if (hours > 0) timeComponents.push(`${hours} h`);
    if (minutes > 0) timeComponents.push(`${minutes} min`);

    let timeString = timeComponents.join(' ');

    timeString += ` + ${kilometers} km`;
    return timeString;
}

async function priceCalculations(inputData){ 
    let price_database = await fetchData();
    if (price_database === null) {
        console.error("Data error");
        return;
    }
    let result_data_payload = [];
    price_database["companies"].forEach(company =>{ // iterate over companies
        company.cars.forEach(car => {
            let { minutes = 0, hours = 0, days = 0, weeks = 0, kilometers = 0 } = inputData;

            weeks += Math.floor(days/7);
            days %= 7;

            if (car.week_rate == null){
                days += weeks*7
                weeks = 0;
            }
            if (car.day_rate == null) {
                hours = days*24
                days = 0;
            }
            if (car.hour_rate == null) {
                minutes += hours*60
                hours = 0;
            }
            
            if (company.name == "Avis Now" && minutes%15 !== 0){
                minutes += (15-minutes%15);
            }

            let timeData = {minutes, hours, days, weeks};
            const units = Object.keys(timeData);
            
            for(let i = 0; i < units.length - 1; i++){
                const currentUnit = units[i];
                const currentRate = car[`${currentUnit.slice(0, -1)}_rate`];
                if (currentRate !== null){
                    for (let j = i+1; j < units.length - 1; j++){
                        const nextUnit = units[j];
                        const nextRate = car[`${nextUnit.slice(0, -1)}_rate`];
                        if (nextRate !== null && currentRate * timeData[currentUnit] >= nextRate) {
                            timeData[nextUnit]++;
                            Object.keys(timeData).slice(0, j).forEach(key => {
                                timeData[key] = 0;
                            })
                            break;
                        }
                    }
                }
            }
            ({minutes, hours, days, weeks} = timeData);
            const time_price = (
                (car.minute_rate || 0)*minutes+
                (car.hour_rate || 0)*hours+
                (car.day_rate || 0)*days+
                (car.week_rate || 0)*weeks
            );
            // Distance Related pricing
            const distance_price = (
                car.distance_rate*
                Math.max(kilometers-car.included_distance, 0)
            );
            const total_price = parseFloat(distance_price + time_price + car.start_fee).toFixed(2);
            result_data_payload.push(
                [company.name, car.car_model, generateForm({minutes, hours, days, weeks, kilometers}), total_price]
            );
            if(car.trip_packages !== null) {
                let cheapestPackagePrice = Infinity;
                let packageFound = false;
                let cheapestPackageName = null;
                car.trip_packages.forEach(package => {
                    console.log('distance: ', kilometers)
                    if(package.included_distance >= kilometers
                    && package.duration >= minutes/60+hours+days*24+weeks*24*7
                    && package.price <= cheapestPackagePrice){
                        cheapestPackagePrice = parseFloat(package.price).toFixed(2);
                        cheapestPackageName = package.name.toLowerCase()
                        packageFound = true;
                    }
                });
                if (packageFound === true) {
                    result_data_payload.push(
                        [company.name, car.car_model, `Package: ${cheapestPackageName}`, cheapestPackagePrice]
                    );
                }
            }
        });
    });
    createTable(result_data_payload);
}