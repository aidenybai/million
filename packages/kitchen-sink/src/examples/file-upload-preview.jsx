import React, { useState } from 'react';
import { block } from 'million/react';

const FileUpload = block(({ file }) => {
  return (
    <div className="preview">
      <img src={file} alt="file-uploaded" />
    </div>
  );
});

const FileUploadPreview = () => {
  const [file, setFile] = useState();
  function getFile(event) {
    setFile(URL.createObjectURL(event.target.files[0]));
  }
  return (
    <div>
      <div>
        <input type="file" onChange={getFile}></input>
      </div>
      <div style={{ height: 200, width: 200, padding: 10 }}>
        {file && <FileUpload file={file} />}
      </div>
    </div>
  );
};

export default FileUploadPreview;
