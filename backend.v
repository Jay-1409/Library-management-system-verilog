module library_system;
    integer book_file, student_file;
    integer student_number, book_number;
    reg [7:0] student_data [0:511];  // Array to store student data (book issued)
    reg [7:0] book_data [0:255];     // Array to store book data (availability)
    integer i;

    initial begin
        // Open the books.txt file and students.txt file for reading and writing
        book_file = $fopen("books.txt", "r+");
        student_file = $fopen("students.txt", "r+");

        if (!book_file || !student_file) begin
            $display("Error: Could not open files.");
            $finish;
        end

        // Read inputs using $value$plusargs
        if (!$value$plusargs("studentNumber=%d", student_number)) begin
            $display("Invalid inputs");
            $finish;
        end
        if (!$value$plusargs("bookNumber=%d", book_number)) begin
            $display("Invalid inputs");
            $finish;
        end

        // Read the book availability and student data
        for (i = 0; i < 256; i = i + 1) begin
            if ($fscanf(book_file, "%d\n", book_data[i]) != 1) begin
                $display("Error reading book data at line %d", i);
                $finish;
            end
        end
        for (i = 0; i < 512; i = i + 1) begin
            if ($fscanf(student_file, "%d\n", student_data[i]) != 1) begin
                $display("Error reading student data at line %d", i);
                $finish;
            end
        end

        // Check if the student has already issued a book
        if (student_data[student_number] != 0) begin
            $display("%d,%d,%d",1,student_number,book_number);  // Student already issued a book
            $finish;
        end

        // Check if the book is available
        if (book_data[book_number] == 1) begin
            $display("%d,%d,%d",2,student_number,book_number);  // Book is unavailable
            $finish;
        end

        // Mark the book as unavailable and assign it to the student
        book_data[book_number] = 1;
        student_data[student_number] = book_number;

        // Close and reopen files to reset pointers for writing
        $fclose(book_file);
        $fclose(student_file);

        book_file = $fopen("books.txt", "w");
        student_file = $fopen("students.txt", "w");

        if (!book_file || !student_file) begin
            $display("Error: Could not reopen files for writing.");
            $finish;
        end

        // Update the files with the new data
        for (i = 0; i < 256; i = i + 1) begin
            $fdisplay(book_file, book_data[i]);
        end
        for (i = 0; i < 512; i = i + 1) begin
            $fdisplay(student_file, student_data[i]);
        end

        // Indicate successful book issue
        $display("%d,%d,%d",0,student_number,book_number);

        // Close the files
        $fclose(book_file);
        $fclose(student_file);
    end
endmodule
