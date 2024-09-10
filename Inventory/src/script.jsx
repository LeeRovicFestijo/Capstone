document.addEventListener("DOMContentLoaded", function() {
    const inventoryData = [
        { itemDescription: 'Holcim Excel', unitPrice: '₱186.00', qtyStocks: 860, unitMeasurement: 'bags', totalCost: '₱159,960.00' },
        { itemDescription: 'G.I. Pipe 2 1/2 LS II', unitPrice: '₱3.00', qtyStocks: 120, unitMeasurement: 'pcs', totalCost: '₱360.00' },
        { itemDescription: 'G.I. Pipe 2 LS II', unitPrice: '₱1,215.00', qtyStocks: 200, unitMeasurement: 'pcs', totalCost: '₱243,000.00' },
        { itemDescription: 'Nihon Bond 1.5', unitPrice: '₱1,252.00', qtyStocks: 35, unitMeasurement: 'pcs', totalCost: '₱43,820.00' },
        { itemDescription: 'CW Nails 1', unitPrice: '₱1,270.00', qtyStocks: 25, unitMeasurement: 'boxes', totalCost: '₱31,750.00' },
        { itemDescription: 'CW Nails 1', unitPrice: '₱1,092.00', qtyStocks: 35, unitMeasurement: 'boxes', totalCost: '₱38,220.00' },
        { itemDescription: 'CW Nails 1', unitPrice: '₱1,072.00', qtyStocks: 20, unitMeasurement: 'boxes', totalCost: '₱21,440.00' },
    ];

    const inventoryBody = document.getElementById("inventoryBody");

    inventoryData.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><input type="checkbox"></td>
            <td>${item.itemDescription}</td>
            <td>${item.unitPrice}</td>
            <td>${item.qtyStocks}</td>
            <td>${item.unitMeasurement}</td>
            <td>${item.totalCost}</td>

        `;

        inventoryBody.appendChild(row);
    });
});
