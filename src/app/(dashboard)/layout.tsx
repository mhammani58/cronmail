import { Bar } from "./bar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main className="container flex flex-col gap-4">
      <Bar />
      {children}
    </main>
  );
};

export default Layout;
