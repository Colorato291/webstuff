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
        if (headerText == 'Price'){
            th.setAttribute("onclick", "sortTable()");
        }
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
    table.setAttribute("id", "price_table");
    table_div.innerHTML = '';
    table_div.appendChild(table);
}

let isAscending = true;
function sortTable(ascending = isAscending) {
    const table = document.getElementById("price_table");
    const rows = Array.from(table.rows).slice(1);

    rows.sort((a, b) => {
        const priceA = parseFloat(a.cells[3].textContent);
        const priceB = parseFloat(b.cells[3].textContent);
        return ascending ? priceA - priceB : priceB - priceA;
    });

    const fragment = document.createDocumentFragment();
    rows.forEach(row => fragment.appendChild(row));
    table.tBodies[0].appendChild(fragment);

    isAscending = !ascending;

    const header = table.rows[0].cells[3];
    header.textContent = `Price ${ascending ? '▲' : '▼'}`;
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

function convertTime(hours) {
    const minutes = Math.floor((hours % 1) * 60);
    const remainingHours = Math.floor(hours % 24);
    const days = Math.floor((hours / 24) % 7);
    const weeks = Math.floor(hours / (24 * 7));

    return {
        minutes,
        hours: remainingHours,
        days,
        weeks
    };
}

function generateForm(rentConditions){
    const { minutes = 0, hours = 0, days = 0, weeks = 0, kilometers = 0 } = rentConditions;
    let timeComponents = [];

    if (weeks > 0) timeComponents.push(`${weeks} w`);
    if (days > 0) timeComponents.push(`${days} d`);
    if (hours > 0) timeComponents.push(`${hours} h`);
    if (minutes > 0) timeComponents.push(`${minutes} min`);

    let timeString = timeComponents.join(' ');

    if (timeComponents.length > 0) {
        timeString += ` + ${kilometers} km`;
    } else {
        timeString = `${kilometers} km`; // If no time components, just show kilometers
    }

    return timeString;
}

function calculateDurationPrice(timeData, car, companyName){
    let { minutes = 0, hours = 0, days = 0, weeks = 0} = timeData;

    weeks += Math.floor(days/7);
    days %= 7;

    if (!car.week_rate){
        days += weeks*7
        weeks = 0;
    }
    if (!car.day_rate) {
        hours = days*24
        days = 0;
    }
    if (!car.hour_rate) {
        minutes += hours*60
        hours = 0;
    }
    
    if (companyName == "Avis Now" && minutes%15 !== 0){
        minutes += (15-minutes%15);
    }

    let optimizedDuration = {minutes, hours, days, weeks};
    const units = Object.keys(optimizedDuration);
    
    for(let i = 0; i < units.length - 1; i++){
        const currentUnit = units[i];
        const currentRate = car[`${currentUnit.slice(0, -1)}_rate`];
        if (currentRate !== null){
            for (let j = i+1; j < units.length - 1; j++){
                const nextUnit = units[j];
                const nextRate = car[`${nextUnit.slice(0, -1)}_rate`];
                if (nextRate !== null && currentRate * optimizedDuration[currentUnit] >= nextRate) {
                    optimizedDuration[nextUnit]++;
                    Object.keys(optimizedDuration).slice(0, j).forEach(key => {
                        optimizedDuration[key] = 0;
                    })
                    break;
                }
            }
        }
    }
    ({minutes, hours, days, weeks} = optimizedDuration);
    const time_price = (
        (car.minute_rate || 0)*minutes+
        (car.hour_rate || 0)*hours+
        (car.day_rate || 0)*days+
        (car.week_rate || 0)*weeks
    );
    return {time_price, optimizedDuration};
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
            const {kilometers, ...timeData} = inputData;
            const {time_price, optimizedDuration} = calculateDurationPrice(timeData, car, company.name);
            // Distance Related pricing
            const distance_price = (
                car.distance_rate*
                Math.max(inputData.kilometers-car.included_distance, 0)
            );
            const total_price = parseFloat(distance_price + time_price + car.start_fee).toFixed(2);
            result_data_payload.push(
                [company.name, car.car_model, generateForm({...optimizedDuration, kilometers}), total_price]
            );
            if(car.trip_packages !== null) {
                let cheapestPackagePrice = Infinity;
                let cheapestPackageName = null;
                car.trip_packages.forEach(package => {
                    let [packageKilometers, packageDuration, packagePrice, packageName] =
                    [package.included_distance, package.duration, package.price, package.name.toLowerCase()];
                    const convertedTime = timeData.minutes/60+timeData.hours+timeData.days*24+timeData.weeks*24*7;
                    const additionalDuration = Math.max(convertedTime-packageDuration, 0);
                    const additionalKilometers = Math.max(inputData.kilometers-packageKilometers, 0);
                    let {time_price: additionalPrice, optimizedDuration: additionalForm} = calculateDurationPrice(convertTime(additionalDuration), car, company.name);
                    packagePrice = packagePrice + additionalPrice + additionalKilometers*car.distance_rate;
                    additionalForm = generateForm({...additionalForm, kilometers: additionalKilometers});
                    packageName += ` | Additionally: ${additionalForm}`
                    if (cheapestPackagePrice >= packagePrice){
                        cheapestPackageName = packageName;
                        cheapestPackagePrice = packagePrice;
                    }
                });
                result_data_payload.push(
                    [company.name, car.car_model, `Package: ${cheapestPackageName}`, parseFloat(cheapestPackagePrice).toFixed(2)]
                );
            }
        });
    });
    createTable(result_data_payload);
}