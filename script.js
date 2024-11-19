document.addEventListener("DOMContentLoaded", () => {
    const bookGrid = document.querySelector("#book-grid tbody");
    const messageDiv = document.getElementById("message");
    const issueButton = document.getElementById("issue-button");

    // Fetch and populate book data
    async function loadBooks() {
        try {
            const response = await fetch("http://localhost:3000/getBooks", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const { books } = await response.json();

            // Clear the grid
            bookGrid.innerHTML = '';

            if (!books || books.length === 0) {
                messageDiv.textContent = "No books available.";
                return;
            }

            // Populate the grid with book data
            books.forEach((book, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${book.name}</td>
                    <td>${book.status === 0 ? 'Available' : 'Not Available'}</td>
                `;
                bookGrid.appendChild(row);
            });
        } catch (error) {
            console.error("Error loading books:", error);
            messageDiv.textContent = "Could not load books. Please try again.";
        }
    }

    // Issue a book based on user input
    async function issueBook() {
        const studentNumber = document.getElementById("student-number").value.trim();
        const bookNumber = document.getElementById("book-number").value.trim();

        if (!studentNumber || !bookNumber) {
            alert("Please enter both student number and book number.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/issueBook", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ student: studentNumber, book: bookNumber }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const { message } = await response.json();

            // Display the success or error message
            messageDiv.textContent = message;
            messageDiv.classList.add("visible"); // Add a CSS class for styling
            setTimeout(() => {
                messageDiv.classList.remove("visible");
                messageDiv.textContent = ""; // Clear the message after 3 seconds
            }, 30000);

            // Reload the book grid to reflect the updated status
            loadBooks();
        } catch (error) {
            console.error("Error issuing book:", error);
            messageDiv.textContent = "Could not issue the book. Please try again.";
        }
    }

    // Event Listener for the issue button
    issueButton.addEventListener("click", (event) => {    
        event.preventDefault(); // Prevent the default form submission behavior
        issueBook();
    });
    
    const resetButton = document.getElementById("reset-button");
    // Event Listener for the reset button
    resetButton.addEventListener("click", async () => {
        try {
            // Fetch the reset operation (you can implement the backend API for resetting)
            const response = await fetch("http://localhost:3000/resetBooks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            alert(data.message || "Books data reset successfully!");
            
            // Optionally, reload book data to reflect the reset
            loadBooks();
        } catch (error) {
            console.error("Error resetting books:", error);
            alert("Failed to reset book data. Please try again.");
        }
    });
    // Load books on page load
    loadBooks();
});

