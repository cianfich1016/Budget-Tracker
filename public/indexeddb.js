let db;

const request = indexedDB.open('budgetDB', 1);

request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    db.createObjectStore("budgetStore", { autoIncrement: true });
  };

request.onsuccess = event => {
    db = event.target.result;
    console.log(request.result);
  
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (e) {
    console.log(`Woops! ${e.target.errorCode}`);
  };

function checkDatabase() {
  
// Open a transaction on your BudgetStore db
let transaction = db.transaction(['budgetStore'], 'readwrite');
  
// access your BudgetStore object
const store = transaction.objectStore('budgetStore');
  
// Get all records from store and set to a variable
const getAll = store.getAll();

 // If the request was successful
 getAll.onsuccess = function () {
    // If there are items in the store, we need to bulk add them when we are back online
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          // If our returned response is not empty
          if (res.length !== 0) {
            // Open another transaction to BudgetStore with the ability to read and write
            transaction = db.transaction(['budgetStore'], 'readwrite');

            // Assign the current store to a variable
            const currentStore = transaction.objectStore('budgetStore');

            // Clear existing entries because our bulk add was successful
            currentStore.clear();
            console.log('Existing entries cleared');
          }
        });
    }
  };
}

const saveRecord = (record) => {
    console.log('Saving record');
    // Create a transaction on the BudgetStore db with readwrite access
    const transaction = db.transaction(['budgetStore'], 'readwrite');
  
    // Access your BudgetStore object store
    const store = transaction.objectStore('budgetStore');
  
    // Add record to your store with add method.
    store.add(record);
  };
  
  // Listen for app coming back online
  window.addEventListener('online', checkDatabase);