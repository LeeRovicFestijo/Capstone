import React, { useEffect, useState, useRef } from 'react'
import axios from "axios"
import { toast, Flip } from 'react-toastify';
import { ComponentToPrint } from '../components/ComponentToPrint';
import { useReactToPrint } from 'react-to-print';
import '../components/pos-style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import SidebarPOS from '../components/SidebarPOS';

function POSPage() {

    const [product, setProduct] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [collapsedItemIndex, setCollapsedItemIndex] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const scrollableRef = useRef(null);
    const [selectedCategory, setSelectedCategory] = useState(''); 
    const [categories, setCategories] = useState([]);
    const [lastScrollPosition, setLastScrollPosition] = useState(0);


    const toastOptions = {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Flip,
    }

    const fetchproducts = async() => {
        setIsLoading(true);
        const result = await axios.get('product');
        const products = await result.data
        setProduct(products);
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        setCategories(uniqueCategories);
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

        }else{
            let addingProduct = {
                ...product,
                'quantity': 1,
                'totalAmount': product.price,
            }
            setCart([...cart, addingProduct]);
            toast.success(`Added ${product.name} to cart`, toastOptions);
        }
    }

    const removeProduct = async(product) => {
        const newCart = cart.filter(cartItem => cartItem.id !== product.id);
        setCart(newCart);
    }

    const updateQuantity = (productId, newQuantity) => {
        const newCart = cart.map(cartItem => {
            if (cartItem.id === productId) {
                return {
                    ...cartItem,
                    quantity: newQuantity,
                    totalAmount: cartItem.price * newQuantity
                }
            }
            return cartItem;
        });
        setCart(newCart);
    }

    const componentRef = useRef();

    const handleReactToPrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handlePrint = () => {
        handleReactToPrint();
    };

    useEffect( ()=> {
        fetchproducts();
    },[]);

    useEffect(()=> {
        let newTotalAmount = 0;
        cart.forEach(icart =>{
            newTotalAmount = newTotalAmount + parseFloat(icart.totalAmount);
        })
        setTotalAmount(parseFloat(newTotalAmount.toFixed(2)));
    },[cart]);

    useEffect(() => {
        if (cart.length > 0) {
            scrollableRef.current.scrollTo({ top: scrollableRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [cart]);

    const handleQuantityChange = (productId, newQuantity) => {
        setLastScrollPosition(scrollableRef.current.scrollTop); 
        updateQuantity(productId, newQuantity);
        setTimeout(() => {
            scrollableRef.current.scrollTo({ top: lastScrollPosition, behavior: 'smooth' });
        }, 10);
    };

    const handleRemoveChange = (cartProduct) => {
        setLastScrollPosition(scrollableRef.current.scrollTop); 
        removeProduct(cartProduct);
        setTimeout(() => {
            scrollableRef.current.scrollTo({ top: lastScrollPosition, behavior: 'smooth' });
        }, 10);
    };

    const filteredProducts = product.filter((prod) =>
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategory === '' || prod.category === selectedCategory)
    );

    const scrollCategories = (direction) => {
        const container = document.querySelector('.category-scroll-container');
        const scrollAmount = 100; 
    
        if (direction === 'left') {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else if (direction === 'right') {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
    

    return (
        <SidebarPOS>
            <div className='row' style={{ height: '91vh' }}>
                <div className="col-lg-8 bg-light p-3 border border-gray">
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Search for a product..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                <div className='col-lg-12'>
                    <div className="position-relative">

                        <nav className="mb-3 bg-white p-2" style={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
                            <div className="d-flex align-items-center">
                                <button
                                    className="btn btn-outline-secondary"
                                    style={{ flexShrink: 0 }}
                                    onClick={() => scrollCategories('left')}
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </button>

                                <div className="category-scroll-container d-flex flex-grow-1 overflow-auto">
                                    <ul className="nav nav-pills m-0">
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${selectedCategory === '' ? 'active' : ''}`}
                                                onClick={() => setSelectedCategory('')}
                                            >
                                                All
                                            </button>
                                        </li>
                                        {categories.map((category, index) => (
                                            <li className="nav-item" key={index}>
                                                <button
                                                    className={`nav-link ${selectedCategory === category ? 'active' : ''}`}
                                                    onClick={() => setSelectedCategory(category)}
                                                >
                                                    {category}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    className="btn btn-outline-secondary"
                                    style={{ flexShrink: 0 }}
                                    onClick={() => scrollCategories('right')}
                                >
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>

                    <div className='scrollable-container-items'>
                        {isLoading ? (
                            'Loading'
                        ) : (
                            <div className="row">
                                {filteredProducts.map((product, key) => (
                                    <div className="col-lg-3 mb-3" key={key}>
                                        <div
                                            className="card d-flex align-items-center justify-content-center text-center"
                                            style={{ 
                                                height: '100%', 
                                                border: 'none', 
                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
                                                cursor:'pointer' 
                                            }}
                                            onClick={() => addProductToCart(product)}
                                        >
                                            <h6
                                                className="card-title text-truncate"
                                                style={{ maxWidth: '120px' }}
                                            >
                                                {product.name}
                                            </h6>
                                            <p>cat: {product.category} stk: {product.stock}</p>
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
                <div className="col-lg-4 border border-gray rounded-right p-3 d-flex flex-column">
                    <div style={{ display: 'none' }}>
                        <ComponentToPrint cart={cart} totalAmount={totalAmount} ref={componentRef} />
                    </div>

                    <div className='col-lg-12'>
                        <div className="d-flex justify-content-between">
                            <button className="btn custom-btn-add-customer" onClick={() => setCart([])}>
                                <i className='bi bi-plus-square'/> Add Customer
                            </button>
                            <button className="btn custom-btn-reset" onClick={() => setCart([])}>
                                <FontAwesomeIcon icon={faSyncAlt} /> Reset
                            </button>
                        </div>
                        <hr />
                    </div>

                    <div className="table-responsive bg-white flex-grow-1">

                        <div className="scrollable-container-order" ref={scrollableRef}>
                            {cart.length > 0 ? (
                                cart.map((cartProduct, key) => (
                                <React.Fragment key={key}>
                                    <div
                                    className="list-item"
                                    style={{
                                        backgroundColor: key % 2 === 0 ? 'white' : '#f8f9fa',
                                        borderRadius: '10px',
                                    }}
                                    >
                                        <div className="d-flex align-items-center p-3">
                                            <i
                                            className={`bi ${collapsedItemIndex === key ? 'bi-chevron-down' : 'bi-chevron-right'}`}
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#collapse${key}`}
                                            style={{ cursor: 'pointer' }}
                                            aria-expanded={collapsedItemIndex === key}
                                            aria-controls={`collapse${key}`}
                                            onClick={() => setCollapsedItemIndex(collapsedItemIndex === key ? null : key)}
                                            ></i>

                                            <div className="mx-2">{cartProduct.quantity}</div>
                                            <div className="flex-grow-1 mx-2">{cartProduct.name}</div>
                                            <div className="mx-2">₱{cartProduct.totalAmount.toFixed(2)}</div>

                                            <i
                                            className={`bi ${hoveredIndex === key ? 'bi-x-circle-fill' : 'bi-x-circle'}`}
                                            onMouseEnter={() => setHoveredIndex(key)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                            style={{ color: 'red', cursor: 'pointer' }}
                                            onClick={() => handleRemoveChange(cartProduct)}
                                            ></i>

                                        </div>

                                        <div
                                            className={`collapse ${collapsedItemIndex === key ? 'show' : ''}`}
                                            id={`collapse${key}`}
                                            style={{
                                                backgroundColor: key % 2 === 0 ? 'white' : '#f8f9fa',
                                            }}
                                        >
                                            <div className="d-flex align-items-center justify-content-center p-2">
                                                <button
                                                    className="btn btn-outline-secondary btn-sm mx-2"
                                                    onClick={() => handleQuantityChange(cartProduct.id, cartProduct.quantity - 1)}
                                                    disabled={cartProduct.quantity <= 1}
                                                >
                                                    <i className="bi bi-dash-circle"></i>
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="form-control text-center"
                                                    style={{ width: '80px', MozAppearance: 'textfield', WebkitAppearance: 'none', margin: 0 }}
                                                    value={cartProduct.quantity}
                                                    onChange={(e) => handleQuantityChange(cartProduct.id, parseInt(e.target.value))}
                                                />
                                                <button
                                                    className="btn btn-outline-secondary btn-sm mx-2"
                                                    onClick={() => handleQuantityChange(cartProduct.id, cartProduct.quantity + 1)}
                                                >
                                                    <i className="bi bi-plus-circle"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                                ))
                            ) : (
                                <div></div>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-0">
                        <hr />
                        <div className="d-flex justify-content-between align-items-center px-2 text-primary mt-2">
                            <h4 className="mb-0 text-black">Total Amount</h4>
                            <h4 className="mb-0 text-black">₱{totalAmount.toFixed(2)}</h4>
                        </div>
                        <button className="btn custom-btn-proceed mt-2" onClick={handlePrint}>
                            <i className='bi bi-arrow-right-circle'/> Checkout
                        </button>
                    </div>
                </div>
            </div>
        </SidebarPOS>
    )
}

export default POSPage
