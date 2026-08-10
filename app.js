/* =====================================================
   CASH FLOW
   ===================================================== */


/* =====================================================
   DEMO DATA

   This is temporary.

   Later this will be replaced by local storage.
   ===================================================== */

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


/* =====================================================
   SUGGESTIONS
   ===================================================== */

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


/* =====================================================
   ELEMENTS
   ===================================================== */

const modal =
    document.getElementById(
        "transactionModal"
    );

const amountInput =
    document.getElementById(
        "amountInput"
    );

const minusButton =
    document.getElementById(
        "minusButton"
    );

const plusButton =
    document.getElementById(
        "plusButton"
    );

const amountHint =
    document.getElementById(
        "amountHint"
    );


/* =====================================================
   UTILITIES
   ===================================================== */

function formatAmount(value) {

    const number =
        Math.abs(value).toLocaleString(
            "en-US",
            {
                maximumFractionDigits: 2
            }
        );

    if (value < 0) {
        return "−" + number;
    }

    return "+" + number;
}


function formatBalance(value) {

    const number =
        Math.abs(value).toLocaleString(
            "en-US",
            {
                maximumFractionDigits: 2
            }
        );

    if (value < 0) {
        return "−" + number;
    }

    return number;
}


function formatDate(date) {

    const parts =
        date.split("-");

    return (
        parts[2] +
        "/" +
        parts[1]
    );
}


function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent = text;

    return div.innerHTML;
}


/* =====================================================
   SIGN
   ===================================================== */

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

    amountHint.textContent =
        sign === -1
            ? "Debit selected"
            : "Credit selected";

    renderSuggestions();

    updateAmountAppearance();
}


/* =====================================================
   AMOUNT
   ===================================================== */

amountInput.addEventListener(
    "input",
    function () {

        let value =
            this.value.replace(
                /[^\d.]/g,
                ""
            );

        const parts =
            value.split(".");

        if (parts.length > 2) {

            value =
                parts[0] +
                "." +
                parts
                    .slice(1)
                    .join("");
        }

        if (!value) {

            this.value = "";

            this.classList.add(
                "placeholder"
            );

            updateAmountAppearance();

            return;
        }

        const number =
            Number(value);

        if (
            !Number.isFinite(number)
        ) {
            return;
        }

        this.value =
            number.toLocaleString(
                "en-US",
                {
                    maximumFractionDigits: 2
                }
            );

        this.classList.remove(
            "placeholder"
        );

        updateAmountAppearance();
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

            this.classList.add(
                "placeholder"
            );

            updateAmountAppearance();

            return;
        }

        const number =
            Number(
                this.value.replace(
                    /,/g,
                    ""
                )
            );

        if (
            Number.isFinite(number)
        ) {

            this.value =
                number.toLocaleString(
                    "en-US",
                    {
                        maximumFractionDigits: 2
                    }
                );
        }

        updateAmountAppearance();
    }
);


function updateAmountAppearance() {

    amountInput.classList.remove(
        "debit",
        "credit"
    );

    if (
        amountInput.value
    ) {

        amountInput.classList.add(
            transactionSign === -1
                ? "debit"
                : "credit"
        );
    }

    /*
     * The sign is displayed visually
     * inside the input by temporarily
     * using a CSS pseudo-like technique:
     *
     * Instead of modifying the actual
     * numeric value, we update the
     * placeholder when empty.
     *
     * For a typed amount, the sign is
     * represented by the +/- button
     * and color.
     *
     * The transaction list always shows
     * the explicit sign.
     */
}


/* =====================================================
   SUGGESTIONS
   ===================================================== */

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
        "categorySuggestions",
        categories,
        value => {

            document
                .getElementById(
                    "categoryInput"
                )
                .value = value;
        }
    );


    renderSuggestionList(
        "commentSuggestions",
        comments,
        value => {

            document
                .getElementById(
                    "commentInput"
                )
                .value = value;
        }
    );
}


function renderSuggestionList(
    elementId,
    values,
    callback
) {

    const box =
        document.getElementById(
            elementId
        );

    box.innerHTML = "";

    values.forEach(value => {

        const button =
            document.createElement(
                "button"
            );

        button.type = "button";

        button.className =
            "suggestion";

        button.textContent =
            value;

        button.addEventListener(
            "click",
            () => callback(value)
        );

        box.appendChild(button);
    });
}


/* =====================================================
   BALANCE CALCULATION
   ===================================================== */

function calculateBalances() {

    const sorted =
        [...transactions].sort(
            (a, b) => {

                const dateCompare =
                    a.date.localeCompare(
                        b.date
                    );

                if (
                    dateCompare !== 0
                ) {
                    return dateCompare;
                }

                /*
                 * Credits first on the
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
        transaction => {

            balance +=
                transaction.amount;

            transaction.balance =
                balance;
        }
    );


    return sorted;
}


/* =====================================================
   RENDER TRANSACTIONS
   ===================================================== */

function renderTransactions() {

    const list =
        document.getElementById(
            "transactionList"
        );

    list.innerHTML = "";


    const sorted =
        calculateBalances();


    /*
     * Newest first.
     */

    sorted.reverse();


    sorted.forEach(
        transaction => {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "transaction-wrap";


            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.className =
                "transaction-delete";

            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    deleteTransaction(
                        transaction.id
                    );
                }
            );


            const row =
                document.createElement(
                    "div"
                );

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
                    ${formatDate(
                        transaction.date
                    )}
                </div>

                <div class="transaction-comment">
                    ${escapeHtml(
                        transaction.comment || ""
                    )}
                </div>

                <div class="${amountClass}">
                    ${formatAmount(
                        transaction.amount
                    )}
                </div>

                <div class="${balanceClass}">
                    ${formatBalance(
                        transaction.balance
                    )}
                </div>
            `;


            row.addEventListener(
                "click",
                () => {

                    if (
                        row.classList.contains(
                            "swiped"
                        )
                    ) {

                        row.classList.remove(
                            "swiped"
                        );

                        row.style.transform =
                            "";

                        return;
                    }

                    openEditTransaction(
                        transaction.id
                    );
                }
            );


            addSwipeSupport(row);


            wrapper.appendChild(
                deleteButton
            );

            wrapper.appendChild(
                row
            );

            list.appendChild(
                wrapper
            );
        }
    );


    updateCurrentBalance();

    updateGraph(sorted);
}


/* =====================================================
   CURRENT BALANCE
   ===================================================== */

function updateCurrentBalance() {

    const element =
        document.getElementById(
            "currentBalance"
        );

    const sorted =
        calculateBalances();


    if (!sorted.length) {

        element.textContent =
            "0";

        element.classList.remove(
            "negative"
        );

        return;
    }


    const current =
        sorted[
            sorted.length - 1
        ].balance;


    element.textContent =
        formatBalance(current);


    element.classList.toggle(
        "negative",
        current < 0
    );
}


/* =====================================================
   GRAPH
   ===================================================== */

function updateGraph(sorted) {

    const positivePath =
        document.getElementById(
            "positiveGraph"
        );

    const negativePath =
        document.getElementById(
            "negativeGraph"
        );

    const dates =
        document.getElementById(
            "graphDates"
        );


    positivePath.setAttribute(
        "d",
        ""
    );

    negativePath.setAttribute(
        "d",
        ""
    );

    dates.innerHTML = "";


    if (!sorted.length) {
        return;
    }


    /*
     * Use each transaction's balance.
     *
     * This means the graph and the
     * transaction list use exactly
     * the same numbers.
     */

    const values =
        sorted.map(
            transaction =>
                transaction.balance
        );


    const maximum =
        Math.max(
            0,
            ...values
        );

    const minimum =
        Math.min(
            0,
            ...values
        );


    /*
     * Give the graph some breathing room.
     */

    const range =
        Math.max(
            1,
            maximum - minimum
        );


    const padding =
        range * 0.10;


    const top =
        maximum + padding;

    const bottom =
        minimum - padding;


    /*
     * SVG coordinates.
     *
     * 0 = top
     * 190 = bottom
     */

    function y(value) {

        return (
            (top - value) /
            (top - bottom)
        ) * 190;
    }


    function x(index) {

        if (
            sorted.length === 1
        ) {
            return 350;
        }

        return (
            index /
            (sorted.length - 1)
        ) * 700;
    }


    /*
     * Build separate positive and
     * negative paths.
     *
     * The paths are not filled.
     */

    let positive = "";
    let negative = "";


    sorted.forEach(
        (transaction, index) => {

            const value =
                transaction.balance;

            const px =
                x(index);

            const py =
                y(value);


            if (value >= 0) {

                positive +=
                    positive === ""
                        ? `M ${px} ${py}`
                        : ` L ${px} ${py}`;

            } else {

                negative +=
                    negative === ""
                        ? `M ${px} ${py}`
                        : ` L ${px} ${py}`;
            }
        }
    );


    positivePath.setAttribute(
        "d",
        positive
    );

    negativePath.setAttribute(
        "d",
        negative
    );


    /*
     * Scale labels.
     */

    const niceTop =
        Math.ceil(
            top / 1000
        ) * 1000;

    const niceMiddle =
        Math.round(
            niceTop / 2
        );

    const niceNegative =
        Math.floor(
            bottom / 1000
        ) * 1000;


    document.getElementById(
        "scaleTop"
    ).textContent =
        formatGraphNumber(
            niceTop
        );

    document.getElementById(
        "scaleMiddle"
    ).textContent =
        formatGraphNumber(
            niceMiddle
        );

    document.getElementById(
        "scaleNegative"
    ).textContent =
        formatGraphNumber(
            niceNegative
        );


    /*
     * Show up to six dates underneath.
     */

    const dateIndexes =
        getGraphDateIndexes(
            sorted.length
        );


    dateIndexes.forEach(
        index => {

            const span =
                document.createElement(
                    "span"
                );

            span.textContent =
                formatDate(
                    sorted[index].date
                );

            dates.appendChild(span);
        }
    );
}


function formatGraphNumber(value) {

    const absolute =
        Math.abs(value);

    if (
        absolute >= 1000
    ) {

        const thousands =
            absolute / 1000;

        return (
            value < 0
                ? "−"
                : ""
        ) +
        thousands +
        "k";
    }

    return String(value);
}


function getGraphDateIndexes(
    length
) {

    if (length <= 1) {
        return [0];
    }

    if (length <= 6) {

        return Array.from(
            {
                length
            },
            (_, index) =>
                index
        );
    }


    const indexes = [];

    const count = 6;

    for (
        let i = 0;
        i < count;
        i++
    ) {

        indexes.push(
            Math.round(
                i *
                (length - 1) /
                (count - 1)
            )
        );
    }

    return [
        ...new Set(indexes)
    ];
}


/* =====================================================
   ADD TRANSACTION
   ===================================================== */

function openAddTransaction() {

    editingId = null;


    document.getElementById(
        "formTitle"
    ).textContent =
        "Add Transaction";


    document.getElementById(
        "deleteEditButton"
    ).style.display =
        "none";


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    document.getElementById(
        "dateInput"
    ).value =
        today;


    amountInput.value =
        "";

    amountInput.placeholder =
        "−0";

    amountInput.classList.add(
        "placeholder"
    );


    document.getElementById(
        "commentInput"
    ).value =
        "";


    document.getElementById(
        "categoryInput"
    ).value =
        "";


    setSign(-1);


    modal.classList.add(
        "open"
    );


    setTimeout(
        () => amountInput.focus(),
        150
    );
}


/* =====================================================
   EDIT TRANSACTION
   ===================================================== */

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


    modal.classList.add(
        "open"
    );
}


/* =====================================================
   CLOSE FORM
   ===================================================== */

function closeTransactionForm() {

    modal.classList.remove(
        "open"
    );

    editingId = null;
}


/* =====================================================
   SAVE
   ===================================================== */

function saveTransaction() {

    const date =
        document.getElementById(
            "dateInput"
        ).value;


    const amountText =
        amountInput.value;


    const amount =
        Number(
            amountText.replace(
                /,/g,
                ""
            )
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


    if (
        editingId === null
    ) {

        transactions.push({

            id: nextId++,

            date,

            amount:
                signedAmount,

            comment,

            category

        });

    } else {

        const transaction =
            transactions.find(
                item =>
                    item.id ===
                    editingId
            );


        if (transaction) {

            transaction.date =
                date;

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


/* =====================================================
   DELETE
   ===================================================== */

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


function deleteEditingTransaction() {

    if (
        editingId === null
    ) {
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
                item.id !==
                editingId
        );


    closeTransactionForm();

    renderTransactions();
}


/* =====================================================
   SWIPE TO DELETE
   ===================================================== */

function addSwipeSupport(row) {

    let startX = 0;

    let currentX = 0;

    let dragging = false;


    row.addEventListener(
        "touchstart",
        event => {

            if (
                event.touches.length !== 1
            ) {
                return;
            }

            startX =
                event.touches[0]
                    .clientX;

            currentX =
                startX;

            dragging = true;

        },
        {
            passive: true
        }
    );


    row.addEventListener(
        "touchmove",
        event => {

            if (!dragging) {
                return;
            }


            currentX =
                event.touches[0]
                    .clientX;


            const distance =
                currentX - startX;


            if (
                distance < 0
            ) {

                const amount =
                    Math.max(
                        -78,
                        distance
                    );


                row.style.transition =
                    "none";


                row.style.transform =
                    `translateX(${amount}px)`;
            }


            else if (
                row.classList.contains(
                    "swiped"
                )
            ) {

                const amount =
                    Math.min(
                        0,
                        -78 + distance
                    );


                row.style.transition =
                    "none";


                row.style.transform =
                    `translateX(${amount}px)`;
            }

        },
        {
            passive: true
        }
    );


    row.addEventListener(
        "touchend",
        () => {

            if (!dragging) {
                return;
            }


            dragging = false;


            const distance =
                currentX - startX;


            row.style.transition =
                "transform .18s ease";


            if (
                distance < -40
            ) {

                closeAllSwipeRows(
                    row
                );


                row.classList.add(
                    "swiped"
                );


                row.style.transform =
                    "translateX(-78px)";


                return;
            }


            if (
                row.classList.contains(
                    "swiped"
                ) &&
                distance > 25
            ) {

                row.classList.remove(
                    "swiped"
                );


                row.style.transform =
                    "";


                return;
            }


            if (
                !row.classList.contains(
                    "swiped"
                )
            ) {

                row.style.transform =
                    "";
            }

        }
    );
}


function closeAllSwipeRows(
    except = null
) {

    document
        .querySelectorAll(
            ".transaction.swiped"
        )
        .forEach(row => {

            if (
                row !== except
            ) {

                row.classList.remove(
                    "swiped"
                );

                row.style.transform =
                    "";
            }
        });
}


document.addEventListener(
    "touchstart",
    event => {

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


/* =====================================================
   THEME
   ===================================================== */

document
    .getElementById("menuButton")
    .addEventListener(
        "click",
        () => {

            const menu =
                document.getElementById(
                    "themeMenu"
                );


            menu.style.display =
                menu.style.display ===
                    "block"
                    ? "none"
                    : "block";
        }
    );


document
    .querySelectorAll(
        "[data-theme]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                setTheme(
                    button.dataset.theme
                );
            }
        );
    });


function setTheme(theme) {

    if (
        theme === "light"
    ) {

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


    document.getElementById(
        "themeMenu"
    ).style.display =
        "none";
}


/* =====================================================
   BUTTON EVENTS
   ===================================================== */

document
    .getElementById("addButton")
    .addEventListener(
        "click",
        openAddTransaction
    );


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


document
    .getElementById("saveButton")
    .addEventListener(
        "click",
        saveTransaction
    );


document
    .getElementById("minusButton")
    .addEventListener(
        "click",
        () => setSign(-1)
    );


document
    .getElementById("plusButton")
    .addEventListener(
        "click",
        () => setSign(1)
    );


document
    .getElementById(
        "deleteEditButton"
    )
    .addEventListener(
        "click",
        deleteEditingTransaction
    );


/* =====================================================
   INITIALIZE
   ===================================================== */

renderSuggestions();

renderTransactions();
