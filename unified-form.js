/* =========================================================
   CASH FLOW - unified-form.js

   One Add/Edit form for:

   - Transaction
   - Adjust
   ========================================================= */

let unifiedMode =
    "transaction";

let unifiedEditingId =
    null;


/* =========================================================
   HELPERS
   ========================================================= */

function unifiedToday() {

    return new Date()
        .toISOString()
        .split("T")[0];
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


    const modal =
        document.getElementById(
            "transactionModal"
        );

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
        document.getElementById(
            "commentInput"
        )?.closest(
            ".field"
        );


    const categoryField =
        document.getElementById(
            "categoryInput"
        )?.closest(
            ".field"
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


        /*
         * Preserve the layout height.
         *
         * Do NOT use display:none.
         */
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


        updateUnifiedAmountColor();


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


        updateUnifiedAmountColor();
    }
}


/* =========================================================
   AMOUNT COLOR
   ========================================================= */

function updateUnifiedAmountColor() {

    const input =
        document.getElementById(
            "amountInput"
        );

    if (!input) {
        return;
    }


    input.classList.remove(
        "debit",
        "credit",
        "adjust-form-amount"
    );


    if (
        unifiedMode === "adjust"
    ) {

        input.classList.add(
            "adjust-form-amount"
        );

    } else {

        input.classList.add(
            transactionSign === -1
                ? "debit"
                : "credit"
        );
    }
}


/* =========================================================
   OPEN NEW TRANSACTION
   ========================================================= */

function openAddTransaction() {

    unifiedEditingId =
        null;


    setUnifiedMode(
        "transaction"
    );


    document.getElementById(
        "formTitle"
    ).textContent =
        "Add Transaction";


    document.getElementById(
        "deleteEditButton"
    ).style.display =
        "none";


    document.getElementById(
        "dateInput"
    ).value =
        unifiedToday();


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


    const modal =
        document.getElementById(
            "transactionModal"
        );

    modal.classList.add(
        "open"
    );


    setUnifiedMode(
        "transaction"
    );


    focusAmount();
}


/* =========================================================
   OPEN EDIT TRANSACTION
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


    if (
        isAdjust(transaction)
    ) {
        openEditAdjust(id);
        return;
    }


    unifiedEditingId =
        id;


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


    const modal =
        document.getElementById(
            "transactionModal"
        );

    modal.classList.add(
        "open"
    );


    setUnifiedMode(
        "transaction"
    );


    focusAmount();
}


/* =========================================================
   OPEN EDIT ADJUST
   ========================================================= */

function openEditAdjust(id) {

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


    document.getElementById(
        "formTitle"
    ).textContent =
        "Edit Adjust";


    document.getElementById(
        "deleteEditButton"
    ).style.display =
        "block";


    document.getElementById(
        "dateInput"
    ).value =
        transaction.date;


    const balance =
        getAdjustBalance(
            transaction
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
    ).value =
        "";

    document.getElementById(
        "categoryInput"
    ).value =
        "";


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


    focusAmount();
}


/* =========================================================
   ADD ADJUST
   ========================================================= */

function openAddAdjust() {

    unifiedEditingId =
        null;


    document.getElementById(
        "formTitle"
    ).textContent =
        "Add Adjust";


    document.getElementById(
        "deleteEditButton"
    ).style.display =
        "none";


    document.getElementById(
        "dateInput"
    ).value =
        unifiedToday();


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
    ).value =
        "";

    document.getElementById(
        "categoryInput"
    ).value =
        "";


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


    focusAmount();
}


/* =========================================================
   SAVE
   ========================================================= */

function saveUnifiedForm() {

    const date =
        document.getElementById(
            "dateInput"
        ).value;


    const amount =
        unifiedGetAmount();


    if (!date) {

        document.getElementById(
            "dateInput"
        ).focus();

        return;
    }


    if (
        !Number.isFinite(amount)
    ) {

        amountInput.focus();

        return;
    }


    /* =====================================================
       ADJUST
       ===================================================== */

    if (
        unifiedMode === "adjust"
    ) {

        const balance =
            amount *
            transactionSign;


        /*
         * One Adjust per date.
         *
         * If adding another Adjust to
         * an existing date, update it.
         */
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


    /* =====================================================
       NORMAL TRANSACTION
       ===================================================== */

    if (amount <= 0) {

        amountInput.focus();

        return;
    }


    const comment =
        document.getElementById(
            "commentInput"
        ).value.trim();


    const category =
        document.getElementById(
            "categoryInput"
        ).value.trim();


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
             * If an Adjust was converted
             * to Transaction, remove
             * its Adjust-specific fields.
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
}


/* =========================================================
   DELETE FROM EDIT FORM
   ========================================================= */

function deleteUnifiedEditing() {

    if (
        unifiedEditingId === null
    ) {
        return;
    }


    const message =
        unifiedMode === "adjust"
            ? "Delete this Adjust?"
            : "Delete this transaction?";


    if (
        !confirm(message)
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


/* =========================================================
   BUTTONS
   ========================================================= */

document
    .getElementById(
        "saveButton"
    )
    .addEventListener(
        "click",
        saveUnifiedForm
    );


document
    .getElementById(
        "deleteEditButton"
    )
    .addEventListener(
        "click",
        deleteUnifiedEditing
    );


document
    .getElementById(
        "closeButton"
    )
    .addEventListener(
        "click",
        closeUnifiedForm
    );


document
    .getElementById(
        "cancelButton"
    )
    .addEventListener(
        "click",
        closeUnifiedForm
    );


/* =========================================================
   KEYBOARD
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
            event.key ===
            "Escape"
        ) {

            event.preventDefault();

            closeUnifiedForm();

            return;
        }


        if (
            event.key ===
            "Enter"
        ) {

            /*
             * Enter saves the form.
             */
            event.preventDefault();

            saveUnifiedForm();
        }
    }
);


/* =========================================================
   MAIN +
   ========================================================= */

const addButton =
    document.getElementById(
        "addButton"
    );


if (addButton) {

    addButton.addEventListener(
        "click",
        function () {

            /*
             * Always a NEW transaction.
             */
            openAddTransaction();

        }
    );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

createUnifiedTypeSelector();

setUnifiedMode(
    "transaction"
);
