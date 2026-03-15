const currency = new Intl.NumberFormat("fi-FI", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const budgetForm = document.getElementById("budgetForm");
const homePrice = document.getElementById("homePrice");
const loanAmount = document.getElementById("loanAmount");
const resultNote = document.getElementById("resultNote");
const chips = Array.from(document.querySelectorAll(".chip"));
const featureCards = Array.from(document.querySelectorAll(".feature-card"));
const revealItems = Array.from(document.querySelectorAll(".reveal"));

function calculateAffordablePrice(values) {
  const maxHousingShare = 0.35;
  const monthlyBudget = Math.max(values.income * maxHousingShare - values.debt, 0);
  const monthlyRate = values.rate / 100 / 12;
  const months = values.years * 12;

  if (monthlyRate <= 0 || months <= 0) {
    return { principal: 0, propertyPrice: values.savings };
  }

  const principal = monthlyBudget * ((1 - (1 + monthlyRate) ** -months) / monthlyRate);
  const propertyPrice = principal + values.savings;

  return { principal, propertyPrice, monthlyBudget };
}

function updateResults() {
  const values = {
    income: Number(document.getElementById("income").value),
    debt: Number(document.getElementById("debt").value),
    savings: Number(document.getElementById("savings").value),
    rate: Number(document.getElementById("rate").value),
    years: Number(document.getElementById("years").value),
  };

  const hasInvalid = Object.values(values).some((value) => Number.isNaN(value) || value < 0);
  if (hasInvalid) {
    resultNote.textContent = "Please enter valid non-negative numbers in all fields.";
    return;
  }

  const result = calculateAffordablePrice(values);
  homePrice.textContent = currency.format(result.propertyPrice);
  loanAmount.textContent = `Loan estimate: ${currency.format(result.principal)}`;

  if (result.monthlyBudget < 900) {
    resultNote.textContent = "Your monthly cushion is tight. Consider reducing debts or extending your savings period.";
  } else if (values.savings < result.propertyPrice * 0.1) {
    resultNote.textContent = "Down payment may be below 10%. Look for state guarantees and first-buyer support options.";
  } else {
    resultNote.textContent = "You are in a balanced zone. Compare at least two lenders and keep an emergency reserve for 3-6 months.";
  }
}

function applyFilter(tag) {
  featureCards.forEach((card) => {
    const tags = card.dataset.tags.split(" ");
    const show = tag === "all" || tags.includes(tag);
    card.style.display = show ? "block" : "none";
  });
}

chips.forEach((chip) => {
  chip.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chip.click();
    }
  });

  chip.addEventListener("click", () => {
    chips.forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-selected", "false");
    });

    chip.classList.add("is-active");
    chip.setAttribute("aria-selected", "true");
    applyFilter(chip.dataset.filter);
  });
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
    }
  );

  revealItems.forEach((item, index) => {
    item.style.animationDelay = `${Math.min(index * 40, 280)}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => {
    item.classList.add("is-visible");
  });
}

budgetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  updateResults();
});

updateResults();
