import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {products} from "./productsData";
const ProductDetails = () =>{
    const {productId} = useParams();
    const [arr, setArr] = useState(products);

    useEffect(()=>{
        const res = arr.filter(item => item.id === productId);
        setArr(res);
    },[])

  
    return (
        <>
            {arr.length > 0 && arr.map((item,index)=>(
                <div key={index}>
                    <h1>{item.name}</h1>
                    <h1>{item.category}</h1>
                    <h1>{item.price}</h1>
                </div>
            ))}
        </>
    )
}

export default ProductDetails;
