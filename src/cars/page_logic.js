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
        document.getElementById('distance_input').style.userSelect = 'auto';
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
    document.getElementById('calculate_button').style.userSelect = 'auto';
    document.getElementById('calculate_button').style.cursor = 'pointer';
    document.getElementById('data_submission').disabled = false;
});

function dataSubmission() {
    const getInputValue = (id) => parseInt(document.getElementById(id).value) || 0;

    const minutes = getInputValue('minutes_input');
    const hours = getInputValue('hours_input');
    const days = getInputValue('days_input');
    const kilometers = getInputValue('kilometer_input');

    priceCalculations({minutes, hours, days, kilometers});
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
    } else if (kilometers !== 0) {
        timeString = `${kilometers} km`; // If no time components, just show kilometers
    }

    return timeString;
}

function calculateDurationPrice(inputData, car, companyName) {
    if (companyName === "Avis Now" && inputData % 15 !== 0) {
        inputData += (15 - inputData % 15);
    }

    const time_rates = car.time_rates;
    const rates = Object.entries(time_rates).map(([key, price]) => {
        let minutes;
        if (key.includes('minute')) minutes = 1;
        else if (key.includes('hour')) minutes = 60 * (parseInt(key) || 1);
        else if (key.includes('day')) minutes = 24 * 60 * (parseInt(key) || 1);
        else if (key.includes('week')) minutes = 7 * 24 * 60 * (parseInt(key) || 1);
        else minutes = 1; // Default to per minute if unknown
    
        return {
            type: key,
            duration: minutes,
            price: price
        };
    });

    rates.sort((a, b) => b.duration - a.duration);

    const shortestRate = rates[rates.length - 1];

    const dp = new Array(inputData + 1).fill(Infinity);
    const choices = new Array(inputData + 1).fill(null);
    dp[0] = 0;

    for (let i = 1; i <= inputData; i++) {
        for (const rate of rates) {
            if (rate.duration <= i) {
                const newPrice = dp[i - rate.duration] + rate.price;
                if (newPrice < dp[i]) {
                    dp[i] = newPrice;
                    choices[i] = rate;
                }
            }
        }
        
        if (choices[i] === null) {
            choices[i] = shortestRate;
            dp[i] = Math.ceil(i / shortestRate.duration) * shortestRate.price;
        }
    }

    let remaining = inputData;
    const optimal_duration = [];
    while (remaining > 0) {
        const rate = choices[remaining];
        if (!rate) {
            console.error(`No rate found for remaining duration: ${remaining}`);
            break;
        }
        const existingEntry = optimal_duration.find(d => d.type === rate.type);
        if (existingEntry) {
            existingEntry.quantity++;
        } else {
            optimal_duration.push({type: rate.type, quantity: 1});
        }
        remaining -= rate.duration;
    }

    const formatted_duration = optimal_duration.map(d => 
        `${d.quantity} ${formatDurationType(d.type)}`
    ).join(' + ');

    return {
        time_price: parseFloat(dp[inputData].toFixed(2)),
        optimal_duration: formatted_duration
    };
}

function formatDurationType(type) {
    let formattedType = type.toLowerCase();
    let prefix = '';
    const units = formattedType.split(' ');
    if (units.length > 1) {
        prefix = units[0];
    }

    if (formattedType.includes('minute')) formattedType = 'min';
    else if (formattedType.includes('hour')) formattedType = 'h';
    else if (formattedType.includes('day')) formattedType = 'd';
    else if (formattedType.includes('week')) formattedType = 'w';
    
    return prefix + formattedType;
}

function getBestPackage(car, time, kilometers, companyName) {
    let cheapestPackagePrice = Infinity;
    let cheapestPackageName = null;
    car.trip_packages.forEach(package => {
        let [packageKilometers, packageDuration, packagePrice, packageName] =
        [package.included_distance, package.duration, package.price, package.name.toLowerCase()];
        const additionalDuration = Math.max(time-packageDuration, 0);
        const additionalKilometers = Math.max(kilometers-packageKilometers, 0);
        let {time_price, optimal_duration} = calculateDurationPrice(additionalDuration, car, companyName);
        packagePrice = packagePrice + time_price + additionalKilometers*car.distance_rate;
        if (optimal_duration !== '' || additionalKilometers !== 0) {
            packageName += ' | Additionally: ';
            if (optimal_duration !== '' && additionalKilometers !== 0) {
                packageName += `${optimal_duration} + ${additionalKilometers} km`;
            } else if (optimal_duration !== '') {
                packageName += optimal_duration;
            } else if (additionalKilometers !== 0) {
                packageName += `${additionalKilometers} km`;
            }
        }

        if (cheapestPackagePrice >= packagePrice){
            cheapestPackageName = packageName;
            cheapestPackagePrice = packagePrice;
        }
    });
    return [
        companyName,
        car.car_model,
        `Package: ${cheapestPackageName}`,
        parseFloat(cheapestPackagePrice).toFixed(2)];
}

async function priceCalculations(inputData){ 
    let { minutes = 0, hours = 0, days = 0, kilometers = 0} = inputData;
    let input_in_mins = minutes + hours * 60 + days * 60 * 24;

    let price_database = await fetchData();
    if (price_database === null) {
        console.error("Data error");
        return;
    }

    let result_data_payload = [];
    price_database["companies"].forEach(company =>{ // iterate over companies
        company.cars.forEach(car => {
            let {time_price, optimal_duration} = calculateDurationPrice(input_in_mins, car, company.name);
            // Distance Related pricing
            const included_distance = car.included_distance * Math.ceil(input_in_mins/60/24);
            const distance_price = (
                car.distance_rate*
                Math.max(kilometers-included_distance, 0)
            );
            const total_price = parseFloat(distance_price + time_price + car.start_fee).toFixed(2);
            
            if (included_distance < kilometers) optimal_duration += ` + ${kilometers} km`;
            result_data_payload.push(
                [company.name, car.car_model, optimal_duration, total_price]
            );
            if(car.trip_packages !== null) {
                const bestPackage = getBestPackage(car, input_in_mins, kilometers, company.name);
                result_data_payload.push(bestPackage);
            }
        });
    });
    createTable(result_data_payload);
}