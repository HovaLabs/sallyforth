import {data, redirect} from 'react-router';
import type {Route} from './+types/newsletter';
import {isValidEmail} from '~/lib/newsletter/validate';
import {subscribe, FRIENDLY_ERROR, type SubscribeResult} from '~/lib/newsletter/subscribe';
import {createAdminFetch} from '~/lib/newsletter/admin';

export function loader() {
  return redirect('/');
}

export async function action({request, context}: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const honeypot = String(form.get('website') ?? '');

  // Bots fill the hidden field; pretend it worked and do nothing.
  if (honeypot) return data<SubscribeResult>({ok: true});

  if (!isValidEmail(email)) {
    return data<SubscribeResult>({ok: false, error: 'Please enter a valid email address.'}, {status: 400});
  }

  const adminFetch = createAdminFetch(context.env);
  if (!adminFetch) {
    console.error('[newsletter] PRIVATE_ADMIN_API_ACCESS_TOKEN / PUBLIC_STORE_DOMAIN not configured');
    return data<SubscribeResult>({ok: false, error: FRIENDLY_ERROR}, {status: 502});
  }

  const result = await subscribe(email, adminFetch);
  return data<SubscribeResult>(result, {status: result.ok ? 200 : 502});
}
