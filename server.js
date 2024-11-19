const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper function to read books data from books.txt
function readBooks() {
    const booksData = fs.readFileSync('books.txt', 'utf-8').split('\n').map((line, index) => {
        const status = parseInt(line.trim());
        return {
            "name": `Book ${index + 1}`, // Default name generation
            "status": isNaN(status) ? 0 : status // Default to 0 if parsing fails
        };
    });
    return booksData;
}

// Get the current list of books and their availability status
app.get('/getBooks', (req, res) => {
    const books = readBooks();
    res.json({ books });
});

// Handle issuing a book
app.post('/issueBook', (req, res) => {
    const { student, book } = req.body;
    console.log('Issuing book...');
    const command = `vvp backend.vvp +studentNumber=${student} +bookNumber=${book}`;

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error('Error executing Verilog simulation:', err);
            return res.json({ message: 'Error in execution' });
        }

        const output = stdout.trim();
        const match = output.match(/\s*(\d+),\s*(\d+),\s*(\d+)/);

        let returnValue, studentNumber, bookNumber;
        if (match) {
            returnValue = parseInt(match[1]);
            studentNumber = parseInt(match[2]);
            bookNumber = parseInt(match[3]);
        }

        let message;
        switch (returnValue) {
            case 0:
                message = `${studentNumber} issued ${bookNumber} successfully!`;
                break;
            case 1:
                message = "You already have a book issued.";
                break;
            case 2:
                message = "The book is unavailable.";
                break;
            default:
                message = "An unknown error occurred.";
        }

        res.json({ message: message });
    });
});

// Reset books and students data to 0
app.post('/resetBooks', (req, res) => {
    console.log('Resetting books and students data...');
    const booksFilePath = 'books.txt'; // Path to the books file
    const studentsFilePath = 'students.txt'; // Path to the students file

    // Reset books.txt
    fs.readFile(booksFilePath, 'utf8', (err, booksData) => {
        if (err) {
            console.error('Failed to read books file:', err);
            return res.status(500).json({ message: 'Failed to read books file.' });
        }

        // Reset books file content to '0' for each book line
        const resetBooksData = booksData.split('\n').map(() => '0').join('\n') + '\n';

        // Write the reset content back to books.txt
        fs.writeFile(booksFilePath, resetBooksData, 'utf8', (err) => {
            if (err) {
                console.error('Failed to reset books data:', err);
                return res.status(500).json({ message: 'Failed to reset books data.' });
            }

            // Now reset students.txt
            fs.readFile(studentsFilePath, 'utf8', (err, studentsData) => {
                if (err) {
                    console.error('Failed to read students file:', err);
                    return res.status(500).json({ message: 'Failed to read students file.' });
                }

                // Reset students file content to '0' for each student line
                const resetStudentsData = studentsData.split('\n').map(() => '0').join('\n') + '\n';

                // Write the reset content back to students.txt
                fs.writeFile(studentsFilePath, resetStudentsData, 'utf8', (err) => {
                    if (err) {
                        console.error('Failed to reset students data:', err);
                        return res.status(500).json({ message: 'Failed to reset students data.' });
                    }

                    // Success after resetting both files
                    res.json({ message: 'Books and students data have been reset to 0.' });
                });
            });
        });
    });
});

// Start the server
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
