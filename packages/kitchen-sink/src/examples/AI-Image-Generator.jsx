import React,{ useRef,useState} from 'react'
import { block } from 'million/react';

const  Image_generator=block(() =>{
  const [img_url,set_url]=useState("")
  let inputref=useRef(null)
  const imagegen=async()=>{
    console.log(inputref.current.value)
     if(inputref.current.value===""){return 0;}
     try{
     const response=await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":"Bearer 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"
        },
        body:JSON.stringify({
          "prompt":`${inputref.current.value}`,
          "n":2,
          "size":"512x512",
        }),  
      }
     );
     let data=await response.json();
     let data_array=data.data;
     set_url(data_array[0].url)
    }
    catch(error)
    {
      throw new Error("Failed to generate image");
    }

  }
  return (
    <div>
      <div className="ai_img_generator">
        <div className="text"><spam>AI Image Generator</spam></div>
        <div className="search">
          <input type='text' ref={inputref}  className="serach-prompt" placeholder='Describe About Image'/>
          <button className='btn-serach' onClick={()=>{imagegen()}}>Generator</button>
        </div>
        {
            img_url && 
        <div className="image" >
          <img src={img_url} alt=""/>
        </div>
}
      </div>
      
    </div>
  )
})



export const AIImagGenerator = () => {
  return (
    <Image_generator />
  )
}

export default AIImagGenerator;