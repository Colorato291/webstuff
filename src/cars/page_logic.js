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

function calculateDurationPrice(inputData, car, companyName){
    if (companyName == "Avis Now" && inputData%15 !== 0){
        inputData += (15-inputData%15);
    }

    const time_rates = car.time_rates;
    const ratesPerMinute = Object.entries(time_rates).map(([key, price]) => {
        let minutes;
        if (key.includes('minute')) minutes = 1;
        else if (key.includes('hour')) minutes = 60 * (parseInt(key) || 1);
        else if (key.includes('day')) minutes = 24 * 60 * (parseInt(key) || 1);
        else if (key.includes('week')) minutes = 7 * 24 * 60 * (parseInt(key) || 1);
        else minutes = 1; // Default to per minute if unknown
    
        return {
          type: key,
          duration: minutes,
          totalPrice: price
        };
    });
    ratesPerMinute.sort((a, b) => b.duration - a.duration);
    
    let remainder = inputData;
    let time_price = 0;
    let optimal_duration = [];
    while (remainder > 0) {
        let bestRate = null;
        let bestPrice = Infinity;
        let bestQuantity = 0;
        for (const rate of ratesPerMinute){
            const fullQuantity = Math.ceil(remainder / rate.duration);
            const partialQuantity = Math.floor(remainder / rate.duration);
            
            const fullPrice = fullQuantity * rate.totalPrice;
            const partialPrice = partialQuantity > 0 ? partialQuantity * rate.totalPrice : Infinity;
      
            if (fullPrice < bestPrice) {
                bestRate = rate;
                bestPrice = fullPrice;
                bestQuantity = fullQuantity;
            }
      
            if (partialPrice < bestPrice) {
                bestRate = rate;
                bestPrice = partialPrice;
                bestQuantity = partialQuantity;
            }
          }
          
            time_price += bestPrice;
            remainder -= bestQuantity * bestRate.duration;

        let formattedType = bestRate.type.toLowerCase();
        if (formattedType.includes('minute')) formattedType = 'min';
        else if (formattedType.includes('hour')) formattedType = 'h';
        else if (formattedType.includes('day')) formattedType = 'd';
        else if (formattedType.includes('week')) formattedType = 'w';

        optimal_duration.push(`${bestQuantity} ${formattedType}`);
    }
    return {
        time_price: parseFloat(time_price.toFixed(2)),
        optimal_duration: optimal_duration.join(' + ')
    }
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
            const {time_price, optimal_duration} = calculateDurationPrice(input_in_mins, car, company.name);
            // Distance Related pricing
            const distance_price = (
                car.distance_rate*
                Math.max(inputData.kilometers-car.included_distance, 0)
            );
            const total_price = parseFloat(distance_price + time_price + car.start_fee).toFixed(2);
            result_data_payload.push(
                [company.name, car.car_model, optimal_duration + ` + ${kilometers} km`, total_price]
            );
            if(car.trip_packages !== null) {
                let cheapestPackagePrice = Infinity;
                let cheapestPackageName = null;
                car.trip_packages.forEach(package => {
                    let [packageKilometers, packageDuration, packagePrice, packageName] =
                    [package.included_distance, package.duration, package.price, package.name.toLowerCase()];
                    const additionalDuration = Math.max(input_in_mins-packageDuration, 0);
                    const additionalKilometers = Math.max(inputData.kilometers-packageKilometers, 0);
                    let {time_price, optimal_duration} = calculateDurationPrice(additionalDuration, car, company.name);
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
                result_data_payload.push(
                    [company.name, car.car_model, `Package: ${cheapestPackageName}`, parseFloat(cheapestPackagePrice).toFixed(2)]
                );
            }
        });
    });
    createTable(result_data_payload);
}