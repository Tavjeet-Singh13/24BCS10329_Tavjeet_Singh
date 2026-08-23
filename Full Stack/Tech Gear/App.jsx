import { useState, useEffect, useMemo } from 'react';
import ProductCatalog from "./components/ProductCatalog";
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import ProductDetails from "./components/ProductDetails";


export default function App() {
    return (
        <BrowserRouter>
            <nav>
                <Link to="/products">All Products</Link>
                <Link to="/products?category=audio">Audio Only</Link>
                <Link to="/products?maxPrice=100">Under $100</Link>
            </nav>
            <Routes>
                <Route path="/products" element={<ProductCatalog />} />
                <Route path="/products/:productId" element={<ProductDetails />} />
            </Routes>
        </BrowserRouter>
    );
}
