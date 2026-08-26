/* =========================================================
   CASH FLOW - accounts.js
   Step 1: Four accounts + account navigation +
   local storage + All Accounts screen
   ========================================================= */

const ACCOUNT_STORAGE_KEY = "cashFlowDataV1";

let accounts = [];
let currentAccountId = "account1";
let allAccountsMode = false;


/* =========================================================
   ACCOUNT DATA
   ========================================================= */

function createDefaultAccounts() {
    return [
        {
            id: "account1",
            name: "Account1",
            transactions: []
        },
        {
            id: "account2",
            name: "Account2",
            transactions: []
        },
        {
            id: "account3",
            name: "Account3",
            transactions: []
        },
        {
            id: "account4",
            name: "Account4",
            transactions: []
        }
    ];
}


/* =========================================================
   STORAGE
   ========================================================= */

function saveAccountData() {

    const data = {
        version: 1,
        accounts: accounts,
        currentAccountId: currentAccountId
    };

    localStorage.setItem(
        ACCOUNT_STORAGE_KEY,
        JSON.stringify(data)
    );
}


function loadAccountData() {

    const saved =
        localStorage.getItem(
            ACCOUNT_STORAGE_KEY
        );

    if (!saved) {

        /*
         * First run.
         *
         * The existing application already contains
         * demo transactions. Put those transactions
         * into Account1.
         */

        accounts =
            createDefaultAccounts();

        accounts[0].transactions =
            transactions.map(
                transaction => ({
                    ...transaction
                })
            );

        saveAccountData();

        return;
    }


    try {

        const data =
            JSON.parse(saved);

        if (
            !data ||
            !Array.isArray(data.accounts) ||
            data.accounts.length !== 4
        ) {
            throw new Error(
                "Invalid account data"
            );
        }


        accounts =
            data.accounts;


        currentAccountId =
            data.currentAccountId ||
            "account1";


        /*
         * Make sure every account has
         * a transaction array.
         */

        accounts.forEach(
            account => {

                if (
                    !Array.isArray(
                        account.transactions
                    )
                ) {
                    account.transactions = [];
                }

            }
        );

    } catch (error) {

        console.error(
            "Could not load saved account data.",
            error
        );

        accounts =
            createDefaultAccounts();

        accounts[0].transactions =
            transactions.map(
                transaction => ({
                    ...transaction
                })
            );

        saveAccountData();
    }
}


/* =========================================================
   ACCOUNT HELPERS
   ========================================================= */

function getCurrentAccount() {

    return accounts.find(
        account =>
            account.id ===
            currentAccountId
    );
}


function getAccountBalance(account) {

    if (!account) {
        return 0;
    }

    const sorted =
        calculateTransactionBalances(
            account.transactions
        );

    if (!sorted.length) {
        return 0;
    }

    return sorted[
        sorted.length - 1
    ].balance;
}

function getAccountDailyBalances(account) {

    if (!account) {
        return [];
    }

    const sorted =
        calculateTransactionBalances(
            account.transactions
        );

    const daily = [];

    let currentDate = null;

    sorted.forEach(function (transaction) {

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
                    transaction.balance
            });

        } else {

            daily[
                daily.length - 1
            ].balance =
                transaction.balance;
        }
    });

    return daily;
}

/* =========================================================
   NUMBER FORMATTING
   ========================================================= */

function formatAccountBalance(value) {

    const number =
        Math.abs(value)
            .toLocaleString(
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


/* =========================================================
   ACCOUNT NAVIGATION
   ========================================================= */

function renderAccountTabs() {

    const container =
        document.querySelector(
            ".account-name"
        );

    if (!container) {
        return;
    }


    container.innerHTML = "";


    const tabs =
        document.createElement(
            "div"
        );

    tabs.className =
        "account-tabs";


    /*
     * All Accounts tab.
     */

    const allButton =
        document.createElement(
            "button"
        );

    allButton.type = "button";

    allButton.className =
        "account-tab all-tab";

    allButton.textContent =
        "All";

    allButton.classList.toggle(
        "active",
        allAccountsMode
    );


    allButton.addEventListener(
        "click",
        function () {

            showAllAccounts();

        }
    );


    tabs.appendChild(
        allButton
    );


    /*
     * Four account tabs.
     */

    accounts.forEach(
        account => {

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "account-tab";

            button.textContent =
                account.name;


            button.classList.toggle(
                "active",
                !allAccountsMode &&
                account.id ===
                    currentAccountId
            );


            button.addEventListener(
                "click",
                function () {

                    switchAccount(
                        account.id
                    );

                }
            );


            tabs.appendChild(
                button
            );

        }
    );


    container.appendChild(
        tabs
    );


    /*
     * Pencil button.
     *
     * It only appears when an actual
     * account is selected.
     */

    if (!allAccountsMode) {

        const editButton =
            document.createElement(
                "button"
            );

        editButton.type = "button";

        editButton.className =
            "account-edit-button";

        editButton.textContent =
            "✎";

        editButton.title =
            "Edit account name";


        editButton.addEventListener(
            "click",
            openEditAccount
        );


        container.appendChild(
            editButton
        );
    }
}


function switchAccount(accountId) {

    /*
     * Save whatever account was active
     * before switching.
     */
    syncCurrentTransactions();

    currentAccountId = accountId;
    allAccountsMode = false;

    const account = getCurrentAccount();

    if (!account) {
        return;
    }

    /*
     * Connect the original application's
     * transaction array to the selected account.
     */
    transactions = account.transactions;

    /*
     * Hide the All Accounts screen.
     */
    const allScreen =
        document.getElementById(
            "allAccountsScreen"
        );

    if (allScreen) {
        allScreen.style.display = "none";
    }

    renderAccountTabs();

    saveAccountData();

    setMainScreenVisible(true);

    renderTransactions();

    /*
     * Always return to the top so the
     * account names, balance and graph
     * are immediately visible.
     */
    window.scrollTo(0, 0);
}

function syncCurrentTransactions() {

    if (allAccountsMode) {
        return;
    }


    const account =
        getCurrentAccount();


    if (!account) {
        return;
    }


    /*
     * The original app sometimes replaces
     * the transactions array when deleting.
     *
     * Copy the current array back into
     * the account object.
     */

    account.transactions =
        transactions;
}


/* =========================================================
   MAIN SCREEN / ALL ACCOUNTS SCREEN
   ========================================================= */

function setMainScreenVisible(
    visible
) {

    const balance =
        document.querySelector(
            ".balance-section"
        );

    const graph =
        document.querySelector(
            ".graph-card"
        );

    const list =
        document.querySelector(
            ".transactions"
        );


    if (balance) {
        balance.style.display =
            visible
                ? ""
                : "none";
    }

    if (graph) {
        graph.style.display =
            visible
                ? ""
                : "none";
    }

    if (list) {
        list.style.display =
            visible
                ? ""
                : "none";
    }


    const addButton =
        document.getElementById(
            "addButton"
        );

    if (addButton) {
        addButton.style.display =
            visible
                ? ""
                : "none";
    }
}


function showAllAccounts() {

    syncCurrentTransactions();

    allAccountsMode = true;

    setMainScreenVisible(false);

    renderAccountTabs();

    renderAllAccountsScreen();

    /*
     * Make sure the All Accounts screen
     * is visible.
     */
    const allScreen =
        document.getElementById(
            "allAccountsScreen"
        );

    if (allScreen) {
        allScreen.style.display = "";
    }

    saveAccountData();

    /*
     * Start at the top of the All Accounts
     * view as well.
     */
    window.scrollTo(0, 0);
}

/* =========================================================
   ALL ACCOUNTS SCREEN
   ========================================================= */

function renderAllAccountsScreen() {

    let screen =
        document.getElementById(
            "allAccountsScreen"
        );


    if (!screen) {

        screen =
            document.createElement(
                "section"
            );

        screen.id =
            "allAccountsScreen";

        screen.className =
            "all-accounts-screen";


        const app =
            document.querySelector(
                ".app"
            );

        app.appendChild(
            screen
        );
    }


    screen.innerHTML = "";


    const title =
        document.createElement(
            "div"
        );

    title.className =
        "all-accounts-title";

    title.textContent =
        "Accounts";


    screen.appendChild(
        title
    );


    const grid =
        document.createElement(
            "div"
        );

    grid.className =
        "accounts-grid";


    accounts.forEach(
        account => {

            const card =
                createAccountCard(
                    account
                );

            grid.appendChild(
                card
            );

        }
    );


    screen.appendChild(
        grid
    );
}


function createAccountCard(
    account
) {

    const card =
        document.createElement(
            "button"
        );

    card.type = "button";

    card.className =
        "account-card";


    const balance =
        getAccountBalance(
            account
        );


    const name =
        document.createElement(
            "div"
        );

    name.className =
        "account-card-name";

    name.textContent =
        account.name;


    const balanceElement =
        document.createElement(
            "div"
        );

    balanceElement.className =
        "account-card-balance";

    if (balance < 0) {
        balanceElement.classList.add(
            "negative"
        );
    }

    balanceElement.textContent =
        formatAccountBalance(
            balance
        );


    const label =
        document.createElement(
            "div"
        );

    label.className =
        "account-card-label";

    label.textContent =
        "current balance";


    const graph =
        createMiniGraph(
            account
        );


    card.appendChild(
        name
    );

    card.appendChild(
        balanceElement
    );

    card.appendChild(
        label
    );

    card.appendChild(
        graph
    );


    card.addEventListener(
        "click",
        function () {

            switchAccount(
                account.id
            );

        }
    );


    return card;
}


/* =========================================================
   MINI GRAPH
   ========================================================= */
function createMiniGraph(
    account
) {

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "mini-graph";


    const data =
        getAccountDailyBalances(
            account
        );


    if (!data.length) {

        wrapper.innerHTML =
            `<div class="mini-graph-empty">
                No transactions
             </div>`;

        return wrapper;
    }


    const width = 300;
    const height = 80;


    const values =
        data.map(
            item =>
                item.balance
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

        if (data.length === 1) {
            return width / 2;
        }

        return (
            index /
            (data.length - 1)
        ) * width;
    }


    function y(value) {

        return (
            (top - value) /
            (top - bottom)
        ) * height;
    }


    let positivePath = "";
    let negativePath = "";


    for (
        let i = 0;
        i < data.length - 1;
        i++
    ) {

        const v1 =
            data[i].balance;

        const v2 =
            data[i + 1].balance;


        const x1 =
            x(i);

        const y1 =
            y(v1);

        const x2 =
            x(i + 1);

        const y2 =
            y(v2);


        /*
         * Entire segment is positive
         * or exactly zero.
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
         * Entire segment is negative.
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
        const denominator =
            Math.abs(v1) +
            Math.abs(v2);


        const fraction =
            denominator === 0
                ? 0
                : Math.abs(v1) /
                  denominator;


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
     * Only one date.
     */
    if (data.length === 1) {

        const px =
            x(0);

        const py =
            y(data[0].balance);


        if (
            data[0].balance >= 0
        ) {

            positivePath =
                `M ${px} ${py}`;

        } else {

            negativePath =
                `M ${px} ${py}`;
        }
    }


    const zeroY =
        y(0);


    wrapper.innerHTML = `
        <svg
            viewBox="0 0 ${width} ${height}"
            preserveAspectRatio="none"
            aria-hidden="true">

            <line
                x1="0"
                y1="${zeroY}"
                x2="${width}"
                y2="${zeroY}"
                stroke="#555"
                stroke-width="1"
                stroke-dasharray="3 3">
            </line>

            <path
                d="${positivePath}"
                fill="none"
                stroke="#45d483"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round">
            </path>

            <path
                d="${negativePath}"
                fill="none"
                stroke="#ff453a"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round">
            </path>

        </svg>
    `;


    return wrapper;
}


function balanceColor(value) {

    return value < 0
        ? "#ff453a"
        : "#45d483";
}


/* =========================================================
   EDIT ACCOUNT
   ========================================================= */

function openEditAccount() {

    if (allAccountsMode) {
        return;
    }


    const account =
        getCurrentAccount();


    if (!account) {
        return;
    }


    const modal =
        document.getElementById(
            "accountModal"
        );

    const input =
        document.getElementById(
            "accountNameInput"
        );


    input.value =
        account.name;


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


function closeEditAccount() {

    const modal =
        document.getElementById(
            "accountModal"
        );

    modal.classList.remove(
        "open"
    );
}


function saveAccountName() {

    const account =
        getCurrentAccount();


    if (!account) {
        return;
    }


    const input =
        document.getElementById(
            "accountNameInput"
        );


    const name =
        input.value.trim();


    if (!name) {

        input.focus();

        return;
    }


    account.name =
        name;


    saveAccountData();


    closeEditAccount();


    renderAccountTabs();


    /*
     * The account screen itself doesn't
     * need a complete redraw here.
     */
}


function createAccountModal() {

    if (
        document.getElementById(
            "accountModal"
        )
    ) {
        return;
    }


    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "accountModal";

    modal.className =
        "modal";


    modal.innerHTML = `
        <div class="form-card">

            <div class="drag-bar"></div>

            <div class="form-header">

                <div class="form-title">
                    Edit Account
                </div>

                <button
                    class="close-button"
                    id="accountCloseButton">
                    ×
                </button>

            </div>


            <div class="field">

                <label
                    class="field-label"
                    for="accountNameInput">
                    Account name
                </label>

                <input
                    id="accountNameInput"
                    class="text-input"
                    type="text"
                    autocomplete="off"
                    maxlength="40"
                    placeholder="Account name">

            </div>


            <div class="form-actions">

                <button
                    class="cancel-button"
                    id="accountCancelButton">
                    Cancel
                </button>

                <button
                    class="save-button"
                    id="accountSaveButton">
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
            "accountCloseButton"
        )
        .addEventListener(
            "click",
            closeEditAccount
        );


    document
        .getElementById(
            "accountCancelButton"
        )
        .addEventListener(
            "click",
            closeEditAccount
        );


    document
        .getElementById(
            "accountSaveButton"
        )
        .addEventListener(
            "click",
            saveAccountName
        );


    document
        .getElementById(
            "accountNameInput"
        )
        .addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    saveAccountName();

                }

                if (
                    event.key ===
                    "Escape"
                ) {

                    event.preventDefault();

                    closeEditAccount();

                }

            }
        );
}


/* =========================================================
   KEEP ORIGINAL APP SYNCHRONIZED
   ========================================================= */

function installTransactionSync() {

    /*
     * The existing application calls
     * renderTransactions() after:
     *
     * - adding
     * - editing
     * - deleting
     *
     * Wrap that function so the active
     * account is always saved.
     */

    const originalRender =
        renderTransactions;


renderTransactions =
    function () {

        syncCurrentTransactions();

        saveAccountData();

        originalRender();

        renderAccountTabs();

        /*
         * After adding, editing or deleting
         * a transaction, return to the top.
         */
        if (!allAccountsMode) {
            window.scrollTo(0, 0);
        }

    };
}


/* =========================================================
   START
   ========================================================= */

function initializeAccounts() {

    /*
     * Load local data first.
     */

    loadAccountData();


    /*
     * Put the selected account's
     * transactions into the original
     * application's transaction array.
     */

    const account =
        getCurrentAccount();


    if (account) {

        transactions =
            account.transactions;

    } else {

        currentAccountId =
            "account1";

        transactions =
            accounts[0]
                .transactions;

    }


    createAccountModal();


    installTransactionSync();


    renderAccountTabs();


    /*
     * Re-render using the selected
     * account's transactions.
     */

    renderTransactions();
}


initializeAccounts();
