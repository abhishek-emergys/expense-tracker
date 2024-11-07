const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const openModalBtn = document.querySelector(".btn-open");
const closeModalBtn = document.querySelector(".btn-close");

const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

closeModalBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

const openModal = function () {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

openModalBtn.addEventListener("click", openModal);

const addExpense = () => {
  const expenseDescription =
    document.getElementById("expenseDescription").value;
  const expenseAmount = document.getElementById("expenseAmount").value;
  const spendDate = document.getElementById("spendDate").value;
  const categories = document.getElementById("categories").value;

  const regex = new RegExp("^[a-zA-Z]");

  const validRegex = regex.test(expenseDescription);

  if (expenseDescription.length < 1) {
    document.getElementById("error-description").innerHTML =
      "Please enter description";
    return false;
  } else {
    document.getElementById("error-description").innerHTML = "";
  }

  if (!validRegex) {
    document.getElementById("error-description").innerHTML =
      "Invalid description";
  }

  if (expenseAmount.length <= 0) {
    document.getElementById("error-amount").innerHTML = "Please enter amount";
    return false;
  } else {
    document.getElementById("error-amount").innerHTML = "";
  }

  if (spendDate.length <= 0) {
    document.getElementById("error-date").innerHTML = "Please enter date";
    return false;
  } else {
    document.getElementById("error-date").innerHTML = "";
  }

  if (categories.length <= 0) {
    document.getElementById("error-categories").innerHTML = "Please categories";
    return false;
  } else {
    document.getElementById("error-categories").innerHTML = "";
  }

  const expenseData = {
    description: expenseDescription.trim(),
    amount: expenseAmount,
    date: spendDate,
    categories: categories,
  };

  if (validRegex) {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    expenses.push(expenseData);
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }

  clearInputFields();
  closeModal();
  getAlldata();
};

const clearInputFields = () => {
  document.getElementById("expenseDescription").value = "";
  document.getElementById("expenseAmount").value = "";
  document.getElementById("spendDate").value = "";
  document.getElementById("categories").value = "Food";
  document.getElementById("modal-label").innerHTML = "Add Expense";
};

const getAlldata = (searchExpenses = "") => {
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  if (searchExpenses) {
    expenses = expenses.filter((exp) => {
      return (
        exp.description.toLowerCase().includes(searchExpenses) ||
        exp.categories.toLowerCase().includes(searchExpenses) ||
        exp.amount.toString().includes(searchExpenses)
      );
    });
  } 

  const expenseTracker = document.querySelector(".expense-tracker-list");
  expenseTracker.innerHTML = `
      <table class="table">
          <tr class="head">
            <th class="table-description">Description</th>
            <th class="table-amount">Amount</th>
            <th class="table-date">Date</th>
            <th class="table-categories">Categories</th>
            <th>Actions</th>
          </tr>
      </table>
    `;

  const table = expenseTracker.querySelector(".table");

  expenses.forEach((exp, idx) => {
    const row = document.createElement("tr");
    // console.log("exp.description ", exp.description);

    row.innerHTML = `
      <td class="description-list">${exp.description}</td>
      <td class="amount-list">$${exp.amount}</td>
      <td class="date-list">${exp.date}</td>
      <td class="categories-list">${exp.categories}</td>
      <td>
        <button class="edit-btn" onclick="editExpenseInfo(${idx})">
          <img class="img" src="./assets/editing.png" alt="Edit">
        </button>
        <button class="delete-btn" onclick="deleteExpense(${idx})">
          <img class="img" src="./assets/delete.png" alt="Delete">
        </button>
      </td>
    `;
    table.appendChild(row);
  });

  let totalExpense = 0;
  totalExpense = expenses.reduce((total, exp) => {
    return total + parseFloat(exp.amount);
  }, 0);

  document.getElementById("total-expense").innerHTML = `$${totalExpense}`;

  let categoryWiseTotal = {};

  expenses.forEach((exp) => {
    if (!categoryWiseTotal[exp.categories]) {
      categoryWiseTotal[exp.categories] = 0;
    }
    categoryWiseTotal[exp.categories] += parseFloat(exp.amount);
  });

  document.getElementById("food-total").innerHTML = `$${
    categoryWiseTotal["Food"] || 0
  }`;

  document.getElementById("entertainment-total").innerHTML = `$${
    categoryWiseTotal["Entertainment"] || 0
  }`;

  document.getElementById("bill-total").innerHTML = `$${
    categoryWiseTotal["Bill & Payments"] || 0
  }`;
};

const editExpenseInfo = (idx) => {
  openModal();
  document.getElementById("modal-label").innerHTML = "Edit Expense";

  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const expense = expenses[idx];

  document.getElementById("expenseDescription").value = expense.description;
  document.getElementById("expenseAmount").value = expense.amount;
  document.getElementById("spendDate").value = expense.date;
  document.getElementById("categories").value = expense.categories;

  document.getElementById("saveButton").onclick = null;

  document.getElementById("saveButton").onclick = function () {
    expense.description = document.getElementById("expenseDescription").value;
    expense.amount = document.getElementById("expenseAmount").value;
    expense.date = document.getElementById("spendDate").value;
    expense.categories = document.getElementById("categories").value;

    expenses[idx] = expense;
    localStorage.setItem("expenses", JSON.stringify(expenses));

    closeModal();
    clearInputFields();
    getAlldata();
  };
};

const deleteExpense = (idx) => {
  if (confirm("Do you want to delete expense!!!")) {
    const expense = JSON.parse(localStorage.getItem("expenses")) || [];

    expense.splice(idx, 1);
    localStorage.setItem("expenses", JSON.stringify(expense));
    getAlldata();
  }
};

const searchExpenses = () => {
  const searchExpenses = document
    .getElementById("search-input")
    .value.toLowerCase();
  getAlldata(searchExpenses);
};

getAlldata();

const ctx = document.getElementById("pieChart");

new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        label: "# of Votes",
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});
