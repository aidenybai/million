import { block, For } from 'million/react';
import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';

const apiKey = 'AIzaSyBcyDly48QaqUGg-QGB0znsGWWA_TC038Q';

const BookRecommendation = block(() => {
  const [subject, setSubject] = useState('JavaScript');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    async function getBooks() {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=subject:${subject}&key=${apiKey}`,
        );

        setBooks(response.data.items || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }

    getBooks();

    return () => {
      abortController.abort();
    };
  }, [subject]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <h2
        style={{
          fontSize: '3rem',
          textTransform: 'capitalize',
          marginBottom: '1rem',
        }}
      >
        Reading makes the world huge
      </h2>

      <section
        style={{
          background: '#ffffff',
          color: '#2A2C2E',
          padding: '1.2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.2rem',
        }}
      >
        <div
          style={{
            background: '#2A2C2E',
            color: '#ffff',
            flexBasis: '50%',
            position: 'relative',
            padding: '1.2rem',
            borderRadius: '1rem',
            overflow: 'hidden',
          }}
        >
          <h3 style={{ textTransform: 'uppercase' }}>Find Something to read</h3>
          <p style={{ marginBlock: '.5rem 1rem' }}>
            Fancy something unusual and unpredictable? Funny or exciting? No
            problem. Check out the collections we have prepared for you.
          </p>
          <button
            type="button"
            style={{
              outline: 'none',
              borderRadius: '.8rem',
              padding: '1rem 2rem',
              border: '1px solid #F4CE47',
              color: '#F4CE47',
              textTransform: 'capitalize',
            }}
          >
            browse now
          </button>
          <svg
            width="200"
            height="240"
            viewBox="0 0 259 299"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'absolute', right: 0 }}
          >
            <path
              d="M11.9995 305.5L97.745 219.754M97.745 219.754C75.3507 197.36 61.4995 166.422 61.4995 132.25C61.4995 63.9043 116.904 8.49951 185.25 8.49951C253.595 8.49951 309 63.9043 309 132.25C309 200.595 253.595 256 185.25 256C151.077 256 120.139 242.148 97.745 219.754Z"
              stroke="black"
              strokeOpacity="0.38"
              strokeWidth="16"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <img
            src="https://i.ibb.co/s5GS61g/book-of-the-day.png"
            alt="book image"
          />
        </div>
      </section>

      <Subject selectedSubject={subject} onSelectSubject={setSubject} />

      <section
        style={{ background: '#2A2C2E', color: '#ffffff ', padding: '1.2rem' }}
      >
        <h3 style={{ textTransform: 'uppercase', marginBottom: '1.2rem' }}>
          Bestsellers
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.2rem',
          }}
        >
          <For each={books}>
            {(book, index) => <Book
              key={index}
              author={
                book?.volumeInfo.authors && book?.volumeInfo.authors.join(', ')
              }
              image={book?.volumeInfo?.imageLinks?.thumbnail}
              title={book?.volumeInfo.title}
              url={book?.volumeInfo.previewLink}
            />}
          </For>
        </div>
      </section>
    </main>
  );
});

const Book = ({ author, image, title, url }) => {
  return (
    <article
      style={{
        background: '#ffffff',
        color: '#2A2C2E',
        borderRadius: '1rem',
        padding: '1rem',
      }}
    >
      <img
        src={image || 'https://i.ibb.co/KNZGG1G/img.png'}
        alt={title}
        style={{
          display: 'block',
          width: '100%',
          borderRadius: '1rem',
          height: 'auto',
          marginBottom: '1rem',
        }}
      />

      <h5 style={{ marginBlock: 0, fontWeight: 400 }}>
        {author || 'Murakami'}
      </h5>
      <h4 style={{ marginBlock: 0 }}>{title || 'After Dark'}</h4>

      <a
        href={url}
        style={{
          textDecoration: 'none',
          border: '1px solid #2A2C2E',
          borderRadius: '1rem',
          color: '#2A2C2E',
          padding: '.4rem 1rem',
          marginTop: '1rem',
          display: 'inline-block',
        }}
      >
        See more
      </a>
    </article>
  );
};

const Subject = block(({ selectedSubject, onSelectSubject }) => {
  const SUBJECTS = [
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Romance',
    'Thriller',
    'Horror',
    'Historical Fiction',
    'Non-Fiction',
    'Biography',
    'Self-Help',
    'Travel',
    'Cooking',
    'Science',
    'Poetry',
    'Young Adult',
    'Children',
    'Drama',
    'Graphic Novel',
    'Satire',
    'Dystopian',
  ];

  return (
    <section
      style={{
        width: '100%',
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '10px',
        overflow: 'auto',
        background: 'yellow',
        padding: '3rem 1.2rem',
      }}
    >
      {SUBJECTS.map((subject) => (
        <button
          key={subject}
          onClick={() => onSelectSubject(subject)}
          style={{
            display: 'inline-block',
            cursor: 'pointer',
            outline: ' none',
            borderRadius: '1rem',
            padding: '.5rem 1rem',
            border: '1px solid #2A2C2E',
            background: selectedSubject === subject ? '#2A2C2E' : 'transparent',
            color: selectedSubject === subject ? '#fff' : '#2a2c2e',
          }}
        >
          {subject}
        </button>
      ))}
    </section>
  );
});

export default BookRecommendation;
