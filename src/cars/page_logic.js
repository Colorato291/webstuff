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

function calculateDurationPrice(inputData, car, companyName) {
    // Normalize input for Avis Now
    if (companyName === "Avis Now" && inputData % 15 !== 0) {
        inputData += (15 - inputData % 15);
    }

    // Convert time rates to a normalized format
    const rates = Object.entries(car.time_rates).map(([type, price]) => {
        let duration;
        if (type.includes('minute')) duration = 1;
        else if (type.includes('hour')) duration = 60 * (parseInt(type) || 1);
        else if (type.includes('day')) duration = 24 * 60 * (parseInt(type) || 1);
        else if (type.includes('week')) duration = 7 * 24 * 60 * (parseInt(type) || 1);
        else duration = 1;

        return { type, duration, price, pricePerMinute: price / duration };
    });

    // Sort rates by duration (descending)
    rates.sort((a, b) => b.duration - a.duration);

    // Special handling for LIM vehicles
    if (car.tags != null && car.tags.includes('LIM')) {
        const shortestRate = rates[rates.length - 1];
        let bestPrice = Infinity;
        let bestDuration = [];

        for (const rate of rates) {
            if (rate === shortestRate) continue;

            const wholeRatePeriods = Math.floor(inputData / rate.duration);
            const remainder = inputData % rate.duration;

            const totalPrice = 
                (wholeRatePeriods * rate.price) + 
                (remainder > 0 ? Math.ceil(remainder / shortestRate.duration) * shortestRate.price : 0);

            if (totalPrice < bestPrice) {
                bestPrice = totalPrice;
                bestDuration = [
                    ...(wholeRatePeriods > 0 ? [{ type: rate.type, quantity: wholeRatePeriods }] : []),
                    ...(remainder > 0 ? [{ type: shortestRate.type, quantity: Math.ceil(remainder / shortestRate.duration) }] : [])
                ];
            }
        }

        // Fallback to shortest rate if no better option found
        if (bestDuration.length === 0) {
            bestDuration = [{ 
                type: shortestRate.type, 
                quantity: Math.ceil(inputData / shortestRate.duration) 
            }];
            bestPrice = Math.ceil(inputData / shortestRate.duration) * shortestRate.price;
        }

        return {
            time_price: bestPrice,
            optimal_duration: bestDuration.map(d => 
                `${d.quantity} ${formatDurationType(d.type)}`
            ).join(' + ')
        };
    }

    // Non-LIM vehicle approach
    const options = [];

    // Try all possible rate combinations
    for (const mainRate of rates) {
        for (const secondaryRate of rates) {
            const wholeRatePeriods = Math.floor(inputData / mainRate.duration);
            const remainder = inputData % mainRate.duration;

            const totalPrice = 
                (wholeRatePeriods * mainRate.price) + 
                (remainder > 0 ? Math.ceil(remainder / secondaryRate.duration) * secondaryRate.price : 0);

            const duration = [
                ...(wholeRatePeriods > 0 ? [{ type: mainRate.type, quantity: wholeRatePeriods }] : []),
                ...(remainder > 0 ? [{ type: secondaryRate.type, quantity: Math.ceil(remainder / secondaryRate.duration) }] : [])
            ];

            options.push({ totalPrice, duration });
        }
    }

    // Find the cheapest option
    const cheapestOption = options.reduce((best, current) => 
        current.totalPrice < best.totalPrice ? current : best
    );

    return {
        time_price: cheapestOption.totalPrice,
        optimal_duration: cheapestOption.duration.map(d => 
            `${d.quantity} ${formatDurationType(d.type)}`
        ).join(' + ')
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
    const cache = new Map();
    
    function findBestCombination(remainingTime, remainingKm) {
        const key = `${remainingTime},${remainingKm}`;
        
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        let {time_price, optimal_duration} = calculateDurationPrice(remainingTime, car, companyName);
        let distancePrice = remainingKm * car.distance_rate;
        let bestPrice = time_price + distancePrice;
        let bestCombo = [];
        
        if (optimal_duration) {
            bestCombo.push(optimal_duration + (remainingKm > 0 ? ` + ${remainingKm} km` : ''));
        } else if (remainingKm > 0) {
            bestCombo.push(`${remainingKm} km`);
        }
        
        for (const package of car.trip_packages) {
            const packageKm = package.included_distance;
            const packageTime = package.duration;
            const packagePrice = package.price;
            const packageName = package.name.toLowerCase();
            
            if (packageTime <= remainingTime || packageKm <= remainingKm) {
                const newRemainingTime = Math.max(0, remainingTime - packageTime);
                const newRemainingKm = Math.max(0, remainingKm - packageKm);
                
                const subResult = findBestCombination(newRemainingTime, newRemainingKm);
                const totalPrice = packagePrice + subResult.price;
                
                if (totalPrice < bestPrice) {
                    bestPrice = totalPrice;
                    bestCombo = [packageName, ...subResult.combo];
                }
            }
        }
        
        const result = { price: bestPrice, combo: bestCombo };
        cache.set(key, result);
        return result;
    }
    
    const result = findBestCombination(time, kilometers);
    
    let consolidatedCombo = consolidateItems(result.combo);
    
    const displayText = result.combo.length > 0 && result.combo[0].includes('km') === false ? 
        `Package: ${consolidatedCombo}` : 
        consolidatedCombo;
    
    return [
        companyName,
        car.car_model,
        displayText,
        parseFloat(result.price).toFixed(2)
    ];
}

// Helper function to consolidate identical items in an array
function consolidateItems(items) {
    if (!items || items.length === 0) return '';
    
    const counts = {};
    items.forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
    });
    
    const consolidatedItems = Object.entries(counts).map(([item, count]) => {
        return count > 1 ? `${count} x ${item}` : item;
    });
    
    const packages = [];
    const additionals = [];
    
    consolidatedItems.forEach(item => {
        if (item.includes('Additionally:') || item.includes('km') || item.includes('min') || 
            item.includes('h') || item.includes('d')) {
            additionals.push(item.replace('Additionally: ', ''));
        } else {
            packages.push(item);
        }
    });
    
    // Format the final output
    let result = packages.join(' + ');
    if (additionals.length > 0) {
        result += (result ? ' | Additionally: ' : '') + additionals.join(' + ');
    }
    
    return result;
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
            const car_model = (car.tags !== null && car.tags.includes('LIM')) ? car.car_model + ' ⚡︎' : car.car_model ;
            result_data_payload.push(
                [company.name, car_model, optimal_duration, total_price]
            );
            if(car.trip_packages !== null) {
                const bestPackage = getBestPackage(car, input_in_mins, kilometers, company.name);
                result_data_payload.push(bestPackage);
            }
        });
    });
    createTable(result_data_payload);
}