/* =========================================================
   CASH FLOW - adjust.js
   Step 2: Adjust transactions
   ========================================================= */


/* =========================================================
   HELPERS
   ========================================================= */

function isAdjust(transaction) {
    return transaction &&
        transaction.type === "adjust";
}


function getAdjustBalance(transaction) {
    return Number(
        transaction.adjustBalance
    );
}


function getNextTransactionId() {

    let highest = 0;

    accounts.forEach(
        account => {

            account.transactions.forEach(
                transaction => {

                    const id =
                        Number(transaction.id);

                    if (
                        Number.isFinite(id) &&
                        id > highest
                    ) {
                        highest = id;
                    }

                }
            );

        }
    );

    return highest + 1;
}


/* =========================================================
   SORTING
   ========================================================= */

/*
 * Chronological order:
 *
 * Date ascending
 * Credits first
 * Debits next
 * Adjust last
 */
function sortCashFlowTransactions(
    list
) {

    return [...list].sort(
        function (a, b) {

            const dateCompare =
                a.date.localeCompare(
                    b.date
                );

            if (dateCompare !== 0) {
                return dateCompare;
            }


            /*
             * Adjust is always last
             * on its date.
             */
            if (
                isAdjust(a) &&
                !isAdjust(b)
            ) {
                return 1;
            }

            if (
                !isAdjust(a) &&
                isAdjust(b)
            ) {
                return -1;
            }


            /*
             * Normal transactions:
             * credits before debits.
             */
            if (!isAdjust(a) &&
                !isAdjust(b)) {

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
            }


            return (
                Number(a.id) -
                Number(b.id)
            );
        }
    );
}


/*
 * Display order:
 *
 * Newest date first.
 *
 * Within the same date:
 * credit
 * debit
 * adjust
 *
 * This keeps Adjust visually at the
 * bottom of its date group.
 */
function sortDisplayTransactions(
    list
) {

    return [...list].sort(
        function (a, b) {

            const dateCompare =
                b.date.localeCompare(
                    a.date
                );

            if (dateCompare !== 0) {
                return dateCompare;
            }

            /*
             * The transaction list is displayed
             * newest-first.
             *
             * Within the same date:
             *
             * Adjust = top
             * Debit  = middle
             * Credit = bottom
             *
             * This is the reverse of the
             * chronological calculation order.
             */

            function displayRank(
                transaction
            ) {

                if (
                    isAdjust(transaction)
                ) {
                    return 0;
                }

                return transaction.amount >= 0
                    ? 2
                    : 1;
            }


            const rankA =
                displayRank(a);

            const rankB =
                displayRank(b);


            if (rankA !== rankB) {
                return rankA - rankB;
            }


            /*
             * Keep the existing ordering
             * for transactions of the
             * same type.
             */
            return (
                Number(b.id) -
                Number(a.id)
            );

        }
    );
}
/* =========================================================
   BALANCE CALCULATION
   ========================================================= */

/*
 * Replace the original balance calculation
 * with one that understands Adjust.
 */
getChronologicalTransactions =
    function () {

        const sorted =
            sortCashFlowTransactions(
                transactions
            );


        let balance = 0;


        sorted.forEach(
            function (transaction) {

                if (
                    isAdjust(transaction)
                ) {

                    /*
                     * Adjust does not add money.
                     *
                     * It sets the balance.
                     */
                    balance =
                        getAdjustBalance(
                            transaction
                        );

                } else {

                    balance +=
                        Number(
                            transaction.amount
                        );

                }


                transaction.balance =
                    balance;
            }
        );


        return sorted;
    };


/* =========================================================
   ACCOUNT BALANCE / MINI GRAPHS
   ========================================================= */

getAccountBalance =
    function (account) {

        const sorted =
            sortCashFlowTransactions(
                account.transactions
            );


        let balance = 0;


        sorted.forEach(
            function (transaction) {

                if (
                    isAdjust(transaction)
                ) {

                    balance =
                        getAdjustBalance(
                            transaction
                        );

                } else {

                    balance +=
                        Number(
                            transaction.amount
                        );

                }

            }
        );


        return balance;
    };


getAccountDailyBalances =
    function (account) {

        const sorted =
            sortCashFlowTransactions(
                account.transactions
            );


        const daily = [];

        let balance = 0;
        let currentDate = null;


        sorted.forEach(
            function (transaction) {

                if (
                    isAdjust(transaction)
                ) {

                    balance =
                        getAdjustBalance(
                            transaction
                        );

                } else {

                    balance +=
                        Number(
                            transaction.amount
                        );

                }


                if (
                    currentDate !==
                    transaction.date
                ) {

                    currentDate =
                        transaction.date;

                    daily.push({
                        date:
                            transaction.date,

                        balance:
                            balance
                    });

                } else {

                    daily[
                        daily.length - 1
                    ].balance =
                        balance;

                }

            }
        );


        return daily;
    };


/* =========================================================
   ADJUST ACTIONS
   ========================================================= */

function createAccountActionBar() {

    if (
        document.getElementById(
            "accountActionBar"
        )
    ) {
        return;
    }


    const balanceSection =
        document.querySelector(
            ".balance-section"
        );


    if (!balanceSection) {
        return;
    }


    const bar =
        document.createElement(
            "div"
        );

    bar.id =
        "accountActionBar";

    bar.className =
        "account-action-bar";


    bar.innerHTML = `
        <button
            type="button"
            class="account-action-button"
            id="topAddTransactionButton">
            <span class="action-plus">+</span>
            Transaction
        </button>

        <button
            type="button"
            class="account-action-button adjust-action"
            id="addAdjustButton">
            Adjust
        </button>
    `;


    balanceSection.parentNode.insertBefore(
        bar,
        balanceSection
    );


    document
        .getElementById(
            "topAddTransactionButton"
        )
        .addEventListener(
            "click",
            openAddTransaction
        );


    document
        .getElementById(
            "addAdjustButton"
        )
        .addEventListener(
            "click",
            function () {

                openAddAdjust();

            }
        );
}


function updateActionBarVisibility() {

    const bar =
        document.getElementById(
            "accountActionBar"
        );


    if (!bar) {
        return;
    }


    bar.style.display =
        allAccountsMode
            ? "none"
            : "grid";
}


/* =========================================================
   ADJUST MODAL
   ========================================================= */

function createAdjustModal() {

    if (
        document.getElementById(
            "adjustModal"
        )
    ) {
        return;
    }


    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "adjustModal";

    modal.className =
        "modal";


    modal.innerHTML = `
        <div class="form-card">
            <div class="drag-bar"></div>

            <div class="form-header">

                <div
                    class="form-title"
                    id="adjustFormTitle">
                    Add Adjust
                </div>

                <button
                    type="button"
                    class="close-button"
                    id="adjustCloseButton">
                    ×
                </button>

            </div>


            <div class="field">
                <label
                    class="field-label"
                    for="adjustDateInput">
                    Date
                </label>

                <input
                    id="adjustDateInput"
                    class="date-input"
                    type="date">

            </div>


            <div class="field">

                <label
                    class="field-label"
                    for="adjustBalanceInput">
                    Account balance
                </label>

                <div class="adjust-amount-row">

                    <div class="adjust-sign-buttons">

                        <button
                            type="button"
                            class="sign-button"
                            id="adjustMinusButton">
                            −
                        </button>

                        <button
                            type="button"
                            class="sign-button"
                            id="adjustPlusButton">
                            +
                        </button>

                    </div>

                    <input
                        id="adjustBalanceInput"
                        class="amount-input adjust-balance-input"
                        type="text"
                        inputmode="decimal"
                        autocomplete="off"
                        placeholder="0">

                </div>

            </div>


            <div class="adjust-explanation">
                This sets the account balance at
                the end of this date.
            </div>


            <div class="form-actions">

                <button
                    type="button"
                    class="cancel-button"
                    id="adjustCancelButton">
                    Cancel
                </button>

                <button
                    type="button"
                    class="save-button"
                    id="adjustSaveButton">
                    Save
                </button>

            </div>


            <button
                type="button"
                id="deleteAdjustButton"
                class="delete-edit-button">
                Delete Adjust
            </button>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    /*
     * Close button
     */
    document
        .getElementById(
            "adjustCloseButton"
        )
        .addEventListener(
            "click",
            closeAdjustForm
        );


    /*
     * Cancel button
     */
    document
        .getElementById(
            "adjustCancelButton"
        )
        .addEventListener(
            "click",
            closeAdjustForm
        );


    /*
     * Save button
     */
    document
        .getElementById(
            "adjustSaveButton"
        )
        .addEventListener(
            "click",
            saveAdjust
        );


    /*
     * Delete button
     */
    document
        .getElementById(
            "deleteAdjustButton"
        )
        .addEventListener(
            "click",
            deleteEditingAdjust
        );


    const input =
        document.getElementById(
            "adjustBalanceInput"
        );


    /*
     * Keep the balance input clean.
     *
     * Commas are allowed while displaying
     * a number, but they are removed when
     * saving.
     */
    input.addEventListener(
        "input",
        function () {

            let value =
                this.value
                    .replace(
                        /[^\d.-]/g,
                        ""
                    );


            /*
             * Keep only one decimal point.
             */
            value =
                value.replace(
                    /(\..*)\./g,
                    "$1"
                );


            /*
             * Keep the minus sign only
             * at the beginning.
             */
            const negative =
                value.startsWith("-");


            value =
                value.replace(
                    /-/g,
                    ""
                );


            if (negative) {
                value =
                    "-" + value;
            }


            this.value =
                value;

        }
    );


    /*
     * Adjust sign buttons.
     *
     * These change the sign of the
     * existing balance. They do not
     * change the amount itself.
     *
     * Example:
     *
     * 500  -> -500
     * -500 -> 500
     */
    const minusButton =
        document.getElementById(
            "adjustMinusButton"
        );

    const plusButton =
        document.getElementById(
            "adjustPlusButton"
        );


    function setAdjustSign(
        negative
    ) {

        let value =
            input.value
                .replace(
                    /,/g,
                    ""
                )
                .trim();


        /*
         * If the field is empty,
         * don't insert a zero.
         *
         * This lets the user type
         * the number normally.
         */
        if (!value) {
            return;
        }


        const number =
            Number(value);


        if (
            !Number.isFinite(
                number
            )
        ) {
            return;
        }


        const absolute =
            Math.abs(number);


        input.value =
            negative
                ? "-" + absolute
                : String(absolute);


        /*
         * Put the cursor back in
         * the balance field.
         */
        input.focus();

    }


    minusButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            setAdjustSign(true);

        }
    );


    plusButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            setAdjustSign(false);

        }
    );


    /*
     * Keyboard shortcuts.
     */
    document.addEventListener(
        "keydown",
        function (event) {

            const modal =
                document.getElementById(
                    "adjustModal"
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

                closeAdjustForm();

                return;
            }


            if (
                event.key ===
                "Enter"
            ) {

                /*
                 * Don't submit while the
                 * user is using the date
                 * field.
                 */
                if (
                    document.activeElement ===
                    document.getElementById(
                        "adjustDateInput"
                    )
                ) {
                    return;
                }


                event.preventDefault();

                saveAdjust();

            }

        }
    );

}

let editingAdjustId = null;


function openAddAdjust() {

    editingAdjustId = null;


    document
        .getElementById(
            "adjustFormTitle"
        )
        .textContent =
        "Add Adjust";


    document
        .getElementById(
            "deleteAdjustButton"
        )
        .style.display =
        "none";


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    document
        .getElementById(
            "adjustDateInput"
        )
        .value =
        today;


    /*
     * Start with the current account
     * balance as a convenient default.
     */
    document
        .getElementById(
            "adjustBalanceInput"
        )
        .value =
        getAccountBalance(
            getCurrentAccount()
        ).toLocaleString(
            "en-US",
            {
                maximumFractionDigits: 2
            }
        );


    const modal =
        document.getElementById(
            "adjustModal"
        );


    modal.classList.add(
        "open"
    );


    setTimeout(
        function () {

            const input =
                document.getElementById(
                    "adjustBalanceInput"
                );

            input.focus();
            input.select();

        },
        100
    );
}


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


    editingAdjustId =
        id;


    document
        .getElementById(
            "adjustFormTitle"
        )
        .textContent =
        "Edit Adjust";


    document
        .getElementById(
            "deleteAdjustButton"
        )
        .style.display =
        "block";


    document
        .getElementById(
            "adjustDateInput"
        )
        .value =
        transaction.date;


    document
        .getElementById(
            "adjustBalanceInput"
        )
        .value =
        getAdjustBalance(
            transaction
        ).toLocaleString(
            "en-US",
            {
                maximumFractionDigits: 2
            }
        );


    const modal =
        document.getElementById(
            "adjustModal"
        );


    modal.classList.add(
        "open"
    );


    setTimeout(
        function () {

            const input =
                document.getElementById(
                    "adjustBalanceInput"
                );

            input.focus();
            input.select();

        },
        100
    );
}


function closeAdjustForm() {

    const modal =
        document.getElementById(
            "adjustModal"
        );


    modal.classList.remove(
        "open"
    );


    editingAdjustId =
        null;
}


function saveAdjust() {

    const date =
        document.getElementById(
            "adjustDateInput"
        ).value;


    const raw =
        document
            .getElementById(
                "adjustBalanceInput"
            )
            .value
            .replace(/,/g, "")
            .trim();


    const balance =
        Number(raw);


    if (!date) {

        document
            .getElementById(
                "adjustDateInput"
            )
            .focus();

        return;
    }


    if (
        !Number.isFinite(balance)
    ) {

        document
            .getElementById(
                "adjustBalanceInput"
            )
            .focus();

        return;
    }


    /*
     * There should normally be one Adjust
     * per date.
     *
     * If the user adds another Adjust on
     * a date that already has one, update
     * the existing one instead of creating
     * two competing balance resets.
     */
    const existing =
        transactions.find(
            transaction =>
                isAdjust(transaction) &&
                transaction.date === date &&
                transaction.id !==
                    editingAdjustId
        );


    if (
        existing &&
        editingAdjustId === null
    ) {

        existing.adjustBalance =
            balance;

    } else if (
        editingAdjustId === null
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
                    editingAdjustId
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


    closeAdjustForm();


    renderTransactions();


    window.scrollTo(
        0,
        0
    );
}


/* =========================================================
   DELETE ADJUST
   ========================================================= */

function deleteEditingAdjust() {

    if (
        editingAdjustId === null
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
                editingAdjustId
        );


    closeAdjustForm();


    renderTransactions();


    window.scrollTo(
        0,
        0
    );
}


function deleteAdjust(id) {

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
                transaction.id !== id
        );


    renderTransactions();
}


/* =========================================================
   TRANSACTION LIST
   ========================================================= */

/*
 * We replace the original renderer so that
 * Adjust can have its own appearance and
 * position within the date.
 */
renderTransactions =
    function () {

        syncCurrentTransactions();

        saveAccountData();


        const list =
            document.getElementById(
                "transactionList"
            );


        if (!list) {
            return;
        }


        list.innerHTML = "";


        const chronological =
            getChronologicalTransactions();


        const display =
            sortDisplayTransactions(
                transactions
            );


        display.forEach(
            function (transaction) {

                const wrapper =
                    document.createElement(
                        "div"
                    );


                wrapper.className =
                    "transaction-wrap";


                /*
                 * Delete button.
                 */
                const deleteButton =
                    document.createElement(
                        "button"
                    );


                deleteButton.className =
                    "transaction-delete";


                deleteButton.textContent =
                    "Delete";


                function deleteThisTransaction(
                    event
                ) {

                    event.preventDefault();
                    event.stopPropagation();


                    if (
                        isAdjust(
                            transaction
                        )
                    ) {

                        deleteAdjust(
                            transaction.id
                        );

                    } else {

                        deleteTransaction(
                            transaction.id
                        );

                    }

                }


                deleteButton.addEventListener(
                    "click",
                    deleteThisTransaction
                );


                deleteButton.addEventListener(
                    "touchend",
                    deleteThisTransaction,
                    {
                        passive: false
                    }
                );


                /*
                 * Transaction row.
                 */
                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "transaction";


                if (
                    isAdjust(transaction)
                ) {

                    row.classList.add(
                        "adjust-transaction"
                    );

                }


                const balance =
                    transaction.balance;


                if (
                    isAdjust(transaction)
                ) {

                    row.innerHTML = `
                        <div class="transaction-date">
                            ${formatDate(
                                transaction.date
                            )}
                        </div>

                        <div class="transaction-comment adjust-label">
                            <span class="adjust-icon">↳</span>
                            ADJUST
                        </div>

                        <div class="transaction-amount adjust-amount">
                            ${formatBalance(
                                getAdjustBalance(
                                    transaction
                                )
                            )}
                        </div>

                        <div class="transaction-balance adjust-balance">
                            ${formatBalance(
                                balance
                            )}
                        </div>
                    `;

                } else {

                    const amountClass =
                        transaction.amount < 0
                            ? "transaction-amount debit"
                            : "transaction-amount credit";


                    const balanceClass =
                        balance < 0
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
                                transaction.comment
                            )}
                        </div>

                        <div class="${amountClass}">
                            ${formatAmount(
                                transaction.amount
                            )}
                        </div>

                        <div class="${balanceClass}">
                            ${formatBalance(
                                balance
                            )}
                        </div>
                    `;

                }


                row.addEventListener(
                    "click",
                    function () {

                        if (
                            row.classList.contains(
                                "swiped"
                            )
                        ) {

                            closeSwipe(row);

                            return;
                        }


                        if (
                            isAdjust(
                                transaction
                            )
                        ) {

                            openEditAdjust(
                                transaction.id
                            );

                        } else {

                            openEditTransaction(
                                transaction.id
                            );

                        }

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

        updateGraph(
            chronological
        );


        renderAccountTabs();


        saveAccountData();


        if (!allAccountsMode) {

            window.scrollTo(
                0,
                0
            );

        }

    };


/* =========================================================
   KEEP ACTION BAR IN SYNC WITH ACCOUNT NAVIGATION
   ========================================================= */

const originalSwitchAccount =
    switchAccount;


switchAccount =
    function (accountId) {

        originalSwitchAccount(
            accountId
        );

        updateActionBarVisibility();

    };


const originalShowAllAccounts =
    showAllAccounts;


showAllAccounts =
    function () {

        originalShowAllAccounts();

        updateActionBarVisibility();

    };


/* =========================================================
   START STEP 2
   ========================================================= */

createAdjustModal();

createAccountActionBar();

updateActionBarVisibility();


/*
 * Hide the old floating + button.
 * The new action is now at the top.
 */
const oldAddButton =
    document.getElementById(
        "addButton"
    );


if (oldAddButton) {

    oldAddButton.style.display =
        "none";

}


/*
 * Re-render once after Step 2
 * has been installed.
 */
renderTransactions();
