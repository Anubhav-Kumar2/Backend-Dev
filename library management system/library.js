// Arrays to store data
const books = [];
const members = [];
const borrowRecords = [];

// 1. CREATE BOOK
function addBook(bookId, title, author, price) {
    if (!bookId || !title || !author || price === undefined) {
        console.log("Error: Missing book details.");
        return;
    }
    const book = { bookId, title, author, price };
    books.push(book);
    console.log(`Book added: "${title}" by ${author}`);
}

// 2. CREATE MEMBER
function addMember(memberId, name, membershipType) {
    if (!memberId || !name || !membershipType) {
        console.log("Error: Missing member details.");
        return;
    }
    if (membershipType !== "Normal" && membershipType !== "Gold") {
        console.log("Error: Invalid membershipType. Must be 'Normal' or 'Gold'.");
        return;
    }
    const member = { memberId, name, membershipType };
    members.push(member);
    console.log(`Member added: ${name} (${membershipType})`);
}

// 3. BORROW BOOKS
function borrowBooks(memberId, bookIdsArray) {
    const member = members.find(m => m.memberId === memberId);
    if (!member) {
        console.log(`Error: Member with ID ${memberId} not found.`);
        return;
    }

    const borrowedBooks = [];
    for (const bookId of bookIdsArray) {
        const book = books.find(b => b.bookId === bookId);
        if (book) {
            borrowedBooks.push(book);
        } else {
            console.log(`Warning: Book with ID ${bookId} not found and was skipped.`);
        }
    }

    if (borrowedBooks.length > 0) {
        const record = { member, books: borrowedBooks };
        borrowRecords.push(record);
        console.log(`Success: ${member.name} borrowed ${borrowedBooks.length} book(s).`);
    } else {
        console.log(`Error: No valid books to borrow for member ${member.name}.`);
    }
}

// 4. CALCULATE TOTAL VALUE
function calculateTotalValue(memberId) {
    const memberRecords = borrowRecords.filter(record => record.member.memberId === memberId);
    let totalValue = 0;
    
    // A member could potentially have multiple borrow records
    memberRecords.forEach(record => {
        totalValue += record.books.reduce((sum, book) => sum + book.price, 0);
    });

    return totalValue;
}

// 5. APPLY DISCOUNT ON LATE FINE
function calculateFine(memberId, fineAmount) {
    const member = members.find(m => m.memberId === memberId);
    if (!member) {
        console.log(`Error: Member with ID ${memberId} not found.`);
        return fineAmount;
    }

    let discountPercentage = 0;
    if (member.membershipType === "Normal") {
        discountPercentage = 5;
    } else if (member.membershipType === "Gold") {
        discountPercentage = 15;
    }

    const discountAmount = (fineAmount * discountPercentage) / 100;
    const finalFine = fineAmount - discountAmount;
    return finalFine;
}

// 6. DISPLAY BORROW SUMMARY
function displaySummary(memberId) {
    console.log(`\n--- Borrow Summary for Member ID: ${memberId} ---`);
    const member = members.find(m => m.memberId === memberId);
    if (!member) {
        console.log(`Error: Member with ID ${memberId} not found.`);
        return;
    }

    console.log(`Member Name: ${member.name}`);
    console.log(`Membership Type: ${member.membershipType}`);
    
    const memberRecords = borrowRecords.filter(record => record.member.memberId === memberId);
    
    if (memberRecords.length === 0) {
        console.log("No books currently borrowed.");
        return;
    }

    console.log("Borrowed Books:");
    memberRecords.forEach(record => {
        record.books.forEach(book => {
            console.log(` - "${book.title}" by ${book.author} ($${book.price})`);
        });
    });

    const totalValue = calculateTotalValue(memberId);
    console.log(`Total Value of Borrowed Books: $${totalValue.toFixed(2)}`);

    const sampleFine = 10; // Testing with a fixed $10 fine
    const finalFine = calculateFine(memberId, sampleFine);
    console.log(`Example Late Fine Calculation (Base: $${sampleFine}): Final fine after discount is $${finalFine.toFixed(2)}`);
    console.log("-------------------------------------------");
}

// ============================================
// SAMPLE DATA AND EXECUTION
// ============================================

console.log("=== Initializing Library ===");
addBook(101, "The Great Gatsby", "F. Scott Fitzgerald", 15.99);
addBook(102, "1984", "George Orwell", 12.99);
addBook(103, "To Kill a Mockingbird", "Harper Lee", 14.50);
addBook(104, "The Hobbit", "J.R.R. Tolkien", 22.00);

console.log("\n=== Registering Members ===");
addMember("M001", "Alice Smith", "Gold");
addMember("M002", "Bob Johnson", "Normal");
addMember("M003", "Charlie Brown", "Platinum"); // Testing invalid membership error

console.log("\n=== Borrowing Books ===");
borrowBooks("M001", [101, 104]); // Alice borrows two valid books
borrowBooks("M002", [102, 999]); // Bob borrows one valid and one invalid book
borrowBooks("M999", [103]);      // Invalid member borrowing

console.log("\n=== Summaries ===");
displaySummary("M001");
displaySummary("M002");
displaySummary("M999"); // Invalid member summary
