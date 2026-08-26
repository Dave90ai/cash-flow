/* =========================================================
   CASH FLOW - adjust.js
   Adjust transaction helpers
   ========================================================= */


/* =========================================================
   IDENTIFICATION
   ========================================================= */

function isAdjust(transaction) {

    return !!(
        transaction &&
        transaction.type === "adjust"
    );
}


/* =========================================================
   ADJUST BALANCE
   ========================================================= */

function getAdjustBalance(transaction) {

    return Number(
        transaction.adjustBalance
    );
}


/* =========================================================
   TRANSACTION ID
   ========================================================= */

function getNextTransactionId() {

    let highest = 0;

    accounts.forEach(
        account => {

            account.transactions.forEach(
                transaction => {

                    const id =
                        Number(
                            transaction.id
                        );

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

    /*
     * Also consider the currently active
     * transaction array.
     */
    if (
        Array.isArray(transactions)
    ) {

        transactions.forEach(
            transaction => {

                const id =
                    Number(
                        transaction.id
                    );

                if (
                    Number.isFinite(id) &&
                    id > highest
                ) {
                    highest = id;
                }

            }
        );
    }

    return highest + 1;
}
