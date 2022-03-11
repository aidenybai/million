import { morph } from '../morph/morph';

export const refresh = (head?: string, body?: string) => {
  if (head) morph(head, document.head);
  if (body) morph(body, document.body);
};
