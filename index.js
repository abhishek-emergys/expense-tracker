const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const openModalBtn = document.querySelector(".btn-open");
const closeModalBtn = document.querySelector(".btn-close");

let currentPage = 1;
const itemsPerPage = 5;

const closeModal = function () {
  clearInputFields();
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

const formatAmount = (amount) => {
  if (amount >= 1e3) {
    return (amount / 1e3).toFixed(1) + "k";
  } else {
    return amount.toString();
  }
};

const addExpense = () => {

  document.getElementById('editButton').style.display = "none"
  document.getElementById('saveButton').style.display = "block"

  const expenseDescription = document.getElementById("expenseDescription").value;
  const expenseAmount = document.getElementById("expenseAmount").value;
  const spendDate = document.getElementById("spendDate").value;
  const categories = document.getElementById("categories").value;

  const regex = new RegExp("^[a-zA-Z]");

  const validRegex = regex.test(expenseDescription);

  if (expenseDescription.length < 1) {
    document.getElementById("error-description").innerHTML =
      "Please enter description";
  } else {
    document.getElementById("error-description").innerHTML = "";
  }

  if (!validRegex) {
    document.getElementById("error-description").innerHTML =
      "Invalid description";
  }

  if (expenseAmount.length <= 0) {
    document.getElementById("error-amount").innerHTML = "Please enter amount";
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
    id: Date.now(),
    description: expenseDescription.trim(),
    amount: expenseAmount,
    date: spendDate,
    categories: categories,
  };

  if (validRegex) {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    expenses.push(expenseData);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    alert(`${expenseData.description} Added successfully!!!!`);
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

  document.getElementById("error-categories").innerHTML = "";
  document.getElementById("error-date").innerHTML = "";
  document.getElementById("error-amount").innerHTML = "";
  document.getElementById("error-description").innerHTML = "";  
  
  document.getElementById("modal-label").innerHTML = "Add Expense";
  
  document.getElementById("saveButton").style.display = "block";
  document.getElementById("editButton").style.display = "none";
};

const getAlldata = (searchExpenses = "", sort = "", selectedCategory = "") => {
  let imageUrl = "assets/sort.png";
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  let sortOrder = sort || JSON.parse(localStorage.getItem("flag")) || "";

  if (sortOrder === "asc") {
    imageUrl = "assets/sort-up.png"
    expenses.sort(function (a, b) {
      return a.amount - b.amount;
    });
  }

  if (sortOrder === "desc") {
    imageUrl = "assets/sort-down.png"
    expenses.sort(function (a, b) {
      return b.amount - a.amount;
    });
  }

  if (searchExpenses) {
    expenses = expenses.filter((exp) => {
      return (
        exp.description.toLowerCase().includes(searchExpenses) ||
        exp.categories.toLowerCase().includes(searchExpenses) ||
        exp.amount.toString().includes(searchExpenses)
      );
    });
  }

  if (selectedCategory) {
    expenses = expenses.filter((exp) => exp.categories === selectedCategory);
  }

  let totalPages = Math.ceil(expenses.length / itemsPerPage);
  if(totalPages === 0) {
    totalPages = 1;
  }

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedExpenses = expenses.slice(start, end);

  const expenseTracker = document.querySelector(".expense-tracker-list");
  expenseTracker.innerHTML = `
  <div class="table-list">
      <table class="table">
          <tr class="head">
            <th class="table-description">Title</th>
            <th class="table-amount">Amount
              <img style="
                width: 10px;
                margin-left: 10px;
                cursor: pointer;
                class="sort-img" src="${imageUrl}"
                onclick="sortAmount()"
              >
            </th>
            <th class="table-date">Date</th>
            <th class="table-categories">Categories</th>
            <th>Actions</th>
          </tr>
      </table>
      </div>
      <div class="pagination-div"></div>
    `;

  const table = expenseTracker.querySelector(".table");

  paginatedExpenses.forEach((exp, idx) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="description-list">${exp.description}</td>
      <td class="amount-list">$${exp.amount}</td>
      <td class="date-list">${exp.date}</td>
      <td class="categories-list">${exp.categories}</td>
      <td class="btns">
        <button class="edit-btn" onclick="editExpenseInfo(${exp.id})">
           <img class="img" src="./assets/editing.png" alt="Edit">
        </button>
        <button class="delete-btn" onclick="deleteExpense(${exp.id})">
          <img class="img" src="./assets/delete.png" alt="Delete">
        </button>
      </td>
    `;
    table.appendChild(row);
  });

  updateMonthlyChart(expenses);
  getCardDetails();
  updatePagination(totalPages);
  updateCategoryTotal(expenses);
};

const updateCategoryTotal = (filteredExpenses) => {
  const totalAmount = filteredExpenses.reduce(
    (total, expense) => total + parseFloat(expense.amount),
    0
  );
  document.getElementById("total-expense").innerHTML = `$${formatAmount(
    totalAmount
  )}`;
};

const updatePagination = (totalPages) => {

  const paginationControls = document.querySelector(".pagination-div");
  paginationControls.innerHTML = `
    <button class="prev-button" onclick="changePage('prev')" ${
      currentPage === 1 ? "disabled" : ""
    }>Previous</button>
    <span class="page-data">Page ${currentPage} of ${totalPages}</span>
    <button class="prev-button" onclick="changePage('next')" ${
      currentPage === totalPages ? "disabled" : ""
    }>Next</button>
  `;
};

const changePage = (direction) => {
  if (direction === "next") {
    currentPage++;
  } else if (direction === "prev" && currentPage > 1) {
    currentPage--;
  }

  const sortOrder = JSON.parse(localStorage.getItem("flag"));
  const selectedCategory = document.getElementById("filter-categories").value;

  getAlldata(undefined, sortOrder, selectedCategory);
};

const getCardDetails = () => {
  
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
 
  let totalExpense = 0;
  totalExpense = expenses.reduce((total, exp) => {
    return total + parseFloat(exp.amount);
  }, 0);

  document.getElementById("total-expense").innerHTML = `$${formatAmount(
    totalExpense
  )}`;

  let categoryWiseTotal = {};

  expenses.forEach((exp) => {
    if (!categoryWiseTotal[exp.categories]) {
      categoryWiseTotal[exp.categories] = 0;
    }
    categoryWiseTotal[exp.categories] += parseFloat(exp.amount);
  });

  if(categoryWiseTotal) {

    if(categoryWiseTotal['Food']) {
        document.getElementById("food-total").innerHTML = `$${formatAmount(categoryWiseTotal['Food'])}`;
      } else {
        document.getElementById("food-total").innerHTML = `$0`;
      }

    if(categoryWiseTotal['Entertainment']) {
        document.getElementById("entertainment-total").innerHTML = `$${formatAmount(categoryWiseTotal['Entertainment'])}`;
      } else {
        document.getElementById("entertainment-total").innerHTML = `$0`;
      }

    if(categoryWiseTotal['Bill & Payments']) {
        document.getElementById("bill-total").innerHTML = `$${formatAmount(categoryWiseTotal['Bill & Payments'])}`;
      } else {
        document.getElementById("bill-total").innerHTML = `$0`;
      }
  }
};

const editExpenseInfo = (id) => {
  openModal();
  document.getElementById("modal-label").innerHTML = "Edit Expense";
  document.getElementById('saveButton').style.display = "none";
  document.getElementById('editButton').style.display = "block";

  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const expense = expenses.find((exp) => exp.id === id);

  document.getElementById("expenseDescription").value = expense.description;
  document.getElementById("expenseAmount").value = expense.amount;
  document.getElementById("spendDate").value = expense.date;
  document.getElementById("categories").value = expense.categories;

  document.getElementById("editButton").onclick = function () {
    expense.description = document.getElementById("expenseDescription").value;
    expense.amount = document.getElementById("expenseAmount").value;
    expense.date = document.getElementById("spendDate").value;
    expense.categories = document.getElementById("categories").value;
    
    const regex = new RegExp("^[a-zA-Z]");

  const validRegex = regex.test(expense.description);

  if ((expense.description).length < 1) {
    document.getElementById("error-description").innerHTML =
      "Please enter title";
  } else {
    document.getElementById("error-description").innerHTML = "";
  }

  if (!validRegex) {
    document.getElementById("error-description").innerHTML =
      "Title required";
  }

  if ((expense.amount).length <= 0) {
    document.getElementById("error-amount").innerHTML = "Please enter amount";
  } else {
    document.getElementById("error-amount").innerHTML = "";
  }

  if ((expense.date).length <= 0) {
    document.getElementById("error-date").innerHTML = "Please enter date";
    return false;
  } else {
    document.getElementById("error-date").innerHTML = "";
  }

  if ((expense.categories).length <= 0) {
    document.getElementById("error-categories").innerHTML = "Please categories";
    return false;
  } else {
    document.getElementById("error-categories").innerHTML = "";
  }
    const selectedCategory = document.getElementById("filter-categories").value;
  
    if(validRegex) {
      alert(`${expense.description} updated successfully!!!!`)
      localStorage.setItem("expenses", JSON.stringify(expenses));
  
      closeModal();
      getAlldata(undefined, undefined, selectedCategory);
      getCardDetails();
      clearInputFields();
    }
  };
};

const deleteExpense = (id) => {
  if (confirm("Do you want to delete expense!!!")) {
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    Updatedexpenses = expenses.filter((exp) => exp.id !== id);

    localStorage.setItem("expenses", JSON.stringify(Updatedexpenses));
    getAlldata();
  }
};

const searchExpenses = () => {
  const searchExpenses = document.getElementById("search-input").value.toLowerCase();

  const selectedCategory = document.getElementById("filter-categories").value;

  getAlldata(searchExpenses, undefined, selectedCategory);
};

const sortCategories = () => {
  const searchExpenses = document
    .getElementById("filter-categories")
    .value.toLowerCase();

  document.getElementById('search-input').value = ""
  getAlldata(searchExpenses);
  updateMonthlyChart()
};

const sortAmount = () => {
  let flag = JSON.parse(localStorage.getItem("flag")) || "";

  if(flag === "asc") {
    localStorage.setItem("flag", JSON.stringify("desc"));
  } else if(flag === "desc") {
    localStorage.setItem("flag", JSON.stringify(""));
  } else {
    localStorage.setItem("flag", JSON.stringify("asc"));
  }

  const selectedCategory = document.getElementById("filter-categories").value;

  getAlldata(undefined, JSON.parse(localStorage.getItem("flag")), selectedCategory);

};

const getMonthlyExpenseData = (filteredExpenses) => {
  const monthlyData = {};

  filteredExpenses.forEach((expense) => {
    const month = new Date(expense.date).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    if (!monthlyData[month]) {
      monthlyData[month] = 0;
    }

    monthlyData[month] += parseFloat(expense.amount);
  });

  const labels = Object.keys(monthlyData);
  const data = Object.values(monthlyData);

  return { labels, data };
};

const updateMonthlyChart = (filteredExpenses) => {
  
  const { labels, data } = getMonthlyExpenseData(filteredExpenses);

  monthlyExpenseChart.data.labels = labels;
  monthlyExpenseChart.data.datasets[0].data = data;
  monthlyExpenseChart.update();

  monthlyExpenseLineChart.data.labels = labels;
  monthlyExpenseLineChart.data.datasets[0].data = data;
  monthlyExpenseLineChart.update();
};

const ctx = document.getElementById("monthlyExpenseChart").getContext("2d");

const monthlyExpenseChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "Monthly Expenses (Bar Chart)",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Total Expenses ($)",
        },
      },
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Monthly Expenses",
        },
      },
    },
  },
});

const ctxLine = document.getElementById("monthlyExpenseLineChart").getContext("2d");

const monthlyExpenseLineChart = new Chart(ctxLine, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Monthly Expenses (Line Chart)",
        data: [],
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false, 
        tension: 0.4, 
        borderWidth: 2,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Total Expenses ($)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Month",
        },
      },
    },
  },
});

getAlldata();
getCardDetails();
const mainGetAlldata = getAlldata;

getAlldata = (...args) => {
  mainGetAlldata(...args);
  updateMonthlyChart();
};
