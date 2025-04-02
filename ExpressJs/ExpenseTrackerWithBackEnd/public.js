document.addEventListener("DOMContentLoaded", function () {
    fetchExpenses();
});

function fetchExpenses() {
    axios.get('/api/expenses/get')
        .then(response => {
            const expenses = response.data;
            const list = document.getElementById('expenseDetail');
            list.innerHTML = ''; // Clear old list

            expenses.forEach(expense => {
                const li = document.createElement('li');
                li.innerHTML = `${expense.expenseAmount} - ${expense.description} - ${expense.category} 
                    <button onclick="editExpense(${expense.id})">Edit</button>
                    <button onclick="deleteExpense(${expense.id})">Delete</button>`;
                list.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching expenses:', error));
}

function deleteExpense(id) {
    axios.delete(`/api/expenses/delete/${id}`)
        .then(() => fetchExpenses())
        .catch(error => console.error('Error deleting expense:', error));
}

function editExpense(id) {
    const newDesc = prompt("Enter new description:");
    if (newDesc) {
        axios.put(`/api/expenses/update/${id}`, { description: newDesc })
            .then(() => fetchExpenses())
            .catch(error => console.error('Error updating expense:', error));
    }
}
