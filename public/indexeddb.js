let db;

//request database instance called budgetDB
const request = indexedDB.open('budgetDB', 1);

//create an object store for when browser refreshes/is upgraded
request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    db.createObjectStore("budgetStore", { autoIncrement: true });
  };

//if successful, console log request.result
request.onsuccess = event => {
    db = event.target.result;
    console.log(request.result);
  
//if online, call checkDatabase() function
  if (navigator.onLine) {
    checkDatabase();
  }
};

//if error, console log error message
request.onerror = function (e) {
    console.log(`Woops! ${e.target.errorCode}`);
  };

function checkDatabase() {
  
// open transaction in budgetStore db
let transaction = db.transaction(['budgetStore'], 'readwrite');
  
// access BudgetStore object
const store = transaction.objectStore('budgetStore');
  
// retrieve all records from storage
const getAll = store.getAll();

 getAll.onsuccess = function () {
    // use post request to add them in bulk when application is back online
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
          if (res.length !== 0) {
            transaction = db.transaction(['budgetStore'], 'readwrite');
            const currentStore = transaction.objectStore('budgetStore');

            // delete existing entries
            currentStore.clear();
            console.log('Existing entries cleared');
          }
        });
    }
  };
}

const saveRecord = (record) => {
    console.log('Saving record');
    // transaction created set to transaction variable with readwrite ability to be read and stored
    const transaction = db.transaction(['budgetStore'], 'readwrite');
    const store = transaction.objectStore('budgetStore');
  
    // add record to store
    store.add(record);
  };
  
  // if app is back online, call checkDatabase()
  window.addEventListener('online', checkDatabase);