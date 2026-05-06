import "@mantine/core/styles.css";

import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import App from "../app";

const theme = createTheme({});

export default function LegacyContractorPage() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      <App
        exportFileLabel="Invoice"
        organizationDisplayName=""
        storageNamespace={undefined}
      />
    </MantineProvider>
  );
}
