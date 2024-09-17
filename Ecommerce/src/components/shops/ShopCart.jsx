import React, { useState } from "react"

const ShopCart = ({ shopItems, addToCart }) => {
  const [count, setCount] = useState(0)
  const increment = () => {
    setCount(count + 1)
  }

  return (
    <>
      {shopItems.map((shopItem, index) => {
        return (
          <div className='product mtop'>
          <div className='img'>
            <img src={shopItem.cover} alt={shopItem.name} />
            <div className='product-like'>
              <label>{count}</label> <br />
              <i className='fa-regular fa-heart' onClick={increment}></i>
            </div>
          </div>
          <div className='product-details'>
            <h3 className='product-name'>{shopItem.name}</h3>
            <div className='price'>
              <h4>₱{shopItem.price}</h4>
              <button onClick={() => addToCart(shopItem)} className='cart-button'>
                <i className='fa fa-shopping-cart'></i>
              </button>
            </div>
          </div>
        </div>
        
        )
      })}
    </>
  )
}

export default ShopCart
