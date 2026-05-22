/**
 * Root index — immediately redirects to the splash screen.
 *
 * On web, Expo Router resolves '/' to this file. Without it the router
 * falls through to the (tabs) group and bypasses splash entirely.
 */

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/splash" />;
}
