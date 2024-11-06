import React from "react";

export const ComponentToPrint = React.forwardRef((props, ref) => {
  const { cart, totalAmount, customerName, paymentMethod, shippingAddress } = props;
  const currentDate = new Date().toLocaleDateString();

  return (
    <div ref={ref} style={{ width: '100%', padding: '10px', marginTop: '8px', fontFamily: 'monospace' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: '0' }}>SIG BUILDERS AND CONSTRUCTION SUPPLY INC.</h3>
        <p style={{ margin: '0' }}>Poblacion 2, Sta. Teresita, Batangas</p>
        <p style={{ margin: '0' }}>Phone: 09192161595 / 09175942377</p>
        <h3 style={{ margin: '5px 0' }}>Receipt</h3>
        <p style={{ margin: '0' }}>{currentDate}</p>
      </div>

      <p style={{ margin: '2px 0' }}>Customer: {customerName? customerName : 'N/A'}</p>
      <p style={{ margin: '2px 0' }}>Payment: {paymentMethod? paymentMethod : 'N/A'}</p>
      <p style={{ margin: '2px 0' }}>Shipping: {shippingAddress? shippingAddress : 'N/A'}</p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #000', padding: '2px' }}>Items</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #000', padding: '2px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {cart && cart.length > 0 ? (
            cart.map((cartProduct, key) => (
              <tr key={key}>
                <td style={{ padding: '2px', verticalAlign: 'top' }}>
                  {cartProduct.item_description}
                  <div style={{ fontSize: '0.9em', color: '#555' }}>
                    {cartProduct.quantity} x ₱{cartProduct.unit_price}
                  </div>
                </td>
                <td style={{ textAlign: 'right', padding: '2px' }}>₱{cartProduct.totalAmount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '2px' }}>No items in the cart</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: '10px', borderTop: '1px solid #000', paddingTop: '5px' }}>
        <h3 style={{ margin: '0', textAlign: 'right' }}>Total: ₱{totalAmount}</h3>
      </div>
    </div>
  );
});