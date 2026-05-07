"use client";

import {
  Anchor,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconBolt,
  IconBuildingSkyscraper,
  IconCalendarDollar,
  IconCircleCheck,
  IconCoins,
  IconFileInvoice,
  IconLock,
  IconReceipt,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { FeedbackButton } from "./FeedbackButton";
import { AppTheme } from "./AppTheme";
import { BrandWordmark } from "./Brand";
import { FtmoiSignature } from "./FtmoiSignature";
import { Waitlist } from "./Waitlist";

const FEATURES = [
  {
    icon: IconCoins,
    title: "Currency, locked in",
    body: "Pick your code, symbol, and whether it shows before or after the amount. Contractors can't change it.",
  },
  {
    icon: IconReceipt,
    title: "Invoice numbers, automatic",
    body: "Date-driven schemes (MMYY, YYYYMM, custom) with optional prefix — every invoice numbered consistently.",
  },
  {
    icon: IconCalendarDollar,
    title: "Tax & payment terms",
    body: "Set your VAT/GST rate and label, plus a curated list of Net 15 / 30 / 45 presets — or let them go custom.",
  },
  {
    icon: IconUsers,
    title: "Required contractor fields",
    body: "Decide which identity fields are mandatory: full name, tax ID, address, email — anything you need on file.",
  },
  {
    icon: IconBuildingSkyscraper,
    title: "Your billing details, always",
    body: '"Billed To" is server-locked to your org. Contractors only fill in their side, never yours.',
  },
  {
    icon: IconLock,
    title: "Privacy by default",
    body: "Contractor data stays in their browser. We only store your template — not their personal info.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Configure once",
    body: "Set your payee, currency, tax rate, due-terms presets, and which contractor fields are required.",
  },
  {
    n: "02",
    title: "Share a link",
    body: "Send your contractors a single URL — raseedhq.com/yourco — that already enforces every rule.",
  },
  {
    n: "03",
    title: "Get clean PDFs",
    body: "Compliant, on-brand invoices land in your inbox. No more chasing for missing tax IDs or wrong currencies.",
  },
];

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

function TopNav() {
  return (
    <Box
      component="nav"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "saturate(180%) blur(14px)",
        WebkitBackdropFilter: "saturate(180%) blur(14px)",
        background: "rgba(255,255,255,0.72)",
        borderBottom: "1px solid var(--raseed-hairline)",
      }}
    >
      <Container size="lg">
        <Group h={64} justify="space-between" wrap="nowrap">
          <BrandWordmark size={28} />
          <Group gap="lg" wrap="nowrap" visibleFrom="sm">
            <Anchor component={Link} href="#features" size="sm" c="dimmed">
              Features
            </Anchor>
            <Anchor component={Link} href="#how" size="sm" c="dimmed">
              How it works
            </Anchor>
            <Anchor component={Link} href="#faq" size="sm" c="dimmed">
              FAQ
            </Anchor>
            <Anchor component={Link} href="/admin/login" size="sm" c="dimmed">
              Sign in
            </Anchor>
            <FeedbackButton
              source="landing-nav"
              label="Feedback"
              variant="subtle"
              color="gray"
              size="sm"
              hideIcon
            />
          </Group>
          <Button
            component={Link}
            href="#waitlist"
            size="xs"
            radius="md"
            rightSection={<IconArrowRight size={14} />}
          >
            Get access
          </Button>
        </Group>
      </Container>
    </Box>
  );
}

function Hero() {
  return (
    <Box style={{ position: "relative", overflow: "hidden" }}>
      <div className="raseed-hero-glow" />
      <Container size="lg" py={{ base: 56, sm: 96 }}>
        <Stack gap="xl" pos="relative" style={{ zIndex: 1 }}>
          <Group className="raseed-reveal">
            <Badge
              variant="light"
              color="brand"
              size="lg"
              radius="sm"
              leftSection={<IconBolt size={12} />}
              style={{ paddingLeft: 8 }}
            >
              Closed alpha — onboarding by hand
            </Badge>
          </Group>

          <Title
            order={1}
            className="raseed-reveal raseed-reveal-delay-1"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              maxWidth: 820,
            }}
          >
            Stop chasing your contractors for{" "}
            <span className="raseed-gradient-text">invoice fixes</span>.
          </Title>

          <Text
            size="xl"
            c="dimmed"
            maw={640}
            className="raseed-reveal raseed-reveal-delay-2"
            style={{ lineHeight: 1.55 }}
          >
            Configure your invoice template once — currency, numbering format,
            tax rate, required fields. Share a single link. Get compliant PDFs
            back from every contractor, every time.
          </Text>

          <Group
            gap="md"
            className="raseed-reveal raseed-reveal-delay-3"
            wrap="wrap"
          >
            <Button
              component={Link}
              href="/admin/demo"
              size="md"
              radius="md"
              rightSection={<IconArrowRight size={16} />}
            >
              Try the admin — no signup
            </Button>
            <Button
              component={Link}
              href="/acme"
              size="md"
              radius="md"
              variant="default"
              leftSection={<IconFileInvoice size={16} />}
            >
              See contractor view
            </Button>
          </Group>

          <Group
            gap="xl"
            mt="md"
            className="raseed-reveal raseed-reveal-delay-3"
          >
            <Group gap={6}>
              <IconShieldCheck size={16} color="var(--mantine-color-teal-6)" />
              <Text size="sm" c="dimmed">
                Contractor data never touches our servers
              </Text>
            </Group>
            <Group gap={6} visibleFrom="sm">
              <IconCircleCheck size={16} color="var(--mantine-color-teal-6)" />
              <Text size="sm" c="dimmed">
                Free during alpha
              </Text>
            </Group>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
}

function HowItWorks() {
  return (
    <Container size="lg" py="xl" id="how">
      <Stack gap="xl">
        <Stack gap={6} maw={620}>
          <Text size="sm" fw={600} c="brand.6" tt="uppercase" lts="0.08em">
            How it works
          </Text>
          <Title order={2}>Three steps from rules to clean PDFs</Title>
        </Stack>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          {STEPS.map((s) => (
            <Paper
              key={s.n}
              withBorder
              p="xl"
              radius="md"
              className="raseed-hover-lift"
              style={{ height: "100%" }}
            >
              <Stack gap="md">
                <Text
                  fw={700}
                  size="sm"
                  c="brand.6"
                  style={{ letterSpacing: "0.06em" }}
                >
                  {s.n}
                </Text>
                <Title order={4}>{s.title}</Title>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                  {s.body}
                </Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

function Features() {
  return (
    <Container size="lg" py="xl" id="features">
      <Stack gap="xl">
        <Stack gap={6} maw={620}>
          <Text size="sm" fw={600} c="brand.6" tt="uppercase" lts="0.08em">
            Everything you can configure
          </Text>
          <Title order={2}>Your invoice format, enforced.</Title>
          <Text c="dimmed" size="md" mt="xs">
            Every contractor sees the same form, with the same rules, and
            produces an invoice that already matches your accounting setup.
          </Text>
        </Stack>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {FEATURES.map((f) => (
            <Paper
              key={f.title}
              withBorder
              p="lg"
              radius="md"
              className="raseed-hover-lift"
              style={{ height: "100%" }}
            >
              <Stack gap="sm">
                <ThemeIcon variant="light" color="brand" size={40} radius="md">
                  <f.icon size={20} />
                </ThemeIcon>
                <Title order={5}>{f.title}</Title>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                  {f.body}
                </Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

function PrivacyBanner() {
  return (
    <Container size="lg" py="xl">
      <Paper
        withBorder
        radius="lg"
        p="xl"
        style={{
          background: "var(--raseed-gradient-soft)",
          borderColor: "var(--mantine-color-brand-2)",
        }}
      >
        <Grid align="center">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Group gap="md" wrap="nowrap" align="flex-start">
              <ThemeIcon
                size={48}
                radius="md"
                variant="white"
                color="brand"
                style={{ boxShadow: "var(--mantine-shadow-sm)" }}
              >
                <IconShieldCheck size={24} />
              </ThemeIcon>
              <Stack gap={4}>
                <Title order={3}>Privacy is a feature, not a footnote.</Title>
                <Text c="dimmed" size="sm" style={{ lineHeight: 1.6 }}>
                  Your <b>template</b> lives on our server. Your{" "}
                  <b>
                    contractors&apos; personal info, bank details, and line
                    items
                  </b>{" "}
                  stay in their browser — we never see them. One Clear-data
                  button on every contractor page wipes everything locally.
                </Text>
              </Stack>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Group justify="flex-end">
              <Button
                component={Link}
                href="/admin/demo"
                variant="default"
                rightSection={<IconArrowRight size={14} />}
              >
                See how it works
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
}

function WaitlistSection() {
  return (
    <Container size="md" py="xl" id="waitlist">
      <Stack gap="lg">
        <Stack gap={6} ta="center">
          <Text size="sm" fw={600} c="brand.6" tt="uppercase" lts="0.08em">
            Get early access
          </Text>
          <Title order={2}>Join the alpha</Title>
          <Text c="dimmed" maw={520} mx="auto">
            We&apos;re onboarding the first orgs by hand. Tell us a bit about
            your setup and we&apos;ll get back to you in a few business days.
          </Text>
        </Stack>
        <Waitlist />
      </Stack>
    </Container>
  );
}

function Faq() {
  return (
    <Container size="md" py="xl" id="faq">
      <Stack gap="lg">
        <Stack gap={6}>
          <Text size="sm" fw={600} c="brand.6" tt="uppercase" lts="0.08em">
            FAQ
          </Text>
          <Title order={2}>Common questions</Title>
        </Stack>
        <Stack gap="md">
          {FAQ.map((item) => (
            <Paper key={item.q} withBorder p="lg" radius="md">
              <Stack gap={6}>
                <Text fw={600}>{item.q}</Text>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.65 }}>
                  {item.a}
                </Text>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}

function Footer() {
  return (
    <Box
      component="footer"
      mt="xl"
      style={{ borderTop: "1px solid var(--raseed-hairline)" }}
    >
      <Container size="lg" py="xl">
        <Group justify="space-between" wrap="wrap" gap="md">
          <Group gap="md" wrap="wrap" align="center">
            <BrandWordmark size={22} />
            <FtmoiSignature />
          </Group>
          <Group gap="lg" align="center">
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
            <FeedbackButton
              source="landing-footer"
              label="Feedback"
              variant="subtle"
              color="gray"
              size="xs"
              hideIcon
            />
          </Group>
        </Group>
      </Container>
    </Box>
  );
}

export function LandingPage() {
  return (
    <AppTheme>
      <TopNav />
      <Hero />
      <Divider />
      <Features />
      <HowItWorks />
      <PrivacyBanner />
      <Divider />
      <WaitlistSection />
      <Divider />
      <Faq />
      <Footer />
    </AppTheme>
  );
}
