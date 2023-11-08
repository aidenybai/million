import React, { useEffect, useState } from 'react';
import { block } from 'million/react';

interface Source {
  name: string;
  url: string;
}
interface Article {
  description: string;
  url: string;
  content: string;
  image: string;
  source: Source;
  publishedAt: string;
}
interface NewsCardProps {
  title: string;
  description: string;
  imageUrl: string;
  sourceName: string;
  publishedAt: string;
  url: string;
}
const apikey = 'a963a8b8b7f31c79f5002d77fcb592be';
const category = 'general';
const url =
  'https://gnews.io/api/v4/top-headlines?category=' +
  category +
  '&lang=en&country=us&max=10&apikey=' +
  apikey;
const defaultImageUrl =
  'https://euaa.europa.eu/sites/default/files/styles/width_600px/public/default_images/news-default-big.png?itok=NNXAZZTc';
const NewsCard = ({
  title,
  description,
  imageUrl,
  sourceName,
  publishedAt,
  url,
}: NewsCardProps) => {
  return (
    <div className="news-card">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <div className="image-container">
          <img src={imageUrl} alt={title} />
        </div>
      </a>
      <div className="content">
        <h3 className="title">{title}</h3>
        <p className="description">{description}</p>
        <p className="source">{sourceName}</p>
        <p className="published-at">{publishedAt}</p>
        <a
          className="read-more"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read more
        </a>
      </div>
    </div>
  );
};

const NewsAggregator: React.FC = block(() => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setArticles(data.articles);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching news:', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>News Aggregator</h2>
      {isLoading && <div>Loading...</div>}
      {!isLoading && (
        <div className="news-container">
          {articles.map((article: Article) => (
            <NewsCard
              title={article.description}
              description={article.content}
              imageUrl={
                article.image !== null ? article.image : defaultImageUrl
              }
              sourceName={article.source.name}
              publishedAt={article.publishedAt}
              url={article.url}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default NewsAggregator;
