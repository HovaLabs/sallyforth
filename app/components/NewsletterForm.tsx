import {useId} from 'react';
import {useFetcher} from 'react-router';
import type {action} from '~/routes/newsletter';

export function NewsletterForm() {
  const fetcher = useFetcher<typeof action>();
  const inputId = useId();
  const busy = fetcher.state !== 'idle';
  const result = fetcher.data;

  if (result?.ok) {
    return <p className="sf-newsletter__done" role="status">You&rsquo;re in 🌱</p>;
  }

  return (
    <fetcher.Form method="post" action="/newsletter" className="sf-newsletter" noValidate>
      <label htmlFor={inputId} className="sr-only">Email address</label>
      <input
        id={inputId}
        className="sf-newsletter__input"
        type="email"
        name="email"
        placeholder="email address"
        autoComplete="email"
        required
      />
      <input className="sf-hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="sf-newsletter__button" type="submit" disabled={busy}>
        {busy ? 'SIGNING UP…' : 'SIGN UP'}
      </button>
      {result && !result.ok ? (
        <p className="sf-newsletter__error" role="alert">{result.error}</p>
      ) : null}
    </fetcher.Form>
  );
}
