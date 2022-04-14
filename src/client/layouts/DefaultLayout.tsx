import BrandingProvider from "../themes/BrandingProvider";
import AppHeader from "./AppHeader";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader></AppHeader>
      <main>{children}</main>
    </>
  );
}
