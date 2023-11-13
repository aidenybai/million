import { useState, useEffect } from 'react';
import { block } from 'million/react';
import '../css/examples/carousel.css';

const Carousel = block(() => {
  const [images, setImages] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchImages = async () => {
    try {
      const response = await fetch(
        'https://picsum.photos/v2/list?page=21&limit=8',
      );
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  //* Next / Previous events
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );
  };

  return (
    <div>
      <div className="carousel">
        <div
          className="carousel-inner"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image) => (
            <img key={image.id} src={image.download_url} alt={image.author} />
          ))}
        </div>
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={prevSlide}>Previous</button>
        <button style={{ marginLeft: 10 }} onClick={nextSlide}>
          Next
        </button>
      </div>
    </div>
  );
});

export default Carousel;
