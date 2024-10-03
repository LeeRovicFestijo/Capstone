import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { toast, Flip } from 'react-toastify';
import { usePOS } from '../api/POSProvider';
import '../components/pos-style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import SidebarPOS from '../components/SidebarPOS'; 
import ProceedModal from '../components/ProceedModal';

function POSPage() {

    const { cart, setCart, totalAmount, setTotalAmount, selectedCustomer, setSelectedCustomer, selectedCustomerLocal, setIsCustomerAdded, persistedUser, payment, customerName, setCustomerName } = usePOS();
    const [product, setProduct] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [collapsedItemIndex, setCollapsedItemIndex] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const scrollableRef = useRef(null);
    const [lastScrollPosition, setLastScrollPosition] = useState(0);
    const [isProceedModalOpen, setProceedModalOpen] = useState(false);
    const navigate = useNavigate();


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

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const result = await axios.get('http://localhost:5001/api/products'); 
            setProduct(result.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products', toastOptions);
        } finally {
            setIsLoading(false);
        }
    };

    const addProductToCart = async (product) => {
        let findProductInCart = cart.find(i => i.item_id === product.item_id);

        if (findProductInCart) {
            const newCart = cart.map(cartItem => {
                if (cartItem.item_id === product.item_id) {
                    return {
                        ...cartItem,
                        quantity: cartItem.quantity + 1,
                        totalAmount: cartItem.unit_price * (cartItem.quantity + 1),
                    };
                }
                return cartItem;
            });
            setCart(newCart);
        } else {
            const addingProduct = {
                ...product,
                quantity: 1,
                totalAmount: parseFloat(product.unit_price),
            };
            console.log(addingProduct);
            setCart([...cart, addingProduct]);
            toast.success(`Added ${product.item_description} to cart`, toastOptions);
        }
    };

    const removeProduct = async(product) => {
        const newCart = cart.filter(cartItem => cartItem.item_id !== product.item_id);
        setCart(newCart);
    }

    const updateQuantity = (productId, newQuantity) => {
        const newCart = cart.map(cartItem => {
            if (cartItem.item_id === productId) {
                const newTotalAmount = cartItem.unit_price * newQuantity;
                console.log(`Updated Total Amount: ${newTotalAmount}`);
                return {
                    ...cartItem,
                    quantity: newQuantity,
                    totalAmount: cartItem.unit_price * newQuantity
                }
            }
            return cartItem;
        });
        setCart(newCart);
    }

    const handleOpenProceedModal = () => {
        if (!selectedCustomer) {
            toast.error('A customer must be selected before proceeding.', toastOptions);
            return;
        }
        if (cart.length === 0) {
            toast.error('Your cart is empty. Please add items to the cart before proceeding.', toastOptions);
            return;
        }
        if (selectedCustomer) {
            setCustomerName(selectedCustomer.customer_name);
        }
        setProceedModalOpen(true);
    };

    const handleCloseProceedModal = () => {
        setProceedModalOpen(false);
    };

    const handleAddCustomer = () => {
        if (selectedCustomer) {
          navigate('/customers', { state: { newCustomer: selectedCustomer } });
        } else {
            navigate('/customers');
        }
    };

    useEffect(() => {
        setCustomerName(selectedCustomer?.fullName || '');
    }, [selectedCustomer]);

    useEffect( ()=> {
        fetchProducts();
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

    useEffect(() => {
        if (selectedCustomer) {
            console.log('Selected customer:3', selectedCustomer);
        }
    }, [selectedCustomer]);

    const handleRemoveCustomer = () => {
        console.log(selectedCustomer);
        if (selectedCustomer) {
            if (selectedCustomer.customer_id === selectedCustomerLocal.customer_id) {
                console.log(selectedCustomer)
                navigate('/customers', { state: { newCustomer: selectedCustomer } });
                setSelectedCustomer(null);
                setIsCustomerAdded(false);
            } else {
                console.log(selectedCustomer)
                navigate('/customers', { state: { newCustomer: selectedCustomer } });
                setSelectedCustomer(null);
                setIsCustomerAdded(true);
            }
        }
    };

    const handleQuantityChange = (productId, newQuantity) => {
        setLastScrollPosition(scrollableRef.current.scrollTop); 
        updateQuantity(productId, newQuantity);
        setTimeout(() => {
            scrollableRef.current.scrollTo({ top: lastScrollPosition, behavior: 'smooth' });
        }, 10);
    };

    const handleRemoveChange = (cartProduct) => {
        console.log("titi")
        setLastScrollPosition(scrollableRef.current.scrollTop); 
        removeProduct(cartProduct);
        setTimeout(() => {
            scrollableRef.current.scrollTo({ top: lastScrollPosition, behavior: 'smooth' });
        }, 10);
    };

    const filteredProducts = product.filter((prod) =>
        prod.item_description.toLowerCase().includes(searchQuery.toLowerCase()) 
    );
    

    return (
        <>
            <SidebarPOS>
                <div className='row' style={{ height: '97vh' }}>
                    <div className="col-lg-8 bg-light p-3 border border-gray">
                        <input
                            type="text"
                            className="form-control mb-3" style={{ height: '48px' }}
                            placeholder="Search for a product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        <hr />

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
                                                    className="card-title text-truncate mt-2"
                                                    style={{ maxWidth: '120px' }}
                                                >
                                                    {product.item_description}
                                                </h6>
                                                <p>Qty: {product.quality_stocks}</p>
                                                <p>
                                                    <strong>₱{product.unit_price}</strong>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-lg-4 border border-gray rounded-right p-3 d-flex flex-column">
                        <div className='col-lg-12'>
                            <div className="d-flex justify-content-between">
                                {selectedCustomer ? (
                                        <div className="customer-profile d-flex align-items-center" onClick={handleRemoveCustomer}>
                                        {selectedCustomer.profilePicture ? (
                                            <img 
                                                src={selectedCustomer.profilePicture} 
                                                alt="Customer" 
                                                style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <i className="bi bi-person-circle" style={{ fontSize: '30px' }}></i>
                                        )}
                                        <span style={{ marginLeft: '10px' }}>{selectedCustomer.customer_name}</span>
                                    </div>
                                    ) : (
                                        <button className="btn custom-btn-add-customer" onClick={handleAddCustomer}>
                                            <i className='bi bi-plus-square'/> Add Customer
                                        </button>
                                    )}
                                <button className="btn custom-btn-reset" onClick={() => setCart([])}>
                                    <FontAwesomeIcon icon={faUndo} /> Reset
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
                                                backgroundColor: key % 2 === 0 ? '#f8f9fa' : 'white',
                                                borderRadius: '10px',
                                            }}
                                        >
                                            <div className="d-flex align-items-center p-3">
                                                <FontAwesomeIcon
                                                    icon={collapsedItemIndex === key ? faChevronDown : faChevronRight}
                                                    onClick={() => setCollapsedItemIndex(collapsedItemIndex === key ? null : key)}
                                                    style={{ cursor: 'pointer' }}
                                                    aria-expanded={collapsedItemIndex === key}
                                                />

                                                <div className="mx-2">{cartProduct.quantity}</div>
                                                <div className="flex-grow-1 mx-2">{cartProduct.item_description}</div>
                                                <div className="mx-2">₱{typeof cartProduct.totalAmount === 'number' ? cartProduct.totalAmount.toFixed(2) : '0.00'}</div>

                                                <i
                                                className={`bi ${hoveredIndex === key ? 'bi-x-circle-fill' : 'bi-x-circle'}`}
                                                onMouseEnter={() => setHoveredIndex(key)}
                                                onMouseLeave={() => setHoveredIndex(null)}
                                                style={{ color: 'red', cursor: 'pointer' }}
                                                onClick={() => {
                                                    handleRemoveChange(cartProduct);
                                                    setHoveredIndex(null);
                                                    setCollapsedItemIndex(null);
                                                }}
                                                ></i>
                                            </div>

                                            <div
                                                className={`collapse ${collapsedItemIndex === key ? 'show' : ''}`}
                                                id={`collapse${key}`}
                                                style={{
                                                    backgroundColor: key % 2 === 0 ? '#f8f9fa' : 'white',
                                                }}
                                            >
                                                <div className="d-flex align-items-center justify-content-center p-2">
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm mx-2"
                                                        onClick={() => handleQuantityChange(cartProduct.item_id, cartProduct.quantity - 1)}
                                                        disabled={cartProduct.quantity <= 1 || isNaN(cartProduct.quantity)}
                                                    >
                                                        <i className="bi bi-dash-circle"></i>
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="form-control text-center"
                                                        style={{ width: '90px', MozAppearance: 'textfield', WebkitAppearance: 'none', margin: 0 }}
                                                        value={cartProduct.quantity}
                                                        onChange={(e) => handleQuantityChange(cartProduct.item_id, parseInt(e.target.value))}
                                                    />
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm mx-2"
                                                        onClick={() => {
                                                            const newQuantity = isNaN(cartProduct.quantity) ? 1 : cartProduct.quantity + 1;
                                                            handleQuantityChange(cartProduct.item_id, newQuantity);
                                                        }}
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
                                <h4 className="mb-0 text-black">₱{typeof totalAmount === 'number' ? totalAmount.toFixed(2) : '0.00'}</h4>
                            </div>
                            <button className="btn custom-btn-proceed mt-2" onClick={handleOpenProceedModal}>
                                <i className='bi bi-arrow-right-circle'/> Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </SidebarPOS>

            <ProceedModal
                isOpen={isProceedModalOpen}
                onClose={handleCloseProceedModal}
                cart={cart}
                fetchProducts={fetchProducts}
                totalAmount={totalAmount}
                customerName={customerName}
                customer={selectedCustomer ? [selectedCustomer] : []}
                account={persistedUser}
                payment={payment}
            />
        </>
    )
}

export default POSPage
