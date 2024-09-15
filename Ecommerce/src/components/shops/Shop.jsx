import React from "react"
import ShopCart from "./ShopCart"
import "./style.css"

const Shop = ({ addToCart, shopItems }) => {
  return (
    <section className='shop background'>
      <div className='container d_flex'>
        <div className='contentWidth'>
          <div className='heading d_flex'>
            <div className='heading-middle row f_flex'>
              <h2>Shop</h2>
            </div>
            <div className='heading-right row '>
              <span>View all</span>
              <i className='fa-solid fa-caret-right'></i>
            </div>
          </div>
          <div className='product-content'>
            <ShopCart addToCart={addToCart} shopItems={shopItems} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Shop
