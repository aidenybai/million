import React, { useState, useRef } from 'react';
import { block } from 'million/react';

const JournalComponent = ({ entry, onDelete }) => (
  <div>
    <h3 style={{ color: '#FF5E5B', margin: '0', fontSize: '1.4rem' }}>
      {entry.id}. {entry.title}
    </h3>
    <p style={{ marginBottom: '15px' }}>{entry.text}</p>
    {entry.media && (
      <div>
        {entry.media.type.startsWith('image') && (
          <img
            src={entry.media.url}
            alt="Multimedia Entry"
            style={{ width: '50%', marginBottom: '15px' }}
          />
        )}
        {entry.media.type.startsWith('video') && (
          <video controls style={{ width: '30%' }}>
            <source src={entry.media.url} type={entry.media.type} />
            Your browser does not support the video tag
          </video>
        )}
      </div>
    )}
    <div>
      <button
        onClick={() => onDelete(entry.id)}
        style={{ marginBottom: '15px' }}
      >
        Delete
      </button>
      <span
        style={{
          display: 'block',
          width: '100%',
          height: '2px',
          backgroundColor: '#FFA987',
          marginTop: '10px',
          marginBottom: '10px',
        }}
      ></span>
    </div>
  </div>
);

const DigitalPersonalJournal = block(function Journal() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [nextId, setNextId] = useState(1);
  const fileInputRef = useRef(null);

  const handleAddEntry = () => {
    if (title || text || mediaFile) {
      const newEntry = {
        id: nextId,
        title,
        text,
        media: mediaFile
          ? { url: URL.createObjectURL(mediaFile), type: mediaFile.type }
          : null,
      };
      setEntries([...entries, newEntry]);
      setNextId(nextId + 1);
      setTitle('');
      setText('');
      setMediaFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteEntry = (id) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    setEntries(updatedEntries);
  };

  return (
    <main>
      <h2 style={{ marginBottom: '15px' }}>My Digital Personal Journal</h2>
      <div>
        <input
          type="text"
          placeholder="Title of your Journal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            display: 'block',
            marginBottom: '15px',
            width: '100%',
            maxWidth: '500px',
          }}
        />

        <textarea
          cols="30"
          rows="10"
          placeholder="Write your Journal here"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            display: 'block',
            marginBottom: '15px',
            width: '100%',
            maxWidth: '500px',
            color: 'currentcolor',
            backgroundColor: ' var(--background)',
            border: 'none',
            borderRadius: '4px',
            padding: '10px',
            fontSize: 'inherit',
          }}
        ></textarea>
        <input
          type="file"
          accept=".png, .jpg, .jpeg, .mp4, .mp3, .gif"
          onChange={(e) => setMediaFile(e.target.files[0])}
          style={{
            display: 'block',
            marginBottom: '15px',
            width: '100%',
            maxWidth: '250px',
          }}
          ref={fileInputRef}
        />
        <button
          onClick={handleAddEntry}
          style={{
            display: 'block',
            marginBottom: '15px',
            backgroundColor: 'orange',
            color: 'black',
          }}
        >
          Add Journal
        </button>
        <span style={{ display: 'block', marginBottom: '15px' }}>
          Total Entries: {entries.length}
        </span>
        <span
          style={{
            display: 'block',
            width: '100%',
            height: '2px',
            backgroundColor: '#FFED66',
            marginTop: '20px',
            marginBottom: '2px',
          }}
        ></span>
        <span
          style={{
            display: 'block',
            width: '100%',
            height: '2px',
            backgroundColor: '#FFED66',
            marginBottom: '20px',
          }}
        ></span>
      </div>

      <div>
        {entries.map((entry) => (
          <JournalComponent
            key={entry.id}
            entry={entry}
            onDelete={handleDeleteEntry}
          />
        ))}
      </div>
    </main>
  );
});

export default DigitalPersonalJournal;
