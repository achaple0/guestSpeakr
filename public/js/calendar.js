document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const eventModal = document.getElementById('eventModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModal = document.getElementById('closeModal');
    const submitEvent = document.getElementById('submitEvent');

    // Get modal input fields
    const speakerInput = document.getElementById("speakerInput");
    const talkInput = document.getElementById("talkInput");
    const dateTimeInput = document.getElementById("dateTimeInput");
    const songInput = document.getElementById("songInput");
    const congregationInput = document.getElementById("congregationInput");

    fetch('http://localhost:3000/get-events')
        .then(response => response.json())
        .then(talks => {
            const events = talks.map(talk => ({
                title: talk["Talk Title"],
                start: convertToUTC(talk["Talk Date"]), // Convert stored EST time to UTC for correct rendering
                extendedProps: {
                    speaker: talk["Speaker Name"],
                    song: talk["Song"],
                    congregation: talk["Congregation"]
                }
            }));

            const calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                height: 'auto',
                timeZone: 'America/New_York', // ✅ Force FullCalendar to use EST
                events: events,
                eventClick: function(info) {
                    eventModal.classList.remove('hidden'); // ✅ Show modal
                    modalOverlay.classList.remove('hidden'); // ✅ Show overlay
                    calendarEl.classList.add('opacity-30', 'pointer-events-none'); // ✅ Disable calendar

                    // ✅ Convert UTC to EST for display
                    const eventDateEST = convertToEST(info.event.start);

                    // ✅ Fill modal fields with event details
                    speakerInput.value = info.event.extendedProps.speaker;
                    talkInput.value = info.event.title;
                    dateTimeInput.value = eventDateEST; // Display as EST
                    songInput.value = info.event.extendedProps.song;
                    congregationInput.value = info.event.extendedProps.congregation;
                }
            });

            calendar.render();
        })
        .catch(error => console.error("Error loading events:", error));

    // ✅ Handle event submission & convert time to UTC before saving
    submitEvent.addEventListener('click', function () {
        const newEvent = {
            "Talk Date": convertToUTC(dateTimeInput.value), // ✅ Convert to UTC before saving
            "Speaker Name": speakerInput.value,
            "Talk Title": talkInput.value,
            "Congregation": congregationInput.value,
            "Song": songInput.value
        };

        fetch('http://localhost:3000/add-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEvent)
        })
        .then(response => response.json())
        .then(() => {
            closeEventModal();  // ✅ Close modal after saving event
            location.reload();   // ✅ Refresh the page to show the new event
        })
        .catch(error => console.error("Error adding event:", error));
    });

    // ✅ Function to close the modal and restore the calendar
    function closeEventModal() {
        eventModal.classList.add('hidden'); 
        modalOverlay.classList.add('hidden');
        calendarEl.classList.remove('opacity-30', 'pointer-events-none');
        closeModal.click();

        // Clear input fields after closing
        speakerInput.value = "";
        talkInput.value = "";
        dateTimeInput.value = "";
        songInput.value = "";
        congregationInput.value = "";
    }

    // ✅ Convert EST time input to UTC before saving
    function convertToUTC(estDateString) {
        if (!estDateString) return "";
        
        // Create a date object from the input string
        const localDate = new Date(estDateString);
        
        // Convert to UTC while preserving the local time
        return localDate.toISOString();
    }

    // ✅ Convert UTC back to EST for display
    function convertToEST(utcDate) {
        if (!utcDate) return "";
        
        // Create a date object from the UTC date
        const date = new Date(utcDate);
        
        // Format as YYYY-MM-DDTHH:MM for input fields
        return date.toISOString().slice(0, 16);
    }
});
