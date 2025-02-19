import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the products page by default
  return <Redirect href="./Products" />;
}
