import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Sell from './pages/Sell'
import About from './pages/About'
import ProductDetails from './pages/ProductDetails'
import { MarketplaceProvider } from './context/MarketplaceProvider'
import { AuthProvider } from './context/AuthProvider'
import Account from './pages/Account'
import Auth from './pages/Auth'
import { CartProvider } from './context/CartProvider'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Orders from './pages/Orders'
import Conversation from './pages/Conversation'
import './styles/global.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <CartProvider>
      <MarketplaceProvider>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/about" element={<About />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/account" element={<Account />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders/:orderId" element={<OrderConfirmation />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/deals/:conversationId" element={<Conversation />} />
          </Routes>
        </main>
        <Footer />
      </MarketplaceProvider>
      </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
