const { exec } = require('child_process');
const fs = require('fs');
let student = 3;
let book = 2;
const command = `vvp backend.vvp +studentNumber=${student} +bookNumber=${book}`;
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
const books = readBooks();
console.log(JSON.stringify(books));
exec(command, (err, stdout, stderr) => {
    if (err) {
        console.error('Error executing Verilog simulation:', err);
        // return res.json({ message: 'Error in execution' });
    }

    // Parse the output from Verilog and check the returned value
    const returnValue = stdout.trim();
    console.log('retval',returnValue);
    // Define the message based on the return value
    let message;
    switch (returnValue) {
        case 0:
            message = "Book issued successfully!";
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

    // Return the appropriate message to the frontend
    // res.json({ message: message });
});