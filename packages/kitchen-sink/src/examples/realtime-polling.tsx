import { useState } from 'react';
import { block } from 'million/react';

export type PollOption = {
  id: number;
  text: string;
  votes: number;
};

const RealTimePolling = block(() => {
  const [options, setOptions] = useState<PollOption[]>([]);
  const [inputOption, setInputOption] = useState("");

  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);

  const handleVote = (id: number) => {
    setOptions(prevOptions =>
      prevOptions.map(option =>
        option.id === id
          ? { ...option, votes: option.votes + 1 }
          : option
      )
    );
  };

  const addOption = () => {
    if (inputOption.trim() !== "") {
      setOptions(prevOptions => [...prevOptions, { id: Date.now(), text: inputOption, votes: 0 }]);
      setInputOption("");
    }
  };

  return (
    <div className="polling-app">
      <h1>Polling app</h1>
      <div>
        <input
          type="text"
          placeholder="Add an option..."
          style={{ width: '30%' }}
          value={inputOption}
          onChange={(e) => setInputOption(e.target.value)}
        />
        <button
          style={{ marginLeft: 10, padding: '10px 20px 10px 20px' }}
          onClick={addOption}>
          Add Option
        </button>
      </div>

      <ul>
        {options.map(option => (
          <li key={option.id}>
            <button onClick={() => handleVote(option.id)}>
              Vote for {option.text}
            </button>
            <div>
              {option.text}: {option.votes} votes
              <div style={{ 
                width: `${(option.votes / (totalVotes || 1)) * 100}%`
              }}></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default RealTimePolling;