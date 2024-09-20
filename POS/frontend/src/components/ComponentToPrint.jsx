import React from "react";

export const ComponentToPrint = React.forwardRef((props, ref) => {

    const {cart, totalAmount, customerName, paymentMethod, shippingAddress} = props;
    
    return (
      <div ref={ref} className="p-5">
        <h3>Customer: {customerName ? customerName : 'N/A'}</h3>
        <h4>Payment Method: {paymentMethod ? paymentMethod : 'N/A'}</h4>
        <h4>Shipping Address: {shippingAddress ? shippingAddress : 'N/A'}</h4>

        <table className='table'>
            <thead>
                <tr>
                    <td>#</td>
                    <td>Name</td>
                    <td>Price</td>
                    <td>Quantity</td>
                    <td>Total</td>
                </tr>
            </thead>
            <tbody>
                {cart ? cart.map((cartProduct, key) => <tr key={key}>
                    <td>{cartProduct.id}</td>
                    <td>{cartProduct.name}</td>
                    <td>{cartProduct.price}</td>
                    <td>{cartProduct.quantity}</td>
                    <td>{cartProduct.totalAmount}</td>
                </tr>)

                : ''
                }
            </tbody>
        </table>
        <h2 className='px-2'>Total Amount: ₱{totalAmount}</h2>
      </div>
    );
  });