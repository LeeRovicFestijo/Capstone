import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; 
import 'swiper/swiper-bundle.css'
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from 'swiper/modules'; 
import "swiper/css"; 
import { toast, Flip } from 'react-toastify';
import MainLayout from '../layout/MainLayout'
import { useEcommerce } from "../Api/EcommerceApi";
import Sdata from "../components/MainPage/Sdata";
import "../style/slider-style.css";
import "../style/new-arrival-style.css";
import "../style/wrapper-style.css";

function MainPage() {
    const { cart, setCart, totalAmount, setTotalAmount, selectedCustomer, setSelectedCustomer, selectedCustomerLocal, setIsCustomerAdded, persistedUser, payment, customerName, setCustomerName, placeholderImage } = useEcommerce();
    const [newArrivals, setNewArrivals] = useState([]);
    const [shopItems, setShopItems] = useState([]);
    const [displayedItems, setDisplayedItems] = useState([]); 
    const [itemsToShow, setItemsToShow] = useState(20);
    const [isLoading, setIsLoading] = useState(false);

    const data = [
        {
          cover: <i className="fa-solid fa-truck-fast"></i>,
          title: "Fast Delivery",
          decs: "Your Trusted Delivery Partner.",
        },
        {
          cover: <i className="fa-solid fa-id-card"></i>,
          title: "Safe Payment",
          decs: "Ensure your payment security.",
        },
        {
          cover: <i className="fa-solid fa-shield"></i>,
          title: "Shop With Confidence",
          decs: "Products and all in good quality.",
        },
        {
          cover: <i className="fa-solid fa-headset"></i>,
          title: "Good Customer Service",
          decs: "Products are offered at affordable prices.",
        },
    ];

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
    
    // const [isProfileOpen, setIsProfileOpen] = useState(false); 

    // useEffect(() => {
    //   const handleScroll = () => {
    //     const search = document.querySelector(".search");
    //     search.classList.toggle("active", window.scrollY > 100);
    //   };
  
    //   window.addEventListener("scroll", handleScroll);
    //   return () => window.removeEventListener("scroll", handleScroll);
    // }, []);

    const fetchNewArrivals = async () => {
        setIsLoading(true);
        try {
        const result = await axios.get('http://localhost:5001/api/new-arrivals'); 
        setNewArrivals(result.data);
        } catch (error) {
        console.error('Error fetching products:', error);
        } finally {
        setIsLoading(false);
        }
    };

    const fetchShopItems = async () => {
        setIsLoading(true);
        try {
        const result = await axios.get('http://localhost:5001/api/shop-items'); 
        setShopItems(result.data);
        setDisplayedItems(result.data.slice(0, itemsToShow));
        } catch (error) {
        console.error('Error fetching products:', error);
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNewArrivals();
        fetchShopItems();
      }, []);

    const chunkArray = (arr, chunkSize) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
          chunks.push(arr.slice(i, i + chunkSize));
        }
        return chunks;
    };
      
    const chunkedArrivals = chunkArray(newArrivals, 5);

    const handleLoadClick = () => {
        const newItemsToShow = itemsToShow + 20;
        setItemsToShow(newItemsToShow);
        setDisplayedItems(shopItems.slice(0, newItemsToShow));

        if (newItemsToShow >= 80 || newItemsToShow >= shopItems.length) {
            setItemsToShow(Math.min(80, shopItems.length)); 
        }
    };

    const addProduct = async (product) => {
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
        console.log(cart);
    };

  return (
    <MainLayout>
        <section className='home'>
            <section className='homeSlide'>
                <div className='container'>
                    <Swiper
                        modules={[Autoplay, Navigation, Pagination]} 
                        spaceBetween={30}
                        slidesPerView={1}
                        autoplay={{ delay: 3000, disableOnInteraction: false }} 
                        pagination={{ clickable: true }}
                        navigation={false}
                        className="swiper-container"
                    >
                        {Sdata.map((item, index) => (
                            <SwiperSlide key={index}>
                                <div className='box d_flex top'>
                                    <div className='left'>
                                        <h1>{item.title}</h1>
                                        <p>{item.desc}</p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>
        </section>

        <section className='NewArrivals mt-4'>
            <div className='container'>
                <div className='d-flex justify-content-between align-items-center'>
                    <div className='heading-left'>
                        <h2>New Arrivals</h2>
                    </div>
                </div>
                <div className='content product'>
                    <Swiper
                        modules={[Autoplay, Navigation, Pagination]} 
                        spaceBetween={30}
                        slidesPerView={1}
                        autoplay={{ delay: 3000, disableOnInteraction: false }} 
                        pagination={{ clickable: true }}
                        navigation={false}
                        className="swiper-container"
                    >
                        {chunkedArrivals.map((chunk, index) => (
                            <SwiperSlide key={index}>
                                <div className="card-container">
                                    {chunk.map((val, idx) => (
                                        <div className="box product-box" key={idx}>
                                            <div className="card" onClick={() => addProduct(val)}>
                                            <div className='img'>
                                                <img 
                                                    src={val.item_image ? val.item_image : placeholderImage} 
                                                    alt='' 
                                                    className='product-image' 
                                                />
                                            </div>
                                            <h6 className="card-title text-truncate mt-2">{val.item_description}</h6>
                                            <p>Qty: {val.quality_stocks !== 0 ? val.quality_stocks : 'Out of Stock'}</p>
                                            <p><strong>₱{val.unit_price}</strong></p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>

        {/* This section is top items */}

        <section className='shop mt-4'>
            <div className='container'>
                <div className='d-flex justify-content-between align-items-center'>
                    <div className='heading-left'>
                        <h2>Shop</h2>
                    </div>
                </div>
                <div className='content grid product'>
                    {displayedItems.map((val, index) => (
                        <div className='box product-box' key={index}>
                            <div className="card" onClick={() => addProduct(val)}>
                                <div className='img'>
                                    <img 
                                        src={val.item_image ? val.item_image : placeholderImage} 
                                        alt='' 
                                        className='product-image' 
                                    />
                                </div>
                                <h6 className="card-title text-truncate mt-2">{val.item_description}</h6>
                                <p>Qty: {val.quality_stocks !== 0 ? val.quality_stocks : 'Out of Stock'}</p>
                                <p><strong>₱{val.unit_price}</strong></p>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    {itemsToShow < Math.min(80, shopItems.length) ? (
                        <button className="btn-primary" onClick={handleLoadClick}>Load More</button>
                    ) : (
                        <p>You have reached the end. Do a search to keep exploring!</p>
                    )}
                </div>
            </div>
        </section>

        <section className="wrapper background">
            <div className="container grid2">
                {data.map((val) => {
                return (
                    <div className="product" key={val.title}>
                    <div className="img icon-circle">
                        {val.cover}
                    </div>
                    <h3>{val.title}</h3>
                    <p>{val.decs}</p>
                    </div>
                );
                })}
            </div>
        </section>
    </MainLayout>
  )
}

export default MainPage