export default function Wrapper({ children }) {
  return (
    <div className="mt-5 border border-gray-400 dark:border-gray-600 mx-auto max-w-7xl rounded-sm p-5">
      {children}
    </div>
  );
}
