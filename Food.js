function parsePerUnit(value) {
    if (!value) return 0;
    const cleaned = value.replace(/[^\d.-]/g, ''); // Remove currency symbols, letters, spaces, commas
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

function updateCosts(currentLib, transactionsLib) {
    let records      = currentLib.entries();
    let transactions = transactionsLib.entries();

    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    records.forEach(record => {
        const currentItem = record.field('Item');
        if (!currentItem) return;

        // Filter by matching Item and within last 3 months
        let filtered = transactions
            .filter(t => {
                const tItem = t.field('Item');
                const tDate = new Date(t.field('Date'));
                return tItem === currentItem && tDate >= threeMonthsAgo;
            })
            .sort((a, b) => new Date(b.field('Date')) - new Date(a.field('Date')));

        // If no transactions in last 3 months, take the most recent one
        if (filtered.length === 0) {
            filtered = transactions
                .filter(t => t.field('Item') === currentItem)
                .sort((a, b) => new Date(b.field('Date')) - new Date(a.field('Date')))
                .slice(0, 1);
        } else {
            // Otherwise, keep up to 5 recent ones within the 3-month window
            filtered = filtered.slice(0, 5);
        }

        // Calculate average Per Unit
        const sum = filtered.reduce(
            (acc, t) => acc + parsePerUnit(t.field('Per Unit')),
            0
        );

        const avg = filtered.length ? sum / filtered.length : 0;

        // Update the Cost (100g) field
        record.set('Cost (100g)', (avg / 10).toFixed(2));
    });
}

function averageCosts(currentLib, productsLib) {
    let records  = currentLib.entries();
    let products = productsLib.entries();

    records.forEach(record => {
        const currentItem    = record.field('Item');
        const currentDetails = record.field('Details');
        if (!currentItem) return;

        // Filter matching products by both Item and Details
        const matchingProducts = products.filter(p =>
            p.field('Item') === currentItem &&
            p.field('Details') === currentDetails
        );

        // Parse and average Cost (100g)
        const sum = matchingProducts.reduce((acc, p) => {
            const cost = parsePerUnit(p.field('Cost (100g)')); // reuse your parsePerUnit
            return acc + cost;
        }, 0);

        const avg = matchingProducts.length ? sum / matchingProducts.length : 0;

        // Update the Cost (100g) field
        record.set('Cost (100g)', avg.toFixed(2));
    });
}

