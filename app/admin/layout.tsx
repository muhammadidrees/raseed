import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AdminNav } from "./components/AdminNav";

const theme = createTheme({});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      <AdminNav />
      {children}
    </MantineProvider>
  );
}
