/* =========================================================
   CASH FLOW - starting-balance.js

   Starting Balance:
   - Belongs to the account, not to transactions.
   - Always appears at the bottom of the transaction list.
   - Is editable by clicking it.
   - Is used as the starting point for balance calculations.
   ========================================================= */


/* =========================================================
   HELPERS
   ========================================================= */

function getStartingBalance(account) {

    if (!account) {
        return 0;
    }

    const value =
        Number(account.startingBalance);

    return Number.isFinite(value)
        ? value
        : 0;
}


/* =========================================================
   INITIALIZE / MIGRATE ACCOUNTS
   ========================================================= */

function initializeStartingBalances() {

    if (!Array.isArray(accounts)) {
        return;
    }

    let changed = false;

    accounts.forEach(
        function (account) {

            if (
                !Number.isFinite(
                    Number(
                        account.startingBalance
                    )
                )
            ) {

                account.startingBalance = 0;

                changed = true;
            }

        }
    );

    if (changed) {
        saveAccountData();
    }
}


/* =========================================================
   BALANCE CALCULATION
   ========================================================= */

/*
 * Start the account from Starting Balance.
 *
 * Calculation order remains:
 *
 * Credit → Debit → Adjust
 */

getChronologicalTransactions =
    function () {

        const sorted =
            sortCashFlowTransactions(
                transactions
            );

        const account =
            getCurrentAccount();

        let balance =
            getStartingBalance(account);

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

                transaction.balance =
                    balance;

            }
        );

        return sorted;
    };


/* =========================================================
   ACCOUNT BALANCE
   ========================================================= */

getAccountBalance =
    function (account) {

        if (!account) {
            return 0;
        }

        const sorted =
            sortCashFlowTransactions(
                account.transactions
            );

        let balance =
            getStartingBalance(account);

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


/* =========================================================
   ACCOUNT DAILY BALANCES
   ========================================================= */

getAccountDailyBalances =
    function (account) {

        if (!account) {
            return [];
        }

        const sorted =
            sortCashFlowTransactions(
                account.transactions
            );

        const daily = [];

        let balance =
            getStartingBalance(account);

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
   STARTING BALANCE MODAL
   ========================================================= */

function createStartingBalanceModal() {

    if (
        document.getElementById(
            "startingBalanceModal"
        )
    ) {
        return;
    }

    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "startingBalanceModal";

    modal.className =
        "modal";


    modal.innerHTML = `
        <div class="form-card">

            <div class="drag-bar"></div>

            <div class="form-header">

                <div class="form-title">
                    Edit Starting Balance
                </div>

                <button
                    class="close-button"
                    id="startingBalanceCloseButton">
                    ×
                </button>

            </div>


            <div class="field">

                <label
                    class="field-label"
                    for="startingBalanceInput">
                    Starting balance
                </label>

                <div class="amount-row">

                    <button
                        type="button"
                        class="sign-button"
                        id="startingBalanceMinus">
                        −
                    </button>

                    <button
                        type="button"
                        class="sign-button"
                        id="startingBalancePlus">
                        +
                    </button>

                    <input
                        id="startingBalanceInput"
                        class="amount-input"
                        type="text"
                        inputmode="decimal"
                        autocomplete="off"
                        placeholder="0">

                </div>

                <div
                    class="amount-hint"
                    id="startingBalanceHint">
                    Positive starting balance
                </div>

            </div>


            <div class="starting-balance-explanation">
                This is the balance before the first
                transaction currently shown.
            </div>


            <div class="form-actions">

                <button
                    class="cancel-button"
                    id="startingBalanceCancelButton">
                    Cancel
                </button>

                <button
                    class="save-button"
                    id="startingBalanceSaveButton">
                    Save
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    document
        .getElementById(
            "startingBalanceCloseButton"
        )
        .addEventListener(
            "click",
            closeStartingBalanceForm
        );


    document
        .getElementById(
            "startingBalanceCancelButton"
        )
        .addEventListener(
            "click",
            closeStartingBalanceForm
        );


    document
        .getElementById(
            "startingBalanceSaveButton"
        )
        .addEventListener(
            "click",
            saveStartingBalance
        );


    document
        .getElementById(
            "startingBalanceMinus"
        )
        .addEventListener(
            "click",
            function () {
                setStartingBalanceSign(-1);
            }
        );


    document
        .getElementById(
            "startingBalancePlus"
        )
        .addEventListener(
            "click",
            function () {
                setStartingBalanceSign(1);
            }
        );


    const input =
        document.getElementById(
            "startingBalanceInput"
        );


    input.addEventListener(
        "input",
        function () {

            let value =
                this.value.replace(
                    /[^\d.-]/g,
                    ""
                );


            value =
                value.replace(
                    /(\..*)\./g,
                    "$1"
                );


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


            updateStartingBalanceSign();

        }
    );


    input.addEventListener(
        "focus",
        function () {

            if (this.value) {
                this.select();
            }

        }
    );


    input.addEventListener(
        "blur",
        function () {

            if (!this.value) {
                return;
            }

            const value =
                Number(
                    this.value.replace(
                        /,/g,
                        ""
                    )
                );

            if (
                Number.isFinite(value)
            ) {

                this.value =
                    value.toLocaleString(
                        "en-US",
                        {
                            maximumFractionDigits: 2
                        }
                    );
            }

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
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

                closeStartingBalanceForm();

                return;
            }


            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                saveStartingBalance();

                return;
            }


            if (
                document.activeElement !==
                input
            ) {
                return;
            }


            if (
                event.key === "-" ||
                event.code ===
                    "NumpadSubtract"
            ) {

                event.preventDefault();

                setStartingBalanceSign(-1);

                return;
            }


            if (
                event.key === "+" ||
                event.code ===
                    "NumpadAdd"
            ) {

                event.preventDefault();

                setStartingBalanceSign(1);

            }

        }
    );
}


/* =========================================================
   STARTING BALANCE SIGN
   ========================================================= */

function setStartingBalanceSign(
    sign
) {

    const input =
        document.getElementById(
            "startingBalanceInput"
        );

    if (!input) {
        return;
    }


    let value =
        input.value
            .replace(
                /,/g,
                ""
            )
            .replace(
                /[^\d.]/g,
                ""
            );


    if (!value) {
        value = "0";
    }


    input.value =
        sign === -1
            ? "-" + value
            : value;


    updateStartingBalanceSign();

    input.focus();

    input.select();
}


function updateStartingBalanceSign() {

    const input =
        document.getElementById(
            "startingBalanceInput"
        );

    const minus =
        document.getElementById(
            "startingBalanceMinus"
        );

    const plus =
        document.getElementById(
            "startingBalancePlus"
        );

    const hint =
        document.getElementById(
            "startingBalanceHint"
        );


    if (
        !input ||
        !minus ||
        !plus
    ) {
        return;
    }


    const negative =
        input.value
            .trim()
            .startsWith("-");


    minus.classList.toggle(
        "selected",
        negative
    );

    plus.classList.toggle(
        "selected",
        !negative
    );


    if (hint) {

        hint.textContent =
            negative
                ? "Negative starting balance"
                : "Positive starting balance";

    }


    input.classList.toggle(
        "debit",
        negative
    );

    input.classList.toggle(
        "credit",
        !negative
    );
}


/* =========================================================
   OPEN / CLOSE
   ========================================================= */

function openEditStartingBalance() {

    if (allAccountsMode) {
        return;
    }


    const account =
        getCurrentAccount();

    if (!account) {
        return;
    }


    const input =
        document.getElementById(
            "startingBalanceInput"
        );


    input.value =
        getStartingBalance(
            account
        ).toLocaleString(
            "en-US",
            {
                maximumFractionDigits: 2
            }
        );


    updateStartingBalanceSign();


    const modal =
        document.getElementById(
            "startingBalanceModal"
        );

    modal.classList.add(
        "open"
    );


    setTimeout(
        function () {

            input.focus();
            input.select();

        },
        100
    );
}


function closeStartingBalanceForm() {

    const modal =
        document.getElementById(
            "startingBalanceModal"
        );

    if (modal) {
        modal.classList.remove(
            "open"
        );
    }
}


/* =========================================================
   SAVE
   ========================================================= */

function saveStartingBalance() {

    const account =
        getCurrentAccount();

    if (!account) {
        return;
    }


    const input =
        document.getElementById(
            "startingBalanceInput"
        );


    const raw =
        input.value
            .replace(
                /,/g,
                ""
            )
            .trim();


    const value =
        Number(raw);


    if (
        !Number.isFinite(value)
    ) {

        input.focus();

        return;
    }


    account.startingBalance =
        value;


    saveAccountData();

    closeStartingBalanceForm();

    renderTransactions();

    window.scrollTo(
        0,
        0
    );
}


/* =========================================================
   STARTING BALANCE ROW
   ========================================================= */

function renderStartingBalanceRow() {

    if (allAccountsMode) {
        return;
    }


    const list =
        document.getElementById(
            "transactionList"
        );

    if (!list) {
        return;
    }


    const account =
        getCurrentAccount();

    if (!account) {
        return;
    }


    const value =
        getStartingBalance(
            account
        );


    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "starting-balance-wrap";


    const row =
        document.createElement(
            "div"
        );

    row.className =
        "transaction starting-balance-row";


    row.innerHTML = `
        <div class="transaction-date">
            —
        </div>

        <div
            class="transaction-comment starting-balance-label">
            STARTING BALANCE
        </div>

        <div
            class="transaction-amount starting-balance-amount">
            ${formatBalance(value)}
        </div>

        <div
            class="transaction-balance starting-balance-value">
            ${formatBalance(value)}
        </div>
    `;


    row.addEventListener(
        "click",
        function () {
            openEditStartingBalance();
        }
    );


    wrapper.appendChild(
        row
    );

    list.appendChild(
        wrapper
    );
}


/* =========================================================
   RENDER WRAPPER
   ========================================================= */

const originalRenderTransactionsForStartingBalance =
    renderTransactions;


renderTransactions =
    function () {

        originalRenderTransactionsForStartingBalance();

        if (!allAccountsMode) {
            renderStartingBalanceRow();
        }

    };


/* =========================================================
   ADJUST +/- BUTTONS
   ========================================================= */

/*
 * The Adjust modal is created dynamically by adjust.js.
 *
 * Therefore we watch for its input instead of trying
 * to modify it before it exists.
 */

function addAdjustSignButtonsIfNeeded() {

    const input =
        document.getElementById(
            "adjustBalanceInput"
        );

    if (!input) {
        return;
    }


    if (
        document.getElementById(
            "adjustBalanceMinus"
        )
    ) {
        return;
    }


    const row =
        document.createElement(
            "div"
        );

    row.className =
        "amount-row adjust-amount-row";


    const minus =
        document.createElement(
            "button"
        );

    minus.type =
        "button";

    minus.className =
        "sign-button";

    minus.id =
        "adjustBalanceMinus";

    minus.textContent =
        "−";


    const plus =
        document.createElement(
            "button"
        );

    plus.type =
        "button";

    plus.className =
        "sign-button";

    plus.id =
        "adjustBalancePlus";

    plus.textContent =
        "+";


    input.parentNode.insertBefore(
        row,
        input
    );


    row.appendChild(
        minus
    );

    row.appendChild(
        plus
    );

    row.appendChild(
        input
    );


    minus.addEventListener(
        "click",
        function () {
            setAdjustSign(-1);
        }
    );


    plus.addEventListener(
        "click",
        function () {
            setAdjustSign(1);
        }
    );


    input.addEventListener(
        "input",
        updateAdjustSignButtons
    );


    input.addEventListener(
        "focus",
        updateAdjustSignButtons
    );


    updateAdjustSignButtons();
}


function setAdjustSign(
    sign
) {

    const input =
        document.getElementById(
            "adjustBalanceInput"
        );

    if (!input) {
        return;
    }


    let value =
        input.value
            .replace(
                /,/g,
                ""
            )
            .replace(
                /[^\d.]/g,
                ""
            );


    if (!value) {
        value = "0";
    }


    input.value =
        sign === -1
            ? "-" + value
            : value;


    updateAdjustSignButtons();

    input.focus();

    input.select();
}


function updateAdjustSignButtons() {

    const input =
        document.getElementById(
            "adjustBalanceInput"
        );

    const minus =
        document.getElementById(
            "adjustBalanceMinus"
        );

    const plus =
        document.getElementById(
            "adjustBalancePlus"
        );


    if (
        !input ||
        !minus ||
        !plus
    ) {
        return;
    }


    const negative =
        input.value
            .trim()
            .startsWith("-");


    minus.classList.toggle(
        "selected",
        negative
    );

    plus.classList.toggle(
        "selected",
        !negative
    );


    input.classList.toggle(
        "debit",
        negative
    );

    input.classList.toggle(
        "credit",
        !negative
    );
}


/* =========================================================
   WATCH FOR DYNAMIC ADJUST MODAL
   ========================================================= */

const startingBalanceObserver =
    new MutationObserver(
        function () {

            createAdjustSignButtons();

        }
    );


startingBalanceObserver.observe(
    document.body,
    {
        childList: true,
        subtree: true
    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

initializeStartingBalances();

createStartingBalanceModal();


/*
 * The other application files perform several
 * renderTransactions() replacements during startup.
 *
 * Give the application one final render after all
 * Starting Balance functionality has been installed.
 */
setTimeout(
    function () {

        if (
            typeof renderTransactions ===
            "function"
        ) {
            renderTransactions();
        }

    },
    0
);
