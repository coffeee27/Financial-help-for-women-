import {createContext,useContext,useState} from "react";
import {initialFinanceData} from "../data/initialData";


const FinanceContext=createContext();


export function FinanceProvider({children}){


const [finance,setFinance]=useState(initialFinanceData);


return (

<FinanceContext.Provider

value={{
    finance,
    setFinance
}}

>

{children}

</FinanceContext.Provider>

);


}


export function useFinance(){

return useContext(FinanceContext);

}