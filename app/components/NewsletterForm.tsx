import {useId} from 'react';
import {useFetcher} from 'react-router';
import type {action} from '~/routes/newsletter';

export function NewsletterForm() {
  const fetcher = useFetcher<typeof action>();
  const inputId = useId();
  const busy = fetcher.state !== 'idle';
  const result = fetcher.data;
  const error = result && !result.ok ? result.error : undefined;

  if (result?.ok) {
    return <p className="sf-newsletter__done" role="status">You&rsquo;re in 🌱</p>;
  }

  return (
    <fetcher.Form method="post" action="/newsletter" className="sf-newsletter" noValidate>
      <label htmlFor={inputId} className="sf-newsletter__label">Your email</label>
      <div className="sf-newsletter__field">
        <input
          id={inputId}
          className="sf-newsletter__input"
          type="email"
          name="email"
          placeholder="Enter your email"
          autoComplete="email"
          aria-describedby={error ? `${inputId}-error ${inputId}-note` : `${inputId}-note`}
          required
        />
        <button className="sf-pill sf-pill--green sf-newsletter__button" type="submit" disabled={busy}>
          {busy ? 'Signing up…' : <>Sign up <span aria-hidden="true">→</span></>}
        </button>
      </div>
      <input className="sf-hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error && <p id={`${inputId}-error`} className="sf-newsletter__error" role="alert">{error}</p>}
      <p id={`${inputId}-note`} className="sf-newsletter__note">One letter a week: a craft, a garden note, and a story to tell at dinner.</p>
    </fetcher.Form>
  );
}
