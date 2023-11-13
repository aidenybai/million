import React, { useState } from 'react';
import { For } from 'million/react';
import { block } from 'million/react';

interface Comment {
  id: number;
  text: string;
}

const Guestbook = block(() => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (newComment.trim() === '') return;

    const newId = comments.length + 1;
    const comment: Comment = {
      id: newId,
      text: newComment,
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const deleteComment = (id: number) => {
    const updatedComments = comments.filter(
      (comment: any) => comment.id !== id,
    );
    setComments(updatedComments);
  };

  return (
    <div>
      <h1>Guestbook</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Leave a comment..."
          value={newComment}
          onChange={handleCommentChange}
        />
        <button type="submit">Submit</button>
      </form>
      <ul>
        <For each={comments}>
          {(comment: Comment) => (
            <li key={comment.id}>
              {comment.text}
              <button onClick={() => deleteComment(comment.id)}>Delete</button>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
});

export default Guestbook;
