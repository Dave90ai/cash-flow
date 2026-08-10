/* =========================================================
   CASH FLOW - app.js
   ========================================================= */

let transactions = [
    {
        id: 1,
        date: "2026-09-29",
        amount: -12000,
        category: "",
        comment: "Large payment"
    },
    {
        id: 2,
        date: "2026-09-02",
        amount: 8000,
        category: "Salary",
        comment: "Monthly salary"
    },
    {
        id: 3,
        date: "2026-08-20",
        amount: -1200,
        category: "Credit Card",
        comment: "Credit card"
    },
    {
        id: 4,
        date: "2026-08-20",
        amount: -3500,
        category: "Rent",
        comment: "Rent"
    },
    {
        id: 5,
        date: "2026-08-15",
        amount: 8000,
        category: "Salary",
        comment: "Monthly salary"
    },
    {
        id: 6,
        date: "2026-08-12",
        amount: -450,
        category: "Utilities",
        comment: "Electricity"
    },
    {
        id: 7,
        date: "2026-08-10",
        amount: -350,
        category: "Food",
        comment: "Supermarket"
    },
    {
        id: 8,
        date: "2026-08-10",
        amount: 8000,
        category: "Salary",
        comment: "Monthly salary"
    }
];

let nextId = 100;
let transactionSign = -1;
let editingId = null;


/* =========================================================
   SUGGESTIONS
   ========================================================= */

const debitCategories = [
    "Credit Card",
    "Rent",
    "Electricity",
    "Food",
    "Insurance",
    "Tax",
    "Utilities",
    "Other"
];

const debitComments = [
    "Credit card estimate",
    "Rent",
    "Electricity bill",
    "Supermarket",
    "Insurance",
    "Tax payment",
    "Monthly expenses",
    "Other"
];

const creditCategories = [
    "Salary",
    "Refund",
    "Interest",
    "Transfer",
    "Bonus",
    "Other"
];

const creditComments = [
    "Monthly salary",
    "Refund",
    "Interest",
    "Transfer",
    "Bonus",
    "Other"
];


/* =========================================================
   ELEMENTS
   ========================================================= */

const modal =
    document.getElementById("transactionModal");

const amountInput =
    document.getElementById("amountInput");

const minusButton =
    document.getElementById("minusButton");

const plusButton =
    document.getElementById("plusButton");


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function formatDate(date) {
    if (!date) return "";

    const parts = date.split("-");

    return parts[2] + "/" + parts[1];
}


function formatAmount(value) {

    const number = Math.abs(value).toLocaleString(
        "en-US",
        {
            maximumFractionDigits: 2
        }
    );

    return value < 0
        ? "−" + number
        : "+" + number;
}


function formatBalance(value) {

    const number = Math.abs(value).toLocaleString(
        "en-US",
        {
            maximumFractionDigits: 2
        }
    );

    return value < 0
        ? "−" + number
        : number;
}


function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text || "";

    return div.innerHTML;
}


function focusAmount() {

    setTimeout(function () {

        amountInput.focus();

        /*
         * Do not select the whole field if there is
         * already an amount. For a new transaction,
         * the empty field is ready for typing.
         */
        if (amountInput.value) {
            amountInput.select();
        }

    }, 100);
}


/* =========================================================
   SIGN BUTTONS
   ========================================================= */

function setSign(sign) {

    transactionSign = sign;

    minusButton.classList.toggle(
        "selected",
        sign === -1
    );

    plusButton.classList.toggle(
        "selected",
        sign === 1
    );

    const hint =
        document.getElementById("amountHint");

    if (hint) {
        hint.textContent =
            sign === -1
                ? "Debit selected"
                : "Credit selected";
    }

    renderSuggestions();
    updateAmountColor();
}


minusButton.addEventListener(
    "click",
    function () {
        setSign(-1);
    }
);


plusButton.addEventListener(
    "click",
    function () {
        setSign(1);
    }
);


/* =========================================================
   AMOUNT INPUT
   ========================================================= */

amountInput.addEventListener(
    "input",
    function () {

        const raw = this.value;

        // Allow the PC keyboard + and - keys
  //      if (raw.includes("-")) {
  //          setSign(-1);
  //      } else if (raw.includes("+")) {
  //          setSign(1);
  //      }

        let value =
            raw.replace(/[^\d.]/g, "");

        if (!value) {

            this.value = "";

            this.classList.add("placeholder");

            updateAmountColor();

            return;
        }

        const parts = value.split(".");

        if (parts.length > 2) {

            value =
                parts[0] +
                "." +
                parts.slice(1).join("");
        }

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return;
        }

        this.value =
            number.toLocaleString(
                "en-US",
                {
                    maximumFractionDigits: 2
                }
            );

        this.classList.remove("placeholder");

        updateAmountColor();
    }
);

amountInput.addEventListener(
    "focus",
    function () {

        if (this.value) {
            this.select();
        }
    }
);


amountInput.addEventListener(
    "blur",
    function () {

        if (!this.value) {

            this.classList.add("placeholder");

            updateAmountColor();

            return;
        }

        const number =
            Number(
                this.value.replace(/,/g, "")
            );

        if (Number.isFinite(number)) {

            this.value =
                number.toLocaleString(
                    "en-US",
                    {
                        maximumFractionDigits: 2
                    }
                );
        }

        updateAmountColor();
    }
);


function updateAmountColor() {

    amountInput.classList.remove(
        "debit",
        "credit"
    );

    if (!amountInput.value) {
        return;
    }

    amountInput.classList.add(
        transactionSign === -1
            ? "debit"
            : "credit"
    );
}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        /*
         * Only handle these keys while the
         * Add/Edit transaction window is open.
         */
        if (!modal || !modal.classList.contains("open")) {
            return;
        }


        /*
         * ESC = Cancel / close
         */
        if (event.key === "Escape") {

            event.preventDefault();

            closeTransactionForm();

            return;
        }


        /*
         * ENTER = Save
         *
         * Don't trigger it while clicking a
         * suggestion with the keyboard.
         */
        if (event.key === "Enter") {

            event.preventDefault();

            saveTransaction();

            return;
        }


        /*
         * Only interpret + and - when the
         * amount field is active.
         */
        if (
            document.activeElement === amountInput
        ) {

            /*
             * Minus key
             *
             * Handles:
             * -
             * numpad -
             */
            if (
                event.key === "-" ||
                event.code === "NumpadSubtract"
            ) {

                event.preventDefault();

                setSign(-1);

                return;
            }


            /*
             * Plus key
             *
             * Handles:
             * +
             * numpad +
             */
            if (
                event.key === "+" ||
                event.code === "NumpadAdd"
            ) {

                event.preventDefault();

                setSign(1);

                return;
            }
        }
    }
);


/* =========================================================
   SUGGESTION LISTS
   ========================================================= */

function renderSuggestions() {

    const categories =
        transactionSign === -1
            ? debitCategories
            : creditCategories;

    const comments =
        transactionSign === -1
            ? debitComments
            : creditComments;


    renderSuggestionList(
        "commentSuggestions",
        comments,
        "commentInput"
    );


    renderSuggestionList(
        "categorySuggestions",
        categories,
        "categoryInput"
    );
}


function renderSuggestionList(
    elementId,
    values,
    inputId
) {

    const box =
        document.getElementById(elementId);

    if (!box) return;

    box.innerHTML = "";

    values.forEach(value => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className = "suggestion";

        button.textContent = value;

        button.addEventListener(
            "click",
            function () {

                document.getElementById(
                    inputId
                ).value = value;
            }
        );

        box.appendChild(button);
    });
}


/* =========================================================
   BALANCE CALCULATION
   ========================================================= */

function getChronologicalTransactions() {

    const sorted =
        [...transactions].sort(
            function (a, b) {

                const dateCompare =
                    a.date.localeCompare(b.date);

                if (dateCompare !== 0) {
                    return dateCompare;
                }

                /*
                 * Credits before debits on the
                 * same date.
                 */
                if (
                    a.amount >= 0 &&
                    b.amount < 0
                ) {
                    return -1;
                }

                if (
                    a.amount < 0 &&
                    b.amount >= 0
                ) {
                    return 1;
                }

                return a.id - b.id;
            }
        );


    let balance = 0;


    sorted.forEach(
        function (transaction) {

            balance += transaction.amount;

            transaction.balance = balance;
        }
    );


    return sorted;
}


/* =========================================================
   TRANSACTION LIST
   ========================================================= */

function renderTransactions() {

    const list =
        document.getElementById(
            "transactionList"
        );

    if (!list) return;

    list.innerHTML = "";


    const chronological =
        getChronologicalTransactions();


    /*
     * Newest first in the transaction list.
     */
    const display =
        [...chronological].reverse();


    display.forEach(
        function (transaction) {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "transaction-wrap";


            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "transaction-delete";

            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    deleteTransaction(
                        transaction.id
                    );
                }
            );


            const row =
                document.createElement("div");

            row.className =
                "transaction";


            const amountClass =
                transaction.amount < 0
                    ? "transaction-amount debit"
                    : "transaction-amount credit";


            const balanceClass =
                transaction.balance < 0
                    ? "transaction-balance negative-balance"
                    : "transaction-balance";


            row.innerHTML = `
                <div class="transaction-date">
                    ${formatDate(transaction.date)}
                </div>

                <div class="transaction-comment">
                    ${escapeHtml(transaction.comment)}
                </div>

                <div class="${amountClass}">
                    ${formatAmount(transaction.amount)}
                </div>

                <div class="${balanceClass}">
                    ${formatBalance(transaction.balance)}
                </div>
            `;


            row.addEventListener(
                "click",
                function () {

                    if (
                        row.classList.contains("swiped")
                    ) {

                        closeSwipe(row);

                        return;
                    }

                    openEditTransaction(
                        transaction.id
                    );
                }
            );


            addSwipeSupport(row);


            wrapper.appendChild(deleteButton);

            wrapper.appendChild(row);

            list.appendChild(wrapper);
        }
    );


    updateCurrentBalance();

    updateGraph(chronological);
}


/* =========================================================
   BALANCE HEADER
   ========================================================= */

function updateCurrentBalance() {

    const balanceElement =
        document.getElementById(
            "currentBalance"
        );

    const label =
        document.querySelector(
            ".balance-label"
        );


    const sorted =
        getChronologicalTransactions();


    if (!sorted.length) {

        balanceElement.textContent = "0";

        balanceElement.classList.remove(
            "negative"
        );

        label.textContent =
            "balance for —";

        return;
    }


    const last =
        sorted[sorted.length - 1];


    balanceElement.textContent =
        formatBalance(last.balance);


    balanceElement.classList.toggle(
        "negative",
        last.balance < 0
    );


    label.textContent =
        "balance for " +
        formatDate(last.date);
}


/* =========================================================
   GRAPH
   ========================================================= */

function updateGraph(sorted) {

    const positive =
        document.getElementById(
            "positiveGraph"
        );

    const negative =
        document.getElementById(
            "negativeGraph"
        );

    const dates =
        document.getElementById(
            "graphDates"
        );


    positive.setAttribute("d", "");

    negative.setAttribute("d", "");

    dates.innerHTML = "";


    /*
     * Remove old dots.
     */
    document
        .querySelectorAll(".balance-dot")
        .forEach(
            dot => dot.remove()
        );


    if (!sorted.length) {
        return;
    }


    const values =
        sorted.map(
            transaction =>
                transaction.balance
        );


    const highest =
        Math.max(
            0,
            ...values
        );


    const lowest =
        Math.min(
            0,
            ...values
        );


    const range =
        Math.max(
            1,
            highest - lowest
        );


    const padding =
        range * 0.12;


    const top =
        highest + padding;


    const bottom =
        lowest - padding;


    function x(index) {

        if (sorted.length === 1) {
            return 350;
        }

        return (
            index /
            (sorted.length - 1)
        ) * 700;
    }


    function y(value) {

        return (
            (top - value) /
            (top - bottom)
        ) * 190;
    }


    let positivePath = "";
    let negativePath = "";


    for (
        let i = 0;
        i < sorted.length - 1;
        i++
    ) {

        const v1 =
            sorted[i].balance;

        const v2 =
            sorted[i + 1].balance;


        const x1 = x(i);
        const y1 = y(v1);

        const x2 = x(i + 1);
        const y2 = y(v2);


        /*
         * Entire segment is green.
         */
        if (
            v1 >= 0 &&
            v2 >= 0
        ) {

            positivePath +=
                `M ${x1} ${y1} L ${x2} ${y2} `;

            continue;
        }


        /*
         * Entire segment is red.
         */
        if (
            v1 < 0 &&
            v2 < 0
        ) {

            negativePath +=
                `M ${x1} ${y1} L ${x2} ${y2} `;

            continue;
        }


        /*
         * Segment crosses zero.
         */

        const fraction =
            Math.abs(v1) /
            (
                Math.abs(v1) +
                Math.abs(v2)
            );


        const crossX =
            x1 +
            (x2 - x1) *
            fraction;


        const crossY =
            y(0);


        if (v1 >= 0) {

            positivePath +=
                `M ${x1} ${y1} L ${crossX} ${crossY} `;

            negativePath +=
                `M ${crossX} ${crossY} L ${x2} ${y2} `;

        } else {

            negativePath +=
                `M ${x1} ${y1} L ${crossX} ${crossY} `;

            positivePath +=
                `M ${crossX} ${crossY} L ${x2} ${y2} `;
        }
    }


    /*
     * One transaction.
     */
    if (sorted.length === 1) {

        const px = x(0);
        const py = y(sorted[0].balance);

        if (sorted[0].balance >= 0) {

            positivePath =
                `M ${px} ${py}`;

        } else {

            negativePath =
                `M ${px} ${py}`;
        }
    }


    positive.setAttribute(
        "d",
        positivePath
    );

    negative.setAttribute(
        "d",
        negativePath
    );


    /*
     * Draw the balance dots.
     */
    drawBalanceDots(
        sorted,
        x,
        y
    );


/*
 * Position the zero line according to the
 * actual graph scale.
 */
const zeroLine =
    document.querySelector(".zero-line");

if (zeroLine) {

    const zeroPosition =
        (top / (top - bottom)) * 100;

    zeroLine.style.top =
        zeroPosition + "%";
}
   
   
/*
 * Y-axis labels
 *
 * These use exactly the same scale as
 * the graph itself.
 */

const scaleTop =
    document.getElementById("scaleTop");

const scaleMiddle =
    document.getElementById("scaleMiddle");

const scaleZero =
    document.querySelector(".scale-zero");

const scaleNegative =
    document.getElementById("scaleNegative");


/*
 * Convert a graph value to a percentage
 * of the graph height.
 */
function graphPercent(value) {

    return (
        (top - value) /
        (top - bottom)
    ) * 100;
}


/*
 * Top value
 */
scaleTop.textContent =
    formatGraphScale(top);

scaleTop.style.top =
    graphPercent(top) + "%";

scaleTop.style.transform =
    "translateY(-50%)";


/*
 * Middle value
 *
 * The middle of the actual graph range,
 * rather than simply top / 2.
 */
const middleValue =
    (top + bottom) / 2;

scaleMiddle.textContent =
    formatGraphScale(middleValue);

scaleMiddle.style.top =
    graphPercent(middleValue) + "%";

scaleMiddle.style.transform =
    "translateY(-50%)";


/*
 * Zero
 */
scaleZero.style.top =
    graphPercent(0) + "%";

scaleZero.style.transform =
    "translateY(-50%)";


/*
 * Bottom value
 */
scaleNegative.textContent =
    formatGraphScale(bottom);

scaleNegative.style.top =
    graphPercent(bottom) + "%";

scaleNegative.style.transform =
    "translateY(-50%)";

    /*
     * Dates are explicitly oldest → newest.
     */
    const indexes =
        getDateIndexes(sorted.length);


    indexes.forEach(
        function (index) {

            const span =
                document.createElement("span");

            span.textContent =
                formatDate(
                    sorted[index].date
                );

            dates.appendChild(span);
        }
    );
}


/* =========================================================
   GRAPH DOTS
   ========================================================= */

function drawBalanceDots(
    sorted,
    x,
    y
) {

    const svg =
        document.getElementById(
            "balanceGraph"
        );


    sorted.forEach(
        function (transaction, index) {

            const circle =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "circle"
                );


            circle.classList.add(
                "balance-dot"
            );


            circle.setAttribute(
                "cx",
                x(index)
            );


            circle.setAttribute(
                "cy",
                y(transaction.balance)
            );


            circle.setAttribute(
                "r",
                "3.5"
            );


            circle.setAttribute(
                "fill",
                transaction.balance < 0
                    ? "#ff453a"
                    : "#45d483"
            );


            circle.setAttribute(
                "stroke",
                "#171717"
            );


            circle.setAttribute(
                "stroke-width",
                "1.5"
            );


            svg.appendChild(circle);
        }
    );
}


/* =========================================================
   GRAPH HELPERS
   ========================================================= */

function formatGraphScale(value) {

    const rounded =
        Math.round(value);


    const absolute =
        Math.abs(rounded);


    if (absolute >= 1000) {

        let result =
            (absolute / 1000)
                .toFixed(
                    absolute % 1000 === 0
                        ? 0
                        : 1
                );


        result += "k";


        return rounded < 0
            ? "−" + result
            : result;
    }


    return String(rounded);
}


function getDateIndexes(length) {

    if (length <= 1) {
        return [0];
    }


    if (length <= 5) {

        return Array.from(
            { length },
            (_, i) => i
        );
    }


    const result = [];

    const count = 5;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        result.push(
            Math.round(
                i *
                (length - 1) /
                (count - 1)
            )
        );
    }


    return [
        ...new Set(result)
    ];
}


/* =========================================================
   ADD TRANSACTION
   ========================================================= */

function openAddTransaction() {

    editingId = null;


    const title =
        document.getElementById(
            "formTitle"
        );

    if (title) {
        title.textContent =
            "Add Transaction";
    }


    const deleteButton =
        document.getElementById(
            "deleteEditButton"
        );

    if (deleteButton) {
        deleteButton.style.display =
            "none";
    }


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    document.getElementById(
        "dateInput"
    ).value = today;


    amountInput.value = "";

    amountInput.placeholder = "−0";

    amountInput.classList.add(
        "placeholder"
    );


    document.getElementById(
        "commentInput"
    ).value = "";


    document.getElementById(
        "categoryInput"
    ).value = "";


    setSign(-1);


    if (modal) {

        modal.classList.add("open");
    }


   focusAmount();
 //   setTimeout(
 //       function () {
 //           amountInput.focus();
 //       },
 //       100
 //   );
}


/* =========================================================
   EDIT TRANSACTION
   ========================================================= */

function openEditTransaction(id) {

    closeAllSwipeRows();


    const transaction =
        transactions.find(
            item =>
                item.id === id
        );


    if (!transaction) {
        return;
    }


    editingId = id;


    document.getElementById(
        "formTitle"
    ).textContent =
        "Edit Transaction";


    document.getElementById(
        "deleteEditButton"
    ).style.display =
        "block";


    document.getElementById(
        "dateInput"
    ).value =
        transaction.date;


    amountInput.value =
        Math.abs(
            transaction.amount
        ).toLocaleString(
            "en-US",
            {
                maximumFractionDigits: 2
            }
        );


    amountInput.classList.remove(
        "placeholder"
    );


    document.getElementById(
        "commentInput"
    ).value =
        transaction.comment || "";


    document.getElementById(
        "categoryInput"
    ).value =
        transaction.category || "";


    setSign(
        transaction.amount < 0
            ? -1
            : 1
    );


    if (modal) {
        modal.classList.add("open");
    }

   focusAmount();
}


/* =========================================================
   CLOSE TRANSACTION WINDOW
   ========================================================= */

function closeTransactionForm() {

    if (modal) {
        modal.classList.remove("open");
    }

    editingId = null;
}


document
    .getElementById("closeButton")
    .addEventListener(
        "click",
        closeTransactionForm
    );


document
    .getElementById("cancelButton")
    .addEventListener(
        "click",
        closeTransactionForm
    );


/* =========================================================
   SAVE TRANSACTION
   ========================================================= */

document
    .getElementById("saveButton")
    .addEventListener(
        "click",
        saveTransaction
    );


function saveTransaction() {

    const date =
        document.getElementById(
            "dateInput"
        ).value;


    const amount =
        Number(
            amountInput.value
                .replace(/,/g, "")
        );


    const comment =
        document.getElementById(
            "commentInput"
        ).value.trim();


    const category =
        document.getElementById(
            "categoryInput"
        ).value.trim();


    if (!date) {

        document.getElementById(
            "dateInput"
        ).focus();

        return;
    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        amountInput.focus();

        return;
    }


    const signedAmount =
        amount * transactionSign;


    if (editingId === null) {

        transactions.push({

            id: nextId++,

            date: date,

            amount: signedAmount,

            comment: comment,

            category: category
        });

    } else {

        const transaction =
            transactions.find(
                item =>
                    item.id === editingId
            );


        if (transaction) {

            transaction.date = date;

            transaction.amount =
                signedAmount;

            transaction.comment =
                comment;

            transaction.category =
                category;
        }
    }


    closeTransactionForm();

    renderTransactions();
}


/* =========================================================
   DELETE
   ========================================================= */

function deleteTransaction(id) {

    if (
        !confirm(
            "Delete this transaction?"
        )
    ) {

        closeAllSwipeRows();

        return;
    }


    transactions =
        transactions.filter(
            item =>
                item.id !== id
        );


    renderTransactions();
}


document
    .getElementById("deleteEditButton")
    .addEventListener(
        "click",
        deleteEditingTransaction
    );


function deleteEditingTransaction() {

    if (editingId === null) {
        return;
    }


    if (
        !confirm(
            "Delete this transaction?"
        )
    ) {
        return;
    }


    transactions =
        transactions.filter(
            item =>
                item.id !== editingId
        );


    closeTransactionForm();

    renderTransactions();
}


/* =========================================================
   SWIPE TO DELETE
   ========================================================= */

function addSwipeSupport(row) {

    let startX = 0;
    let currentX = 0;
    let moving = false;


    row.addEventListener(
        "touchstart",
        function (event) {

            if (
                event.touches.length !== 1
            ) {
                return;
            }


            startX =
                event.touches[0].clientX;

            currentX = startX;

            moving = true;
        },
        {
            passive: true
        }
    );


    row.addEventListener(
        "touchmove",
        function (event) {

            if (!moving) {
                return;
            }


            currentX =
                event.touches[0].clientX;


            const distance =
                currentX - startX;


            if (distance < 0) {

                const move =
                    Math.max(
                        -78,
                        distance
                    );


                row.style.transition =
                    "none";


                row.style.transform =
                    `translateX(${move}px)`;
            }
        },
        {
            passive: true
        }
    );


    row.addEventListener(
        "touchend",
        function () {

            if (!moving) {
                return;
            }


            moving = false;


            const distance =
                currentX - startX;


            row.style.transition =
                "transform .18s ease";


            if (distance < -40) {

                closeAllSwipeRows(row);

                row.classList.add(
                    "swiped"
                );

                row.style.transform =
                    "translateX(-78px)";

            } else {

                row.style.transform =
                    "";
            }
        }
    );
}


function closeSwipe(row) {

    row.classList.remove(
        "swiped"
    );

    row.style.transform =
        "";
}


function closeAllSwipeRows(except = null) {

    document
        .querySelectorAll(
            ".transaction.swiped"
        )
        .forEach(
            function (row) {

                if (row !== except) {
                    closeSwipe(row);
                }
            }
        );
}


document.addEventListener(
    "touchstart",
    function (event) {

        const openRow =
            document.querySelector(
                ".transaction.swiped"
            );


        if (!openRow) {
            return;
        }


        if (
            openRow.contains(
                event.target
            )
        ) {
            return;
        }


        closeAllSwipeRows();
    },
    {
        passive: true
    }
);


/* =========================================================
   THEME MENU
   ========================================================= */

const menuButton =
    document.getElementById(
        "menuButton"
    );


const themeMenu =
    document.getElementById(
        "themeMenu"
    );


if (menuButton && themeMenu) {

    menuButton.addEventListener(
        "click",
        function () {

            themeMenu.style.display =
                themeMenu.style.display === "block"
                    ? "none"
                    : "block";
        }
    );
}


document
    .querySelectorAll("[data-theme]")
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    setTheme(
                        button.dataset.theme
                    );
                }
            );
        }
    );


function setTheme(theme) {

    if (theme === "light") {

        document.body.style.setProperty(
            "--bg",
            "#f5f5f7"
        );

        document.body.style.setProperty(
            "--card",
            "#ffffff"
        );

        document.body.style.setProperty(
            "--field",
            "#f0f0f2"
        );

        document.body.style.setProperty(
            "--text",
            "#1d1d1f"
        );

        document.body.style.setProperty(
            "--secondary",
            "#777"
        );

        document.body.style.setProperty(
            "--border",
            "#dedee2"
        );

        document.body.style.setProperty(
            "--button",
            "#111"
        );

        document.body.style.setProperty(
            "--button-text",
            "#fff"
        );

    } else {

        document.body.style.setProperty(
            "--bg",
            "#000"
        );

        document.body.style.setProperty(
            "--card",
            "#171717"
        );

        document.body.style.setProperty(
            "--field",
            "#222"
        );

        document.body.style.setProperty(
            "--text",
            "#f5f5f7"
        );

        document.body.style.setProperty(
            "--secondary",
            "#999"
        );

        document.body.style.setProperty(
            "--border",
            "#303030"
        );

        document.body.style.setProperty(
            "--button",
            "#f5f5f7"
        );

        document.body.style.setProperty(
            "--button-text",
            "#000"
        );
    }


    if (themeMenu) {
        themeMenu.style.display =
            "none";
    }
}


/* =========================================================
   ADD BUTTON
   ========================================================= */

/*
 * The existing page may have the Add button
 * elsewhere in index.html.
 *
 * If it has id="addButton", connect it.
 */

const addButton =
    document.getElementById(
        "addButton"
    );


if (addButton) {

    addButton.addEventListener(
        "click",
        openAddTransaction
    );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

renderSuggestions();

renderTransactions();
