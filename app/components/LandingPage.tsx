"use client";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import {
  Anchor,
  Badge,
  Box,
  Button,
  Container,
  createTheme,
  Divider,
  Grid,
  Group,
  List,
  MantineProvider,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import Link from "next/link";
import { Waitlist } from "./Waitlist";

const theme = createTheme({});

const FAQ = [
  {
    q: "Who is this for?",
    a: "Small businesses (5–50 contractors) who keep getting invoices that don't follow their format — wrong invoice number, missing tax info, wrong currency, etc. You configure the template once. Your contractors fill it in. You get compliant PDFs back.",
  },
  {
    q: "How do contractors use it?",
    a: "You share a link like raseedhq.com/your-company. They fill in their personal info on a form that matches your template (currency, tax rate, required fields, invoice number scheme — all set by you). They download the PDF and email it to you.",
  },
  {
    q: "Where does the data live?",
    a: "Your published template (your business address, IBAN, currency, etc.) lives on our server. The contractor's personal info, line items, and amounts stay in their browser only — we don't store contractor data.",
  },
  {
    q: "Why now?",
    a: "We're onboarding the first ~5 orgs by hand at no cost in exchange for a monthly feedback call. After that we'll likely settle around $9–19/mo per org.",
  },
];

export function LandingPage() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      <Container size="lg" py="xl">
        <Stack gap={48}>
          {/* Hero */}
          <Stack gap="lg" pt={32}>
            <Group gap="xs">
              <Title order={2} style={{ fontSize: 32 }}>
                Raseed
              </Title>
              <Badge color="teal" variant="light" size="sm">
                Closed alpha
              </Badge>
            </Group>
            <Title order={1} style={{ fontSize: 44, lineHeight: 1.1 }}>
              Stop chasing your contractors for invoice fixes.
            </Title>
            <Text size="lg" c="dimmed" maw={640}>
              Configure your invoice template once — currency, invoice number
              format, tax rate, required fields. Share a link. Get compliant
              PDFs back from every contractor, every time.
            </Text>
            <Group gap="md">
              <Button component={Link} href="/admin/demo" size="md">
                Try the admin (no signup)
              </Button>
              <Anchor component={Link} href="/acme" size="sm" fw={500}>
                See contractor view -&gt; /acme
              </Anchor>
            </Group>
          </Stack>

          {/* Three columns */}
          <Grid gap="lg">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Paper withBorder p="md" radius="md" h="100%">
                <Stack gap="xs">
                  <Title order={5}>1. You configure</Title>
                  <Text size="sm" c="dimmed">
                    Set your payee company, bank, currency, tax rate, due-terms
                    presets, and which contractor fields are required.
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Paper withBorder p="md" radius="md" h="100%">
                <Stack gap="xs">
                  <Title order={5}>2. They fill it in</Title>
                  <Text size="sm" c="dimmed">
                    Contractors load{" "}
                    <Text span ff="monospace">
                      raseedhq.com/yourco
                    </Text>{" "}
                    and see a form that already enforces your rules.
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Paper withBorder p="md" radius="md" h="100%">
                <Stack gap="xs">
                  <Title order={5}>3. You get clean PDFs</Title>
                  <Text size="sm" c="dimmed">
                    Invoice number is auto-generated from the date in the
                    format you picked. Currency, tax line, and labels match.
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>

          <Divider />

          {/* What you can configure */}
          <Stack gap="md">
            <Title order={3}>What you can configure today</Title>
            <List size="sm" spacing={4}>
              <List.Item>
                <b>Payee details</b> — your business name, address, IBAN, BIC,
                account title.
              </List.Item>
              <List.Item>
                <b>Currency</b> — code, symbol, and whether it shows before or
                after the amount.
              </List.Item>
              <List.Item>
                <b>Invoice number scheme</b> — date-based formats (MMYY,
                YYYYMM, YYMM, MMYYYY) or a custom pattern with{" "}
                <Text span ff="monospace">
                  &#123;yyyy&#125; &#123;yy&#125; &#123;mm&#125; &#123;dd&#125;
                </Text>{" "}
                placeholders, with optional prefix.
              </List.Item>
              <List.Item>
                <b>Tax / VAT</b> — rate and label (Tax, VAT, GST, Sales Tax,
                etc.).
              </List.Item>
              <List.Item>
                <b>Date format</b> — dd/MM/yyyy, MM/dd/yyyy, yyyy-MM-dd.
              </List.Item>
              <List.Item>
                <b>Payment terms</b> — your own list of presets (Net 15, Net
                30, Net 45, etc.) plus &ldquo;Custom days&rdquo; as a fallback.
              </List.Item>
              <List.Item>
                <b>Required contractor fields</b> — for each of name, email,
                tax ID, street, city, zip: required, optional, or hidden.
              </List.Item>
              <List.Item>
                <b>Business contact email</b> — printed in the PDF footer.
              </List.Item>
            </List>
          </Stack>

          <Divider />

          {/* Waitlist */}
          <Box>
            <Stack gap="xs" mb="md">
              <Title order={3}>Get early access</Title>
              <Text size="sm" c="dimmed">
                We&apos;re onboarding the first orgs by hand. Tell us a bit
                about your setup and we&apos;ll get back to you.
              </Text>
            </Stack>
            <Waitlist />
          </Box>

          <Divider />

          {/* FAQ */}
          <Stack gap="md">
            <Title order={3}>FAQ</Title>
            {FAQ.map((item) => (
              <Box key={item.q}>
                <Text fw={600} mb={2}>
                  {item.q}
                </Text>
                <Text size="sm" c="dimmed">
                  {item.a}
                </Text>
              </Box>
            ))}
          </Stack>

          <Divider />

          {/* Footer */}
          <Group justify="space-between" pb="xl">
            <Text size="xs" c="dimmed">
              Raseed — built by Makula
            </Text>
            <Group gap="lg">
              <Anchor component={Link} href="/admin/demo" size="xs" c="dimmed">
                Try the admin
              </Anchor>
              <Anchor component={Link} href="/acme" size="xs" c="dimmed">
                /acme demo
              </Anchor>
              <Anchor component={Link} href="/legacy" size="xs" c="dimmed">
                Generic tool
              </Anchor>
              <Anchor component={Link} href="/admin/login" size="xs" c="dimmed">
                Sign in
              </Anchor>
            </Group>
          </Group>
        </Stack>
      </Container>
    </MantineProvider>
  );
}
