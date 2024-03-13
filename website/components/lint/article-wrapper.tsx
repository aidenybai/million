export default function ArticleWrapper(
  props: React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <article
      {...props}
      className={`w-full max-w-[1568px] px-8 pt-32 md:px-16 ${
        props.className ?? ''
      }`}
    >
      {props.children}
    </article>
  );
}
