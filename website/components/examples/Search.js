import { useState } from 'react';
import Wrapper from './Wrapper';
import { compareTwoStrings } from 'string-similarity';

const entries = ['Apple', 'Banana', 'Grape', 'Orange', 'Strawberry'];

export default function Search() {
  const [query, setQuery] = useState('');

  return (
    <Wrapper>
      <div>
        <input
          onInput={({ target }) => setQuery(target.value)}
          className="p-2 rounded border border-gray-400 dark:border-gray-600 dark:bg-black"
        />
        <ul>
          {entries.map((entry) => {
            const shouldShow =
              compareTwoStrings(
                entry.toLowerCase(),
                query.trim().toLowerCase(),
              ) > 0.25;
            return (
              <li
                style={{
                  fontWeight: shouldShow ? 'bold' : undefined,
                  textDecoration: shouldShow ? 'underline' : undefined,
                }}
                key={entry}
              >
                {entry}
              </li>
            );
          })}
        </ul>
      </div>
    </Wrapper>
  );
}
