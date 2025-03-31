document.addEventListener('DOMContentLoaded', function () {
    const speakerSelect = document.getElementById('speakerSelect');
    const notesModal = document.getElementById('notesModal');
    const openNotesBtn = document.getElementById('openNotesBtn');
    const closeNotesBtn = document.getElementById('closeNotesBtn');
    const messageInput = document.getElementById('messageInput');

    // ✅ Fetch speakers from talks.json
    fetch('http://localhost:3000/get-events')
        .then(response => response.json())
        .then(talks => {
            speakerSelect.innerHTML = '<option value="">Select a speaker</option>'; // Reset dropdown
            talks.forEach((talk, index) => {
                let option = document.createElement('option');
                option.value = JSON.stringify({ name: talk["Speaker Name"], email: talk["Email"], phone: talk["Phone"] });
                option.textContent = `${talk["Speaker Name"]} (${talk["Congregation"]})`;
                speakerSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error loading speakers:", error));

    // ✅ Open the notes modal
    openNotesBtn.addEventListener('click', () => {
        notesModal.classList.remove('hidden');
    });

    // ✅ Close the notes modal
    closeNotesBtn.addEventListener('click', () => {
        notesModal.classList.add('hidden');
    });

    // ✅ Handle message sending
    document.getElementById('sendMessageBtn').addEventListener('click', function () {
        const selectedSpeaker = speakerSelect.value ? JSON.parse(speakerSelect.value) : null;
        const message = messageInput.value;
        const contactMethod = document.querySelector('input[name="contactMethod"]:checked').value;

        if (!selectedSpeaker) {
            alert("Please select a speaker.");
            return;
        }
        if (!message.trim()) {
            alert("Please enter a message.");
            return;
        }

        // Prepare message data
        const messageData = {
            name: selectedSpeaker.name,
            contact: contactMethod === 'email' ? selectedSpeaker.email : selectedSpeaker.phone,
            method: contactMethod,
            message: message
        };

        // ✅ Send message request to backend
        fetch('http://localhost:3000/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error("Error sending message:", error));
    });
});

// ✅ Function to insert prewritten message into message input
function selectMessage(element) {
    document.getElementById('messageInput').value = element.innerText;
    document.getElementById('notesModal').classList.add('hidden'); // Close modal after selection
}
