import { updateChart } from './categoryChart.js';
import { formatCurrency } from './formatCurrency.js';
import { updateGSTVisibility } from './GST.js';
import { updateProgress } from './progressBar.js';

document.addEventListener("DOMContentLoaded", () => {
  //Budget
  const budgetInput = document.querySelector(".t-budget");
  const setBudget = document.querySelector(".set-budget");

  //Dashboard
  const spentDisplay = document.querySelector(".t-spent");
  const gstDisplay = document.querySelector(".t-gst");
  const progressBar = document.querySelector(".progress");

  //Expense form
  const expenseForm = document.querySelector(".expense-form");

  const dateInput = document.querySelector(".date");
  const descriptionInput = document.querySelector(".description");
  const amountInput = document.querySelector(".amount");
  const vendorInput = document.querySelector(".vendor");
  const categoryInput = document.querySelector(".category");

  //GST
  const gstToggle = document.querySelector(".gst");
  const gstRateContainer = document.querySelector(".gst-rate-container");

  const gstRateInput = document.querySelector(".gst-rate");

  //Expenses
  const expenseList = document.querySelector(".expense-list");

  const searchInput = document.querySelector(".search-e");

  const expenseFilter = document.querySelector(".filter-expenses .filter-e");

  //Category chart
  const chartFilter = document.querySelector(".category-wise-spent .filter-e");

  const chartCanvas = document.querySelector(".category-chart");

  const progressFill = document.querySelector(".progress-fill");


  let budget = Number(localStorage.getItem("budget")) || 0;


  let expenses = [];
  try {
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  } catch {
    expenses = [];
  }



  const refreshGST = () =>
    updateGSTVisibility(gstToggle, gstRateContainer, gstRateInput);

  const refreshChart = () =>
    updateChart(chartCanvas, expenses, chartFilter.value);

  function refreshAll() {
    updateDashboard();
    renderExpenses();
    refreshChart();
  }

  gstToggle.addEventListener("change", refreshGST);
  chartFilter.addEventListener("change", refreshChart);




  //Local Storage
  function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }

  function saveBudget() {
    localStorage.setItem("budget", budget);
  }

  //Set Budget
  setBudget.addEventListener("click", () => {
    const newBudget = Number(budgetInput.value);

    if (!newBudget || newBudget <= 0) {
      alert("Please enter a valid budget.");
      return;
    }
    budget = newBudget;

    saveBudget();
    updateDashboard();
  });


  //Add Expense
  expenseForm.addEventListener("submit", (event) => {
    
    event.preventDefault();

    const date = dateInput.value;

    const description = descriptionInput.value.trim();

    const amount = Number(amountInput.value);

    const vendor = vendorInput.value.trim();

    const category = categoryInput.value;

    if (!date) {
      alert("Please select a date.");
      return;
    }

    if (!description) {
      alert("Please enter a description.");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!vendor) {
      alert("Please enter the vendor name.");
      return;
    }

    if (!category) {
      alert("Please select a category.");
      return;
    }

    const gstApplied = gstToggle.checked;

    let gstRate = 0;
    let gstAmount = 0;

    if (gstApplied) {
      gstRate = Number(gstRateInput.value);

      if (!gstRate) {
        alert("Please select a GST rate.");

        return;
      }

      gstAmount = amount * (gstRate / 100);
    }

    const expense = {
      id: Date.now(),

      date,

      description,

      amount,

      vendor,

      category,

      gstApplied,

      gstRate,

      gstAmount,
    };

    expenses.push(expense);

    saveExpenses();

    expenseForm.reset();

    refreshGST();
    refreshAll();
  });


  //Total Spent
  function getTotalSpent() {
    return expenses.reduce((total, expense) => {
      return total + Number(expense.amount) + Number(expense.gstAmount || 0);
    }, 0);
  }


  //Total GST
  function getTotalGST() {
    return expenses.reduce((total, expense) => {
      return total + Number(expense.gstAmount || 0);
    }, 0);
  }


  //Update Dashboard
  function updateDashboard() {
    const totalSpent = getTotalSpent();

    const totalGST = getTotalGST();

    //Total spent
    spentDisplay.textContent = formatCurrency(totalSpent);

    //Total GST
    gstDisplay.textContent = formatCurrency(totalGST);

    //Progress
    updateProgress(progressFill, totalSpent, budget);
  }


  //Render Expenses
  function renderExpenses() {
    const searchValue = searchInput.value.trim().toLowerCase();

    const selectedCategory = expenseFilter.value;

    const filteredExpenses = expenses.filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchValue) ||
        expense.vendor.toLowerCase().includes(searchValue);

      const matchesCategory =
        !selectedCategory || expense.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    expenseList.innerHTML = "";

    if (filteredExpenses.length === 0) {
      expenseList.innerHTML = `
    <li class="no-expenses">
      No expenses found.
    </li>
  `;

      return;
    }

    const sortedExpenses = [...filteredExpenses].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    sortedExpenses.forEach((expense) => {
      const li = document.createElement("li");

      li.className = "expense-item";

      const gstHTML = expense.gstApplied
        ? `
              <small>
                GST ${expense.gstRate}%
                (${formatCurrency(expense.gstAmount)})
              </small>
            `
        : `
              <small>
                No GST
              </small>
            `;

      li.innerHTML = `

          <div class="expense-info">

            <div>

              <h3>
                ${escapeHTML(expense.description)}
              </h3>

              <p>
                ${escapeHTML(expense.vendor)}
                •
                ${escapeHTML(capitalize(expense.category))}
              </p>

              <small>
                ${expense.date}
              </small>

            </div>


            <div>

              <strong>
                ${formatCurrency(expense.amount)}
              </strong>

              ${gstHTML}

              <button
                type="button"
                class="delete-expense"
                data-id="${expense.id}"
              >
                Delete
              </button>

            </div>

          </div>
        `;

      expenseList.appendChild(li);
    });
  }

  
  //Delete Expense
  expenseList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".delete-expense");
    if (!confirm("Delete this expense?")) {
      return;
    }

    const id = Number(deleteButton.dataset.id);

    expenses = expenses.filter((expense) => expense.id !== id);

    saveExpenses();
    refreshAll();
  });

  searchInput.addEventListener("input", renderExpenses);

  expenseFilter.addEventListener("change", renderExpenses);



  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")

      .replaceAll("<", "&lt;")

      .replaceAll(">", "&gt;")

      .replaceAll('"', "&quot;")

      .replaceAll("'", "&#039;");
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function initialize() {
    budgetInput.value = budget || "";

    refreshGST();
    refreshAll();
  }

  initialize();
});
