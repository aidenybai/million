function CommonErrorVideo() {
  return (
    <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] relative my-4 mx-auto">
      <iframe
        src="https://player.vimeo.com/video/864599068?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}
        title="Screen_Recording_2023-09-07_at_15.31.10"
      ></iframe>
    </div>
  );
}

export default CommonErrorVideo;
