// Medicine Tracker - frontend script.
//
// The backend API runs at BASE_URL (default http://localhost:8000).
//
// TASKS
// -----
// Core task 1: implement fetchMedicines() and renderMedicines(data) so the page
//   fetches /medicines and displays it WITHOUT crashing on missing or invalid
//   data. The data contains records with a null name, an empty-string name, a
//   missing name, a null price, a missing price, and a non-numeric price. Decide
//   how to display each case (e.g. show "Unknown" or flag it) without throwing.
//
// Core task 2: implement fetchUnreliable() so it calls /medicines/unreliable,
//   shows a useful message in the #error area when it fails, and retries
//   sensibly. Do NOT hammer the server: use a small number of retries with a
//   short delay between them, and give up cleanly after a few tries. The
//   endpoint fails about 30% of the time.
//
// Stretch: add an average-price endpoint in backend/main.py and call it here.

const BASE_URL = "http://localhost:8000";

// DOM elements (already present in index.html - no layout work needed).
const resultsEl = document.getElementById("results");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");

/**
 * TODO (Core task 1): fetch the list of medicines from /medicines.
 * Return the medicines array. Surface network/HTTP errors so the caller can show them.
 */
async function fetchMedicines() {
    const response = await fetch(`${BASE_URL}/medicines`)
    const data = await response.json()
    if(response.ok){
        return data.medicines
    } else{
        throw new Error(`HTTP ERROR: ${response.status}`)
    }
    // TODO: fetch(`${BASE_URL}/medicines`), check response.ok, return the data.
}

/**
 * TODO (Core task 1): render the medicines into #results without crashing on
 * missing or invalid fields. Handle: null name, empty-string name, missing name,
 * null price, missing price, non-numeric price. Show something sensible for each.
 * TODO: clear the #error area on success.
 */

function formatName(name){
    if(name == null){
        return {message: "The name of this medicine isn't currently available", invalid:true}
    }
    const trimmed = name.trim()
    if(trimmed.length == 0){
          return {message: "The name of this medicine isn't currently available", invalid:true}
    }
    return {message: trimmed, invalid:false}
}

function formatPrice(price){
    if(price == null){
        return {message: "The price of this medicine isn't currently available", invalid:true}
    }

    const cleanPrice = Number.parseFloat(price)
    if(!Number.isFinite(cleanPrice)){
       return {message: "The price of this medicine is invalid", invalid:true}
    }
    return {message: `£${cleanPrice.toFixed(2)}`, invalid: false}
}

function makeCell(tag,result){
    const cell = document.createElement(tag)
    cell.textContent = result.message
    if(result.invalid){
        cell.classList.add('invalid')
    }
}


function renderMedicines(data) {
resultsEl.textContent = ""
    const table = document.createElement('table')
    const tHead = document.createElement('tHead')
    const tRow = document.createElement('tr')

    for(const heading of ["Name", "Price"]){
        const th = document.createElement('th')
        th.textContent = heading
        tRow.appendChild(th)
    }
    tHead.appendChild(tRow)
    table.appendChild(tHead)

    
    const tBody = document.createElement('tbody')
    for(const med of data){
let data = renderMedicines(data.medicines)
        const row = document.createElement('tr')
        row.appendChild(makeCell("td"), formatName(med.name))
         row.appendChild(makeCell("td"), formatPrice(med.price))
         tBody.appendChild(row)

    }
    table.appendChild(tBody)
    resultsEl.appendChild(table)
    // TODO: build a table (the .results styles expect a <table>), iterate the
    // records, and render each row safely. Use the .invalid class to flag bad
    // values if you like.
}

/**
 * TODO (Core task 2): fetch from /medicines/unreliable with sensible retries.
 * Retry a few times with a short delay between attempts (do not hammer the
 * server). When you give up, show a useful message in #error. On success,
 * render the data and clear #error. Show/hide the #loading area while working.
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function fetchUnreliable(maxAttempts, delayMs = 500) {
    loadingEl.hidden = false
    try{
        for(let attempt = 1; attempt <= maxAttempts; attempt++){
            try{
                const response = await fetch(`${BASE_URL}/medicines/unreliable`)
                const data = await response.json()
                if(response.ok){
                   await fetchMedicines()
                   renderMedicines(data.medicines)
                     errorEl.hidden = true
                    errorEl.textContent = ""
                   return
                } else{
                    throw new Error(`Attempt ${attempt} failed: err.message`)
                  
                }
                
            } catch(err){
                   errorEl.hidden = false
                    errorEl.textContent = `Maximum attempts have been reached: ${maximumAttempts}, the server may be currently unavailable. Please try again next time.`
                       if(attempt <= maxAttempts){
                    await sleep(delayMs)
                }
                
            }
        }
    } finally{
        loadingEl.hidden = false
    }

}

// ---- Button wiring (already works - no need to change) ----
document.getElementById("load-medicines").addEventListener("click", async () => {
    loadingEl.hidden = false
    errorEl.hidden = true
    errorEl.textContent = ""

    try{
   await fetchMedicines()
      renderMedicines(data)

    } catch(err){
        errorEl.hidden = false
        errorEl.textContent = err.message
    } finally{
        loadingEl.hidden = false;
    }
    // TODO: call fetchMedicines() then renderMedicines(data),
    // showing #loading and clearing #error appropriately.
});

document.getElementById("load-unreliable").addEventListener("click", async () => {
    await fetchUnreliable()
});
