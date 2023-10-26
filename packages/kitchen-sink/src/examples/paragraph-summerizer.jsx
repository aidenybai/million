import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { block } from 'million/react';

const paragraphSummerizer = block(() => {
  const [value, setValue] = useState('');
  const [data, setData] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isCopy, setIsCopy] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Bearer ' + 'skCc0TTQBMinu5Mrq2ZMd0T3BlbkFJiCRbpdqnxq3glQ6zxLYG',
      },
      body: JSON.stringify({
        prompt: value + `\n\nTl;dr`,
        temperature: 0.1,
        max_tokens: Math.floor(value.length / 2),
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.5,
        stop: ['"""'],
      }),
    };

    fetch(
      'https://api.openai.com/v1/engines/text-davinci-003/completions',
      requestOptions,
    )
      .then((response) => response.json())
      .then((dt) => {
        const text = dt.choices[0].text;
        setSubmitting(false);

        setData([...data, text]);
      })
      .catch((error) => {
        setSubmitting(false);
        console.log(error);
      });
  };

  async function copyTextToClipboard(text) {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    }
  }

  const handleCopy = (txt) => {
    copyTextToClipboard(txt)
      .then(() => {
        setIsCopy(true);

        setTimeout(() => {
          setIsCopy(false);
        }, 1500);
      })
      .catch((err) => console.log(err));
  };

  const handleDelete = (txt) => {
    const filtered = data.filter((d) => d !== txt);
    setData(filtered);
  };

  return (
    <Container>
      <Header>
        <Heading>Summerizer</Heading>
      </Header>

      <MainContent>
        <Title>
          Summarizer Paragraph with <span>OpenAI GPT</span>
        </Title>
        <Subtitle>
          Add your Paragraph in here and get your Summarized Paragraph.
        </Subtitle>

        <div>
          <TextArea
            placeholder="Paste doc content here ..."
            rows={10}
            cols={80}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          {value.length > 0 &&
            (submitting ? (
              <p className="text-md text-cyan-500 mt-5">Please wait ....</p>
            ) : (
              <SubmitButton onClick={handleSubmit}>Submit</SubmitButton>
            ))}
        </div>
      </MainContent>

      <SummaryContainer>
        {data.length > 0 && (
          <>
            <p>Summary History</p>
            {data.map((d, index) => (
              <Summary key={index}>
                <SummaryText>{d}</SummaryText>
                <ButtonGroup>
                  <CopyButton onClick={() => handleCopy(d)}>
                    {isCopy ? 'Copied' : 'Copy'}
                  </CopyButton>
                  <DeleteButton onClick={() => handleDelete(d)}></DeleteButton>
                </ButtonGroup>
              </Summary>
            ))}
          </>
        )}
      </SummaryContainer>
    </Container>
  );
});

export default paragraphSummerizer;

const Container = styled.div`
  width: 100%;
  background: #0f172a;
  min-height: 100vh;
  padding: 4px;
  padding: 20px;

  @media (min-width: 2xl) {
    padding: 40px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 10px;
  padding: 5px;
`;

const Heading = styled.h3`
  cursor: pointer;
  font-size: 3xl;
  font-weight: bold;
  color: #d41d6d;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  padding: 4px;
`;

const Title = styled.h1`
  font-size: 3xl;
  color: white;
  text-align: center;
  font-weight: bold;

  span {
    font-size: 5xl;
    font-weight: bold;
    color: #d41d6d;
  }
`;

const Subtitle = styled.p`
  margin-top: 5px;
  font-size: lg;
  color: #808080;
  text-align: center;
  max-width: 2xl;
`;

const TextArea = styled.textarea`
  width: 100%;
  max-width: 750px;
  height: auto;
  border: 1px solid #8fb3ff;
  background: #2d3748;
  padding: 2px;
  font-size: sm;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  font-weight: medium;
  color: white;
  outline: none;
  resize: none;
  border-radius: 8px;
`;

const SubmitButton = styled.button`
  margin-top: 5px;
  background: #00b5e9;
  padding: 5px;
  text-align: center;
  font-size: md;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  color: white;
`;

const SummaryContainer = styled.div`
  width: 100%;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  align-items: center;
  justify-content: center;
`;

const Summary = styled.div`
  max-width: 2xl;
  background: #2d3748;
  padding: 20px;
  border-radius: 4px;
`;

const SummaryText = styled.p`
  font-size: lg;
  color: #808080;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: flex-end;
`;

const CopyButton = styled.p`
  cursor: pointer;
  font-weight: bold;
  color: #808080;

  &:hover {
    color: #00b5e9;
  }
`;

const DeleteButton = styled.span`
  cursor: pointer;
`;
