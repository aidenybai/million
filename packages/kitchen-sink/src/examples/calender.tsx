import { useState } from 'react'; 
import { block } from 'million/react';

const Calender = block(() => {
    const [date, setDate]= useState<string | null>(null); 
    
    console.log("Date", date); 
    
    return( 
    <div className="main"> 
    <h1>Calender</h1>
    <input type="date" 
    className='ui-datepicker 
    {
        background: #999;
    }'
    onChange={e=>setDate(e.target.value)} />
    <h3>Selected Date: {date} </h3>  
    </div> 
    );  
 }); 
    

export default Calender;