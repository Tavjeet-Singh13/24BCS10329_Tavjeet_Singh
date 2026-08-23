import {useMemo, useState} from "react";
import {products} from "./productsData";
import {useSearchParams} from "react-router-dom";

const ProductCatalog = () => {
    const [serarchParams, setSerarchParams] = useSearchParams();
    const category = serarchParams.get('category');
    const maxPrice = serarchParams.get('maxPrice');

    const result = useMemo(() => {
        if(category === null && maxPrice === null) {
            return products;
        }
        else{
            console.log(maxPrice, category);
            const filter = products.filter(item => {
                if(item.category === category && item.price <= maxPrice) {
                    return item
                }
            })
            return filter;
        }
    }, [category, maxPrice]);

    return (
        <>
            <input type={'number'} value={maxPrice}
            onChange={(e) => setSerarchParams({ maxPrice: e.target.value, category })} />

            <select value={category} onChange={(e) => setSerarchParams({ category: e.target.value, maxPrice: maxPrice })} >
                <option value={'audio'}>audio</option>
                <option value={'peripherals'}>peripherals</option>
                <option value={'display'}>display</option>
            </select>

            {result.length > 0 && result.map((item, index) => (
                <div key={index}>
                    <h1>{item.name}</h1>
                    <h1>{item.category}</h1>
                    <h1>{item.price}</h1>
                </div>

            ))}
        </>
    )
}

export default ProductCatalog;
