import { Accordion, useMantineTheme } from "@mantine/core";
import {
  IconAlertSquareRounded,
  IconSquareRoundedCheck,
  IconHelpSquareRounded,
} from "@tabler/icons-react";

interface AccordionControlProps {
  label: string;
  isFormEmpty: boolean;
  isFormUnsaved: boolean;
}

export function AccordianControl({
  label,
  isFormEmpty,
  isFormUnsaved,
}: AccordionControlProps) {
  const theme = useMantineTheme();

  return (
    <Accordion.Control
      suppressHydrationWarning
      icon={
        isFormEmpty ? (
          <IconAlertSquareRounded color={theme.colors.red[6]} />
        ) : isFormUnsaved ? (
          <IconHelpSquareRounded color={theme.colors.brand[6]} />
        ) : (
          <IconSquareRoundedCheck color={theme.colors.teal[6]} />
        )
      }
    >
      {label}
    </Accordion.Control>
  );
}
