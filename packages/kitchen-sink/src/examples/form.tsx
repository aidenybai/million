import { block } from 'million/react';

const Form = block(() => {
  const onSubmit = (event: any) => {
    event.preventDefault();
    alert('submitted');
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
});

export default Form;
