import { block } from 'million/react';
import { useState, useRef } from 'react';
import QRCode from 'react-qr-code';

const QRCodeGenerator = block(() => {
  const [data, setData] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <h1>QR Code Generator</h1>
      <div>
        <input
          placeholder="Enter text or URL"
          style={{ width: '40%' }}
          ref={inputRef}
          type="text"
        />
        <button
          style={{ marginLeft: 10 }}
          onClick={() => {
            if (inputRef.current) {
              setData(inputRef.current.value);
            }
          }}
        >
          Generate
        </button>
      </div>
      {data && (
        <div className="qr-code-wrapper">
          <QRCode value={data} />
        </div>
      )}
    </div>
  );
});

export default QRCodeGenerator;
