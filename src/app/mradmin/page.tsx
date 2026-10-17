import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '../../lib/auth';
import MrAdminClient from './MrAdminClient';
import MrAdminLogin from './MrAdminLogin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MrAdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const { valid } = await verifySessionToken(token);

  // If not authenticated, ship ONLY the login form (Admin dashboard code is never leaked)
  if (!valid) {
    return <MrAdminLogin />;
  }

  // Once authenticated, serve the full MrAdmin dashboard
  return <MrAdminClient />;
}
