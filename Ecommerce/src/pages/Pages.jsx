import React from "react"
import Home from "../components/MainPage/Home"
import FlashDeals from "../components/flashDeals/FlashDeals"
import TopCate from "../components/top/TopCate"
import NewArrivals from "../components/newarrivals/NewArrivals"
import Shop from "../components/shops/Shop"
import Wrapper from "../components/wrapper/Wrapper"

const Pages = ({ productItems, addToCart, CartItem, shopItems }) => {
  return (
    <>
      <Home CartItem={CartItem} />
      <FlashDeals productItems={productItems} addToCart={addToCart} />
      <TopCate />
      <NewArrivals />
      <Shop shopItems={shopItems} addToCart={addToCart} />
      <Wrapper />
    </>
  )
}

export default Pages
