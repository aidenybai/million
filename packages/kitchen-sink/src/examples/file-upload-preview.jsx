import React, { useState } from 'react';
import { block } from 'million/react';

export default function File() {
  const [file, setFile] = useState();
  function getFile(event) {
    setFile(URL.createObjectURL(event.target.files[0]));
  }

  const FileUpload=block(({file})=>{
    console.log(file)
    return(
      <div className='preview' >
      <img src={file} />
      </div>
    )
  })
  return (
    <div >
        <div>
         <input type="file" onChange={getFile}></input> 
        </div>
         <div style={{height:200,width:200,padding:10}}>
         <FileUpload file={file}/>
         </div>
    </div>
  );
}
