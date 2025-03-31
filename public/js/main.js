document.getElementById('addEventBtn').addEventListener('click', function() {
    document.getElementById('eventModal').classList.remove('hidden');
});

document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('eventModal').classList.add('hidden');
});

document.getElementById('submitEvent').addEventListener('click', function() {
    let talkDict = {
        "Talk Date": document.getElementById('talkDictDate').value,
        "Speaker Name": document.getElementById('talkDictSpeaker').value,
        "Talk Title": document.getElementById('talkDictTitle').value,
        "Congregation": document.getElementById('talkDictCongregation').value,
        "Song": document.getElementById('talkDictSong').value,
    };

    // Hide inputs after submission
    document.getElementById('talkDictDate').classList.add('hidden');
    document.getElementById('talkDictSpeaker').classList.add('hidden');
    document.getElementById('talkDictTitle').classList.add('hidden');
    document.getElementById('talkDictCongregation').classList.add('hidden');
    document.getElementById('talkDictSong').classList.add('hidden');

    fetch('http://localhost:3000/add-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(talkDict)
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error('Error:', error));
});

document.addEventListener('DOMContentLoaded', function () {
    loadTalks(); // Load talks on page load
});

// Function to format date for display
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// Function to fetch and display talks
function loadTalks() {
    fetch('http://localhost:3000/get-events')
        .then(response => response.json())
        .then(talks => {
            const tableBody = document.getElementById('talksTableBody');
            tableBody.innerHTML = ""; // Clear table before updating

            // Sort talks by date (earliest first)
            talks.sort((a, b) => new Date(a["Talk Date"]) - new Date(b["Talk Date"]));

            // Populate table
            talks.forEach((talk, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border p-2" id="date-${index}">${formatDateForDisplay(talk["Talk Date"])}</td>
                    <td class="border p-2" id="speaker-${index}">${talk["Speaker Name"]}</td>
                    <td class="border p-2" id="congregation-${index}">${talk["Congregation"]}</td>
                    <td class="border p-2" id="title-${index}">${talk["Talk Title"]}</td>
                    <td class="border p-2" id="song-${index}">${talk["Song"]}</td>
                    <td class="border p-2">
                        <button class="bg-yellow-500 text-white px-2 py-1 rounded edit-btn" data-index="${index}">Edit</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Attach event listeners for edit buttons
            document.querySelectorAll(".edit-btn").forEach(button => {
                button.addEventListener("click", function () {
                    let index = this.dataset.index;
                    editTalk(index);
                });
            });
        })
        .catch(error => console.error("Error loading talks:", error));
}

// Add a new talk and refresh the list
function addTalk(talkData) {
    fetch('http://localhost:3000/add-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(talkData)
    })
    .then(response => response.json())
    .then(() => loadTalks())  // Reload the table after adding an event
    .catch(error => console.error("Error adding talk:", error));
}

// Edit an existing talk
function editTalk(index) {
    const row = document.querySelectorAll("tr")[parseInt(index) + 1];

    // Convert text to input fields
    row.cells[0].innerHTML = `<input type="date" id="edit-date-${index}" value="${row.cells[0].innerText}">`;
    row.cells[1].innerHTML = `<input type="text" id="edit-speaker-${index}" value="${row.cells[1].innerText}">`;
    row.cells[2].innerHTML = `<input type="text" id="edit-congregation-${index}" value="${row.cells[2].innerText}">`;
    row.cells[3].innerHTML = `<input type="text" id="edit-title-${index}" value="${row.cells[3].innerText}">`;
    row.cells[4].innerHTML = `<input type="text" id="edit-song-${index}" value="${row.cells[4].innerText}">`;

    // Replace Edit button with Save button
    row.cells[5].innerHTML = `<button class="bg-green-500 text-white px-2 py-1 rounded save-btn" data-index="${index}">Save</button>`;

    // Attach event listener to Save button
    document.querySelector(`.save-btn[data-index="${index}"]`).addEventListener("click", function () {
        saveTalk(index);
    });
}

// Save edited talk and refresh the list
function saveTalk(index) {
    const updatedTalk = {
        "Talk Date": document.getElementById(`edit-date-${index}`).value,
        "Speaker Name": document.getElementById(`edit-speaker-${index}`).value,
        "Congregation": document.getElementById(`edit-congregation-${index}`).value,
        "Talk Title": document.getElementById(`edit-title-${index}`).value,
        "Song": document.getElementById(`edit-song-${index}`).value
    };

    fetch('http://localhost:3000/update-event', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index, updatedTalk })
    })
    .then(response => response.json())
    .then(() => loadTalks())  // Reload the table after editing an event
    .catch(error => console.error("Error updating talk:", error));
}
