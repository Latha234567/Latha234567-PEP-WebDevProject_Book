// add variable references and event listeners here!
const API_BASE_URL = "https://www.googleapis.com/books/v1/volumes";
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchType = document.getElementById("search-type");
const searchButton = document.getElementById("search-button"); // Ensure this ID is correct
const bookList = document.getElementById("book-list");
const selectedBook = document.getElementById("selected-book");
const sortRatingButton = document.getElementById("sort-rating");
const ebookFilterCheckbox = document.getElementById("ebook-filter");

let allBooks = []; // Store all fetched books

// Add event listeners
searchForm.addEventListener("submit", handleSearch);
sortRatingButton.addEventListener("click", handleSort);
ebookFilterCheckbox.addEventListener("change", handleFilter);


/**
 * Searches for books using the Google Books API based on the given query and type.
 *
 * @async
 * @param {string} query - The search term (title, ISBN, or author name).
 * @param {string} type - The type of search to perform (e.g., 'title', 'isbn', 'author').
 * @returns {Promise<Array>} A promise that resolves to an array of book objects.
 *
 * @description
 * This function allows users to search for books using the Google Books API.
 * It performs the following actions:
 * 1. Uses the query and type parameters to construct the API request. Make sure to include a query parameter to limit the results to a maximum of 10 books.
 * 2. Fetches data from the Google Books API.
 * 3. Processes the API response to extract relevant book information.
 * 4. Returns an array of book objects with the following properties:
 *    - title: The book's title
 *    - author_name: The name of the author(s)
 *    - isbn: The book's ISBN
 *    - cover_i: Cover image
 *    - ebook_access: Information about ebook availability
 *    - first_publish_year: Year of first publication
 *    - ratings_sortable: Book ratings information
 * 
 * Hint: Regarding steps 3 and 4, consider using the Array object's map() method and assign the above properties as keys. Extract the correct values from the JSON using dot notation. Print your results often for debugging!
 * 
 */
async function searchBooks(query, type) {
    const url =` ${API_BASE_URL}?q=${type}:${query}&maxResults=10`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Check if items exist in the response
        if (!data.items) {
            console.error("No items found.");
            return []; // Return an empty array if no items are found

        }

        // Map data to relevant book properties
        const books = data.items.map(item => ({
            title: item.volumeInfo.title || "Unknown",
            author_name: item.volumeInfo.authors?.join(", ") || "Unknown",
            isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier || "Unknown",
            cover_i: item.volumeInfo.imageLinks?.thumbnail || "",
            ebook_access: item.accessInfo?.isEbook ? "E-book Access: Available" : "E-book Access: Unavailable",
            first_publish_year: item.volumeInfo.publishedDate?.split("-")[0] || "Unknown",
            ratings_sortable: item.volumeInfo.averageRating || "Unknown"
        }));
        return books; // Return the mapped books
    } catch (error) {
        console.error("Error fetching books:", error);
        return []; // Return an empty array in case of an error
    }

}



/**
* Takes in a list of books and updates the UI accordingly.
*
* @param {Array} books - An array of book objects to be displayed.
*
* @description
* This function takes an array of book objects and creates a visual representation
* of each book as a list item (<li>) within an unordered list (<ul>). 
* It performs the following actions:
* 
* 1. Targets the unordered list with the id 'book-list'.
* 2. Clears the inner HTML of the list.
* 3. For each book in the 'books' array, creates an <li> element containing:
*    - The book's title within an element that has a class of `title-element`
*    - The book's author within an element that has a class of `author-element`
*    - The book's cover image within an element that has a class of `cover-element`
*    - The book’s rating within an element that has a class of `rating-element`
*    - The book’s e-book access value within an element that has a class of `ebook-element`
*    Note: The order and specific layout of this information is flexible 
*    and determined by the developer.
* 4. Appends each created <li> element to the 'book-list' <ul>.
* 5. Ensures that the 'selected-book' element is not visible.
*/
function displayBookList(books) {
    bookList.innerHTML = ""; // Clear existing book list
    if (books.length === 0) {
        bookList.innerHTML = "<li>No books available.</li>"; // Handle case when no books are available
    } else {
        books.forEach(book => {
            const li = document.createElement("li");

            li.innerHTML = `
                <h3 class="title-element">${book.title}</h3>
                <p class="author-element">Author: ${book.author_name}</p>
                <img class="cover-element" src="${book.cover_i}" alt="${book.title} cover">
                <p class="rating-element">Rating: ${book.ratings_sortable}</p>
                <p class="ebook-element">${book.ebook_access}</p>
            `;
            
            li.addEventListener("click", () => displaySingleBook(book));
            bookList.appendChild(li);
        });
    }
    bookList.style.display = "block"; // Ensure book list is visible
    selectedBook.style.display = "none"; // Hide selected book details  
}


/**
 * Handles the search form submission and updates the UI with search results.
 * 
 * @async
 * @param {Event} event - The form submission event.
 * 
 * @description
 * This function is triggered when the user submits the search form with id 'search-form'.
 *
 * It performs the following actions:
 * 1. Prevents the default form submission behavior.
 * 2. Retrieves the search query from the textbox input.
 * 3. Gets the selected search type (title, ISBN, or author) from the 'search-type' select element.
 * 4. Calls the searchBooks() function with the query and search type.
 * 5. Waits for the searchBooks() function to return results from the Google Books API.
 * 6. Passes the returned book data to the displayBookList() function to update the UI.
 * 7. Handles any errors that may occur during the search process.
 */
async function handleSearch(event) {
    event.preventDefault();
    const query = searchInput.value.trim(); // Trim whitespace from input
    const type = searchType.value;
    
    if (query === "") {
        console.error("Search query cannot be empty."); // Log error for empty query
        return; // Prevent search if the query is empty
    }
    
    allBooks = await searchBooks(query, type); // Store fetched books in the global variable
    displayBookList(allBooks); // Display the fetched books
}


/**
 * Displays detailed information about a single book when it's clicked.
 * 
 * @param {Object} book - The book object containing detailed information.
 * 
 * @description
 * This function is triggered when a user clicks on a book in the list.
 * It updates the UI to show detailed information about the selected book.
 * 
 * The function performs the following actions:
 * 1. Hides the unordered list element with id 'book-list'.
 * 2. Makes the element with id 'selected-book' visible.
 * 3. Populates the 'selected-book' element with the following book details:
 *    - Title
 *    - Author
 *    - First publish year
 *    - Cover image
 *    - ISBN
 *    - Ebook access value
 *    - Rating
 * 
 * Note: The order and specific layout of the book information within the
 * 'selected-book' element is flexible and determined by the developer.
 * 
 */
function displaySingleBook(book) {
    selectedBook.innerHTML = `
    <h2 class="title-element">${book.title}</h2>
    <p class="author-element">Author: ${book.author_name}</p>
    <img class="cover-element" src="${book.cover_i}" alt="${book.title} cover">
    <p class="published-element">Published: ${book.first_publish_year}</p>
    <p class="rating-element">Rating: ${book.ratings_sortable}</p>
    <p class="ebook-element">${book.ebook_access}</p>
    <p class="isbn-element">ISBN: ${book.isbn}</p>
`;
bookList.style.display = "none"; // Hide the book list
selectedBook.style.display = "block"; // Show selected book details
}

/**
 * Filters the displayed book list to show only e-books when the checkbox is checked.
 * 
 * @description
 * This function ensures that when the checkbox with id 'ebook-filter' is checked, the related search results only display books that are available as e-books.
 * 
 * The function performs the following actions:
 * 1. Checks the state of the 'ebook-filter' checkbox.
 * 2. If checked:
 *    - Filters the current list of books to include only those that are borrowable as e-books.
 *    - Updates the displayed book list with the filtered results.
 * 3. If unchecked:
 *    - Displays the full list of search results without filtering.
 * 
 */
function handleFilter() {
    const isEbookFilterEnabled = ebookFilterCheckbox.checked;
    const filteredBooks = allBooks.filter(book => {
        const isAvailable = book.ebook_access === "E-book Access: Available"; 
        return isEbookFilterEnabled ? isAvailable : true; 
    });

    // Log the filtered books for debugging
    console.log("Filtered Books:", filteredBooks);
    
    displayBookList(filteredBooks); // Re-display filtered books
}


/**
 * Sorts the displayed book list by rating in descending order when the button is clicked.
 * 
 * 
 * @description
 * This function is triggered when the user clicks on the button with the id 'sort-rating'.
 * It sorts the currently displayed list of books based on their ratings.
 * 
 * The function performs the following actions:
 * 1. Sorts the current list of books by their ratings in descending order (highest to lowest).
 * 2. If any rating is non-numeric, such as "undefined" or "unknown", the book's rating must be changed to "0" instead.
 * 3. Updates the displayed book list with the sorted results.
 * 
 */
function handleSort() {
    const sortedBooks = [...allBooks].sort((a, b) => {
        const ratingA = parseFloat(a.ratings_sortable) || 0; // Handle unknown ratings
        const ratingB = parseFloat(b.ratings_sortable) || 0; // Handle unknown ratings
        return ratingB - ratingA;
    });
    displayBookList(sortedBooks); // Display sorted book

}
