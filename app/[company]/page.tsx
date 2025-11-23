import "@mantine/core/styles.css";

import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import App from "../app";
import { use } from "react";

const theme = createTheme({});

export function generateStaticParams() {
  return [{ company: "makula" }];
}

export default function CompanyPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company } = use(params);

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      <App company={company} />
    </MantineProvider>
  );
}
