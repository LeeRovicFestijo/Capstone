import React, { useEffect, useState } from 'react'
import MainLayout from '../layout/MainLayout'
import axios from "axios"
import { toast } from 'react-toastify';
import { ComponentToPrint } from '../components/ComponentToPrint';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import '../components/Scrollbar.css';

function POSPage() {

    const [product, setProduct] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const toastOptions = {
        autoClose: 500,
        pauseOnHover: true
    }

    const fetchproducts = async() => {
        setIsLoading(true);
        const result = await axios.get('product');
        setProduct(await result.data);
        setIsLoading(false);
    }

    const addProductToCart = async(product) => {
        let findProductInCart = await cart.find(i=>{
            return i.id === product.id
        });

        if(findProductInCart){
            let newCart = [];
            let newItem = [];

            cart.forEach(cartItem => {
                if(cartItem.id === product.id) {
                    newItem = {
                        ...cartItem,
                        quantity: cartItem.quantity + 1,
                        totalAmount: cartItem.price * (cartItem.quantity + 1)
                    }
                    newCart.push(newItem);
                }else {
                    newCart.push(cartItem);
                }
            });

            setCart(newCart);
            toast(`Added ${newItem.name} to cart`, toastOptions)

        }else{
            let addingProduct = {
                ...product,
                'quantity': 1,
                'totalAmount': product.price,
            }
            setCart([...cart, addingProduct]);
            toast(`Added ${product.name} to cart`, toastOptions)
        }
    }

    const removeProduct = async(product) => {
        const newCart = cart.filter(cartItem => cartItem.id !== product.id);
        setCart(newCart);
    }
    
    const componentRef = useRef();

    const handleReactToPrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handlePrint = () => {
        handleReactToPrint();
    }

    useEffect( ()=> {
        fetchproducts();
    },[]);

    useEffect(()=> {
        let newTotalAmount = 0;
        cart.forEach(icart =>{
            newTotalAmount = newTotalAmount + parseInt(icart.totalAmount);
        })
        setTotalAmount(newTotalAmount);
    },[cart]);

    const filteredProducts = product.filter((prod) =>
        prod.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <MainLayout>
        <div className='row'>
        <div className="col-lg-8">
                <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Search for a product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className='scrollable-container-items'>
                    {isLoading ? (
                        'Loading'
                    ) : (
                        <div className="row">
                            {filteredProducts.map((product, key) => (
                                <div className="col-lg-3 mb-3" key={key}>
                                    <div
                                        className="card d-flex align-items-center justify-content-center text-center"
                                        style={{ height: '100%' }}
                                        onClick={() => addProductToCart(product)}
                                    >
                                        <h5
                                            className="card-title text-truncate"
                                            style={{ maxWidth: '150px' }}
                                        >
                                            {product.name}
                                        </h5>
                                        <p>{product.category}</p>
                                        <p>
                                            <strong>₱{product.price}</strong>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="col-lg-4">
                <div style={{ display: 'none' }}>
                    <ComponentToPrint cart={cart} totalAmount={totalAmount} ref={componentRef} />
                </div>

                <div className="table-responsive bg-dark">
                    <table className="table table-dark table-hover mb-1">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                    </table>

                    <div className='scrollable-container-order'>
                        <table className="table table-dark table-hover mb-0">
                            <tbody>
                                {cart.length > 0 ? (
                                    cart.map((cartProduct, key) => (
                                        <tr key={key}>
                                            <td>{cartProduct.id}</td>
                                            <td>{cartProduct.name}</td>
                                            <td>{cartProduct.price}</td>
                                            <td>{cartProduct.quantity}</td>
                                            <td>{cartProduct.totalAmount}</td>
                                            <td>
                                                <button
                                                    className="btn btn-danger btn-small"
                                                    onClick={() => removeProduct(cartProduct)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">No Item in Cart</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <h4 className="px-2 text-white mt-2">Total Amount: ₱{totalAmount}</h4>
                    <div className="mt-3">
                        {totalAmount !== 0 && (
                            <button className="btn btn-primary" onClick={handlePrint}>
                                Proceed
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </MainLayout>
  )
}

export default POSPage