function updateCosts(currentLib, transactionsLib) {
    let records         = currentLib.entries();
    let transactions    = transactionsLib.entries();

    function parsePerUnit(value) {
        if (!value) return 0;
        const cleaned = value.replace(/[^\d.-]/g, ''); // Remove currency symbols, letters, spaces, commas…
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    }

    records.forEach(record => {
        const currentItem = record.field('Item');
        const filtered = transactions
            .filter(t => t.field('Item') === currentItem) // Match "Item"
        .sort((a, b) => new Date(b.field('Date')) - new Date(a.field('Date'))) // newest first
        .slice(0, 5); // Keep latest 5
        const sum = filtered.reduce(
        (acc, t) => acc + parsePerUnit(t.field('Per Unit')),
            0
        );
        const avg = filtered.length ? sum / filtered.length : 0;
        record.set('Cost', avg.toFixed(2));
    });
}

