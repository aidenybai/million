import { Link, Route } from 'wouter';
import { block } from 'million/react';

const Wouter = block(() => (
  <div>
    <Link href="/users/1">
      <a className="link">Profile</a>
    </Link>
    &nbsp;
    <Link href="/about">About</Link>&nbsp;
    <Link href="/inbox">Inbox</Link>
    <Route path="/about">About Us</Route>
    <Route path="/users/:name">
      {(params) => <div>Hello, {params.name}!</div>}
    </Route>
    <Route path="/inbox" component={InboxPage} />
  </div>
));

const InboxPage = block(() => (
  <div>
    <h1>Inbox</h1>
  </div>
));

export default Wouter;
