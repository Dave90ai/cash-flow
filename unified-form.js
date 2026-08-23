/* =========================================================
   CASH FLOW - unified-form.js

   Unified Add/Edit screen for:
   - Transaction
   - Adjust

   This file is loaded after:
   app.js
   accounts.js
   adjust.js
   starting-balance.js

   It deliberately leaves the existing calculation,
   account and Adjust architecture intact.
   ========================================================= */


let unifiedMode = "transaction";
let unifiedEditingId = null;


/* =========================================================
   HELPERS
   ========================================================= */

function unifiedGetDate() {

    return document
        .getElementById("dateInput")
        .value;

}


function unifiedGetAmount() {

    const input =
        document.getElementById(
            "amountInput"
        );

    return Number(
        input.value
            .replace(/,/g, "")
            .trim()
    );

}


function unifiedToday() {

    return new Date()
        .toISOString()
        .split("T")[0];

}


/* =========================================================
   TYPE SELECTOR
   ========================================================= */

function createUnifiedTypeSelector() {

    const modal =
        document.getElementById(
            "transactionModal"
        );

    if (!modal) {
        return;
    }


    if (
        document.getElementById(
            "entryTypeSelector"
        )
    ) {
        return;
    }


    const header =
        modal.querySelector(
            ".form-header"
        );

    if (!header) {
        return;
    }


    const selector =
        document.createElement(
            "div"
        );

    selector.id =
        "entryTypeSelector";

    selector.className =
        "entry-type-selector";


    selector.innerHTML = `

        <button
            type="button"
            class="entry-type-button active"
            id="transactionTypeButton">
            Transaction
        </button>

        <button
            type="button"
            class="entry-type-button"
            id="adjustTypeButton">
            Adjust
        </button>

    `;


    header.insertAdjacentElement(
        "afterend",
        selector
    );


    document
        .getElementById(
            "transactionTypeButton"
        )
        .addEventListener(
            "click",
            function () {

                setUnifiedMode(
                    "transaction"
                );

            }
        );


    document
        .getElementById(
            "adjustTypeButton"
        )
        .addEventListener(
            "click",
            function () {

                setUnifiedMode(
                    "adjust"
                );

            }
        );

}


/* =========================================================
   MODE
   ========================================================= */

function setUnifiedMode(mode) {

    unifiedMode =
        mode;


    const transactionButton =
        document.getElementById(
            "transactionTypeButton"
        );

    const adjustButton =
        document.getElementById(
            "adjustTypeButton"
        );


    if (transactionButton) {

        transactionButton.classList.toggle(
            "active",
            mode === "transaction"
        );

    }


    if (adjustButton) {

        adjustButton.classList.toggle(
            "active",
            mode === "adjust"
        );

    }


    const title =
        document.getElementById(
            "formTitle"
        );


    const amountLabel =
        document.querySelector(
            'label[for="amountInput"]'
        );


    const hint =
        document.getElementById(
            "amountHint"
        );


    const commentField =
        document
            .getElementById(
                "commentInput"
            )
            ?.closest(
                ".field"
            );


    const categoryField =
        document
            .getElementById(
                "categoryInput"
            )
            ?.closest(
                ".field"
            );


    const modal =
        document.getElementById(
            "transactionModal"
        );


    if (mode === "adjust") {

        modal.classList.add(
            "unified-adjust-mode"
        );


        if (title) {

            title.textContent =
                unifiedEditingId === null
                    ? "Add Adjust"
                    : "Edit Adjust";

        }


        if (amountLabel) {

            amountLabel.textContent =
                "Account balance";

        }


        if (hint) {

            hint.textContent =
                "This sets the account balance at the end of this date.";

            hint.classList.add(
                "adjust-form-hint"
            );

        }

         
         if (commentField) {
         
             commentField.style.visibility =
                 "hidden";
         
             commentField.style.pointerEvents =
                 "none";
         }
         
         
         if (categoryField) {
         
             categoryField.style.visibility =
                 "hidden";
         
             categoryField.style.pointerEvents =
                 "none";
         }

        updateUnifiedAdjustColor();


    } else {

        modal.classList.remove(
            "unified-adjust-mode"
        );


        if (title) {

            title.textContent =
                unifiedEditingId === null
                    ? "Add Transaction"
                    : "Edit Transaction";

        }


        if (amountLabel) {

            amountLabel.textContent =
                "Amount";

        }


        if (hint) {

            hint.classList.remove(
                "adjust-form-hint"
            );

            hint.textContent =
                transactionSign === -1
                    ? "Debit selected"
                    : "Credit selected";

        }

         
         if (commentField) {
         
             commentField.style.visibility =
                 "";
         
             commentField.style.pointerEvents =
                 "";
         }
         
         
         if (categoryField) {
         
             categoryField.style.visibility =
                 "";
         
             categoryField.style.pointerEvents =
                 "";
         }

        updateAmountColor();

    }

}


/* =========================================================
   ADJUST FORM COLOR
   ========================================================= */

function updateUnifiedAdjustColor() {

    const input =
        document.getElementById(
            "amountInput"
        );

    if (!input) {
        return;
    }


    input.classList.remove(
        "debit",
        "credit"
    );


    if (unifiedMode === "adjust") {

        input.classList.add(
            "adjust-form-amount"
        );

    } else {

        input.classList.remove(
            "adjust-form-amount"
        );

    }

}


/* =========================================================
   OPEN ADD
   ========================================================= */

const originalOpenAddTransaction =
    openAddTransaction;


openAddTransaction =
    function () {

        unifiedEditingId =
            null;

        /*
         * The main + button always starts
         * with a new normal transaction.
         */
        unifiedMode =
            "transaction";

        originalOpenAddTransaction();

        /*
         * Force the unified form back to
         * Transaction after the original
         * form has opened.
         */
        setUnifiedMode(
            "transaction"
        );

    };

/* =========================================================
   OPEN EDIT TRANSACTION
   ========================================================= */

const originalOpenEditTransaction =
    openEditTransaction;


openEditTransaction =
    function (id) {

        const transaction =
            transactions.find(
                item =>
                    item.id === id
            );


        if (!transaction) {
            return;
        }


        unifiedEditingId =
            id;


        originalOpenEditTransaction(
            id
        );


        setUnifiedMode(
            "transaction"
        );

    };


/* =========================================================
   OPEN EDIT ADJUST

   adjust.js calls this function when an Adjust row
   is selected.
   ========================================================= */

openEditAdjust =
    function (id) {

        const transaction =
            transactions.find(
                item =>
                    item.id === id
            );


        if (
            !transaction ||
            !isAdjust(transaction)
        ) {
            return;
        }


        unifiedEditingId =
            id;


        /*
         * We intentionally don't call the old
         * Adjust modal.
         *
         * We use the normal transaction modal.
         */

        const title =
            document.getElementById(
                "formTitle"
            );

        if (title) {

            title.textContent =
                "Edit Adjust";

        }


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
                getAdjustBalance(
                    transaction
                )
            ).toLocaleString(
                "en-US",
                {
                    maximumFractionDigits: 2
                }
            );


        amountInput.classList.remove(
            "placeholder"
        );


        setSign(
            getAdjustBalance(
                transaction
            ) < 0
                ? -1
                : 1
        );


        /*
         * Empty the normal transaction fields.
         */
        document.getElementById(
            "commentInput"
        ).value = "";


        document.getElementById(
            "categoryInput"
        ).value = "";


        const modal =
            document.getElementById(
                "transactionModal"
            );


        modal.classList.add(
            "open"
        );


        setUnifiedMode(
            "adjust"
        );


        setTimeout(
            function () {

                amountInput.focus();
                amountInput.select();

            },
            100
        );

    };


/* =========================================================
   ADD ADJUST

   Kept as a compatibility function in case another part
   of the application calls openAddAdjust().
   ========================================================= */

openAddAdjust =
    function () {

        unifiedEditingId =
            null;


        const today =
            unifiedToday();


        document.getElementById(
            "dateInput"
        ).value =
            today;


        const balance =
            getAccountBalance(
                getCurrentAccount()
            );


        amountInput.value =
            Math.abs(balance)
                .toLocaleString(
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
        ).value = "";


        document.getElementById(
            "categoryInput"
        ).value = "";


        document.getElementById(
            "deleteEditButton"
        ).style.display =
            "none";


        setSign(
            balance < 0
                ? -1
                : 1
        );


        const modal =
            document.getElementById(
                "transactionModal"
            );


        modal.classList.add(
            "open"
        );


        setUnifiedMode(
            "adjust"
        );


        setTimeout(
            function () {

                amountInput.focus();
                amountInput.select();

            },
            100
        );

    };


/* =========================================================
   UNIFIED SAVE
   ========================================================= */

function saveUnifiedForm() {

    const date =
        unifiedGetDate();


    const amount =
        unifiedGetAmount();


    if (!date) {

        document
            .getElementById(
                "dateInput"
            )
            .focus();

        return;

    }


    if (
        !Number.isFinite(amount) ||
        amount < 0
    ) {

        amountInput.focus();

        return;

    }


    /*
     * ADJUST
     */

    if (
        unifiedMode ===
        "adjust"
    ) {

        /*
         * Zero is a valid account balance.
         */
        const balance =
            amount *
            transactionSign;


        const existing =
            transactions.find(
                transaction =>
                    isAdjust(
                        transaction
                    ) &&
                    transaction.date ===
                        date &&
                    transaction.id !==
                        unifiedEditingId
            );


        /*
         * Adding an Adjust to a date that
         * already has one updates the
         * existing Adjust.
         */
        if (
            existing &&
            unifiedEditingId === null
        ) {

            existing.adjustBalance =
                balance;


        } else if (
            unifiedEditingId === null
        ) {

            transactions.push({

                id:
                    getNextTransactionId(),

                type:
                    "adjust",

                date:
                    date,

                amount:
                    0,

                adjustBalance:
                    balance,

                comment:
                    "Adjust",

                category:
                    ""

            });


        } else {

            const transaction =
                transactions.find(
                    item =>
                        item.id ===
                        unifiedEditingId
                );


            if (transaction) {

                transaction.date =
                    date;

                transaction.type =
                    "adjust";

                transaction.amount =
                    0;

                transaction.adjustBalance =
                    balance;

                transaction.comment =
                    "Adjust";

                transaction.category =
                    "";

            }

        }


        closeUnifiedForm();

        renderTransactions();

        window.scrollTo(
            0,
            0
        );

        return;

    }


    /*
     * NORMAL TRANSACTION
     */

    if (
        amount <= 0
    ) {

        amountInput.focus();

        return;

    }


    const comment =
        document
            .getElementById(
                "commentInput"
            )
            .value
            .trim();


    const category =
        document
            .getElementById(
                "categoryInput"
            )
            .value
            .trim();


    const signedAmount =
        amount *
        transactionSign;


    if (
        unifiedEditingId === null
    ) {

        transactions.push({

            id:
                nextId++,

            date:
                date,

            amount:
                signedAmount,

            comment:
                comment,

            category:
                category

        });


    } else {

        const transaction =
            transactions.find(
                item =>
                    item.id ===
                    unifiedEditingId
            );


        if (transaction) {

            /*
             * If an Adjust was changed back
             * to Transaction, remove its
             * Adjust-specific fields.
             */
            delete transaction.type;
            delete transaction.adjustBalance;


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


    closeUnifiedForm();

    renderTransactions();

    window.scrollTo(
        0,
        0
    );

}


/* =========================================================
   CLOSE
   ========================================================= */

function closeUnifiedForm() {

    const modal =
        document.getElementById(
            "transactionModal"
        );


    if (modal) {

        modal.classList.remove(
            "open"
        );

        modal.classList.remove(
            "unified-adjust-mode"
        );

    }


    unifiedEditingId =
        null;

    editingId =
        null;

}


/* =========================================================
   SAVE BUTTON

   Use capture phase so the original app.js save handler
   doesn't save a second time.
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const saveButton =
            event.target.closest(
                "#saveButton"
            );


        if (!saveButton) {
            return;
        }


        const modal =
            document.getElementById(
                "transactionModal"
            );


        if (
            !modal ||
            !modal.classList.contains(
                "open"
            )
        ) {
            return;
        }


        event.preventDefault();
        event.stopImmediatePropagation();


        saveUnifiedForm();

    },
    true
);


/* =========================================================
   DELETE

   For Adjust, use Adjust deletion.
   For normal transactions, use the existing deletion.
   ========================================================= */

document
    .getElementById(
        "deleteEditButton"
    )
    .addEventListener(
        "click",
        function (event) {

            if (
                unifiedMode !==
                "adjust"
            ) {
                return;
            }


            event.preventDefault();
            event.stopImmediatePropagation();


            if (
                unifiedEditingId ===
                null
            ) {
                return;
            }


            if (
                !confirm(
                    "Delete this Adjust?"
                )
            ) {
                return;
            }


            transactions =
                transactions.filter(
                    transaction =>
                        transaction.id !==
                        unifiedEditingId
                );


            closeUnifiedForm();

            renderTransactions();

            window.scrollTo(
                0,
                0
            );

        }
    );


/* =========================================================
   CLOSE BUTTON / CANCEL
   ========================================================= */

document
    .getElementById(
        "closeButton"
    )
    .addEventListener(
        "click",
        function () {

            unifiedEditingId =
                null;

        }
    );


document
    .getElementById(
        "cancelButton"
    )
    .addEventListener(
        "click",
        function () {

            unifiedEditingId =
                null;

        }
    );


/* =========================================================
   ENTER KEY

   Intercept before app.js's old Enter handler.
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        const modal =
            document.getElementById(
                "transactionModal"
            );


        if (
            !modal ||
            !modal.classList.contains(
                "open"
            )
        ) {
            return;
        }


        if (
            event.key !==
            "Enter"
        ) {
            return;
        }


        event.preventDefault();
        event.stopImmediatePropagation();


        saveUnifiedForm();

    },
    true
);


/* =========================================================
   MAIN SCREEN PLUS BUTTON
   ========================================================= */

function updateUnifiedAddButton() {

    const button =
        document.getElementById(
            "addButton"
        );


    if (!button) {
        return;
    }


    button.style.display =
        allAccountsMode
            ? "none"
            : "flex";

}


/*
 * Hide the old Step 2 action bar and
 * the old dynamically-created Adjust modal.
 */

const oldActionBar =
    document.getElementById(
        "accountActionBar"
    );

if (oldActionBar) {

    oldActionBar.remove();

}


const oldAdjustModal =
    document.getElementById(
        "adjustModal"
    );

if (oldAdjustModal) {

    oldAdjustModal.remove();

}


/* =========================================================
   ACCOUNT NAVIGATION HOOKS
   ========================================================= */

const unifiedOriginalSwitchAccount =
    switchAccount;


switchAccount =
    function (accountId) {

        unifiedOriginalSwitchAccount(
            accountId
        );

        updateUnifiedAddButton();

    };


const unifiedOriginalShowAllAccounts =
    showAllAccounts;


showAllAccounts =
    function () {

        unifiedOriginalShowAllAccounts();

        updateUnifiedAddButton();

    };


/* =========================================================
   INITIALIZE
   ========================================================= */

createUnifiedTypeSelector();

updateUnifiedAddButton();

setUnifiedMode(
    "transaction"
);

const mainAddButton =
    document.getElementById(
        "addButton"
    );

if (mainAddButton) {

    /*
     * The main + button always starts
     * a NEW Transaction.
     *
     * This listener uses capture=true,
     * so it runs before the original
     * app.js click handler.
     */
    mainAddButton.addEventListener(
        "click",
        function () {

            unifiedEditingId =
                null;

            unifiedMode =
                "transaction";

            setUnifiedMode(
                "transaction"
            );

        },
        true
    );

}
}
