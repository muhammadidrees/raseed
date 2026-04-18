"use client";

import { useEffect, useState } from "react";
import { useForm, UseFormReturnType } from "@mantine/form";
import {
  TextInput,
  Button,
  Group,
  Stack,
  ActionIcon,
  Text,
  NumberInput,
  Select,
  Anchor,
  Collapse,
  Modal,
  Box,
  Paper,
} from "@mantine/core";
import { MonthPickerInput, DatePickerInput } from "@mantine/dates";
import { InvoiceData } from "../types";
import { useInvoiceDataContext } from "../context/InvoiceDataContext";
import { useUnsavedChanges } from "../context/UnsavedChangesContext";
import {
  IconTrash,
  IconCurrencyEuro,
  IconGift,
  IconCheck,
} from "@tabler/icons-react";
import { randomId } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

const TERM_DESCRIPTIONS: Record<string, string> = {
  due_on_receipt: "Payment expected immediately upon receipt",
  net_15: "Due 15 days after invoice date",
  net_30: "Due 30 days after invoice date — standard business term",
  net_60: "Due 60 days after invoice date — common for large contracts",
  custom: "Set your own number of days",
};

const TERM_DAYS: Record<string, number> = {
  due_on_receipt: 0,
  net_15: 15,
  net_30: 30,
  net_60: 60,
};

function computeDueDate(
  invoiceDate: Date,
  dueTerms: string,
  customDueDays?: number,
): Date {
  const date = new Date(invoiceDate);
  const days =
    dueTerms === "custom" ? (customDueDays ?? 0) : (TERM_DAYS[dueTerms] ?? 0);
  date.setDate(date.getDate() + days);
  return date;
}

function onFromSubmit(
  form: UseFormReturnType<InvoiceData>,
  setFormData: React.Dispatch<React.SetStateAction<InvoiceData>>,
  periodStart: Date | null,
  periodEnd: Date | null,
  customPeriod: boolean,
) {
  const values = form.getValues();
  setFormData({
    ...values,
    periodStart: customPeriod && periodStart ? periodStart : undefined,
    periodEnd: customPeriod && periodEnd ? periodEnd : undefined,
  });
  notifications.show({
    color: "green",
    title: "Invoice Data Saved",
    message: "Invoice Data has been saved successfully",
  });
}

/** Compare the fields that are actually persisted, ignoring date (always reset to now) and period (session-only). */
function hasPersistableChanges(
  current: InvoiceData,
  saved: InvoiceData,
): boolean {
  if (current.dueTerms !== saved.dueTerms) return true;
  if ((current.customDueDays ?? null) !== (saved.customDueDays ?? null))
    return true;
  if (JSON.stringify(current.items) !== JSON.stringify(saved.items))
    return true;
  return false;
}

export default function InvoiceDataForm() {
  const { invoiceFromData: formData, setFormData } = useInvoiceDataContext();
  const { markUnsaved } = useUnsavedChanges();

  // Salary is stored in its own localStorage key — separate from personal info
  const [monthlySalary, setMonthlySalary] = useState<number | string>("");
  const [salaryLoaded, setSalaryLoaded] = useState(false);
  const [bonusModalOpen, setBonusModalOpen] = useState(false);
  const [bonusPercent, setBonusPercent] = useState<number | string>(25);
  const [spreadMonths, setSpreadMonths] = useState<number | string>(3);

  useEffect(() => {
    const stored = localStorage.getItem("monthlySalary");
    if (stored) setMonthlySalary(parseFloat(stored));
    setSalaryLoaded(true);
  }, []);

  useEffect(() => {
    if (!salaryLoaded) return;
    if (monthlySalary !== "" && monthlySalary !== 0) {
      localStorage.setItem("monthlySalary", String(monthlySalary));
    } else {
      localStorage.removeItem("monthlySalary");
    }
  }, [monthlySalary, salaryLoaded]);

  // Period dates are session-only (not persisted) — managed as local state
  const [customPeriod, setCustomPeriod] = useState(false);
  const [periodStart, setPeriodStart] = useState<Date | null>(null);
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null);
  const [periodError, setPeriodError] = useState<string | null>(null);
  const [currentValues, setCurrentValues] = useState<InvoiceData>(formData);

  const form = useForm<InvoiceData>({
    mode: "uncontrolled",
    initialValues: formData,
    onValuesChange: (values) => setCurrentValues(values),
  });

  const hasChanges =
    hasPersistableChanges(currentValues, formData) || customPeriod;

  useEffect(() => {
    markUnsaved("Invoice Data", hasChanges);
  }, [hasChanges]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    form.setValues(formData);
    setCurrentValues(formData);
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  // When the selected month changes, keep custom period in sync with new month
  const handleMonthChange = (value: string | null) => {
    const date = value ? new Date(value) : new Date();
    form.setFieldValue("date", date);
    if (customPeriod) {
      setPeriodStart(new Date(date.getFullYear(), date.getMonth(), 1));
      setPeriodEnd(new Date(date.getFullYear(), date.getMonth() + 1, 0));
      setPeriodError(null);
    }
  };

  const enableCustomPeriod = () => {
    const date: Date = form.getValues().date ?? new Date();
    setPeriodStart(new Date(date.getFullYear(), date.getMonth(), 1));
    setPeriodEnd(new Date(date.getFullYear(), date.getMonth() + 1, 0));
    setPeriodError(null);
    setCustomPeriod(true);
  };

  const resetCustomPeriod = () => {
    setPeriodStart(null);
    setPeriodEnd(null);
    setPeriodError(null);
    setCustomPeriod(false);
  };

  const handlePeriodStartChange = (value: string | null) => {
    const date = value ? new Date(value) : null;
    setPeriodStart(date);
    setPeriodError(null);
    // Clear end if it's now before new start
    if (date && periodEnd && periodEnd < date) {
      setPeriodEnd(null);
    }
  };

  const handlePeriodEndChange = (value: string | null) => {
    const date = value ? new Date(value) : null;
    setPeriodEnd(date);
    setPeriodError(null);
  };

  // Pro-rate calculator — session-only, derived from custom period + monthlySalary
  const intervalDays =
    customPeriod && periodStart && periodEnd
      ? Math.round((periodEnd.getTime() - periodStart.getTime()) / 86400000) + 1
      : 0;
  const daysInMonth = new Date(
    (currentValues.date ?? new Date()).getFullYear(),
    (currentValues.date ?? new Date()).getMonth() + 1,
    0,
  ).getDate();
  const proRatedAmount =
    monthlySalary && intervalDays > 0
      ? (Number(monthlySalary) / daysInMonth) * intervalDays
      : null;

  const [proRateAdded, setProRateAdded] = useState<string | null>(null);
  const [highlightedItemIdx, setHighlightedItemIdx] = useState<number | null>(
    null,
  );
  const applyProRatedAmount = () => {
    if (proRatedAmount === null) return;
    const rounded = Math.round(proRatedAmount * 100) / 100;
    const fullRate = Number(monthlySalary);
    const items = form.getValues().items;
    const targetIdx =
      items.findIndex((it) => !it.isBonusPayout && it.price === fullRate) !== -1
        ? items.findIndex((it) => !it.isBonusPayout && it.price === fullRate)
        : items.findIndex(
            (it) =>
              !it.isBonusPayout && (it.price === 0 || it.price === rounded),
          );
    if (targetIdx !== -1) {
      form.setFieldValue(`items.${targetIdx}.price`, rounded);
      setProRateAdded(`Updated item ${targetIdx + 1} amount ↓`);
      setHighlightedItemIdx(targetIdx);
    } else {
      form.insertListItem("items", {
        description: "",
        quantity: 1,
        price: rounded,
        key: randomId(),
      });
      const newIdx = form.getValues().items.length;
      setProRateAdded("Added to invoice items ↓");
      setHighlightedItemIdx(newIdx);
    }
    setTimeout(() => {
      setProRateAdded(null);
      setHighlightedItemIdx(null);
    }, 2500);
  };

  const handleSubmit = () => {
    if (customPeriod) {
      if (!periodStart || !periodEnd) {
        setPeriodError("Both period dates are required");
        return;
      }
      if (periodEnd < periodStart) {
        setPeriodError("End date must be after start date");
        return;
      }
    }
    onFromSubmit(form, setFormData, periodStart, periodEnd, customPeriod);
  };

  const fields = form.getValues().items.map((item, index) => {
    const invoiceDate = currentValues.date ?? new Date();
    const monthName = new Date(invoiceDate).toLocaleString("default", {
      month: "long",
    });
    return (
      <Group
        key={item.key}
        style={{
          borderRadius: 6,
          padding: "4px 6px",
          margin: "-4px -6px",
          transition: "background 0.4s ease",
          background:
            highlightedItemIdx === index
              ? "var(--mantine-color-teal-light)"
              : "transparent",
        }}
      >
        {item.isBonusPayout ? (
          <TextInput
            style={{ flex: 4 }}
            value={`Bonus Payout - ${monthName}`}
            readOnly
            leftSection={<IconGift size="0.9rem" />}
            styles={{ input: { fontStyle: "italic", opacity: 0.8 } }}
          />
        ) : (
          <TextInput
            placeholder="Description"
            withAsterisk
            style={{ flex: 4 }}
            key={form.key(`items.${index}.description`)}
            {...form.getInputProps(`items.${index}.description`)}
          />
        )}

        <NumberInput
          placeholder="Qty"
          style={{ flex: 1 }}
          key={form.key(`items.${index}.quantity`)}
          {...form.getInputProps(`items.${index}.quantity`)}
        />
        <NumberInput
          placeholder="Amount"
          style={{ flex: 1 }}
          key={form.key(`items.${index}.price`)}
          {...form.getInputProps(`items.${index}.price`)}
          hideControls
          rightSection={<IconCurrencyEuro />}
        />

        <ActionIcon
          color="red"
          disabled={index === 0}
          onClick={() => form.removeListItem("items", index)}
        >
          <IconTrash size="1rem" />
        </ActionIcon>
      </Group>
    );
  });

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Stack gap={4}>
          <MonthPickerInput
            mt="md"
            label="Invoice Date"
            placeholder="Invoice Date"
            withAsterisk
            key={form.key("date")}
            {...form.getInputProps("date")}
            onChange={handleMonthChange}
          />
          <Collapse expanded={customPeriod}>
            <Group mt="xs" grow align="flex-start">
              <DatePickerInput
                label="Period start"
                placeholder="Start date"
                value={periodStart}
                onChange={handlePeriodStartChange}
                error={periodError && !periodStart ? periodError : null}
              />
              <DatePickerInput
                label="Period end"
                placeholder="End date"
                value={periodEnd}
                onChange={handlePeriodEndChange}
                minDate={periodStart ?? undefined}
                error={
                  periodError && periodStart && !periodEnd ? periodError : null
                }
              />
            </Group>
            {periodError && periodStart && periodEnd && (
              <Text size="xs" c="red" mt={4}>
                {periodError}
              </Text>
            )}
          </Collapse>
          <Text size="xs" c="dimmed" mt={4}>
            {customPeriod ? (
              <>
                Custom period active —{" "}
                <Anchor size="xs" onClick={resetCustomPeriod}>
                  reset to full month
                </Anchor>
              </>
            ) : (
              <Anchor size="xs" onClick={enableCustomPeriod}>
                Customize period
              </Anchor>
            )}
          </Text>
        </Stack>

        {customPeriod &&
          periodStart &&
          periodEnd &&
          (() => {
            // Pre-fill monthly rate from first item if not already set
            if (!monthlySalary) {
              const firstItem = form.getValues().items[0];
              if (firstItem?.price) setMonthlySalary(firstItem.price);
            }
            const isFullMonth = intervalDays === daysInMonth;
            return (
              <Paper withBorder p="sm" radius="md">
                <Text size="xs" c="dimmed" fw={500} mb={2}>
                  Pro-rate calculator
                </Text>
                {isFullMonth ? (
                  <Text size="xs" c="dimmed" lh={1.5}>
                    Period covers the full month — adjust the dates to calculate
                    a pro-rated amount.
                  </Text>
                ) : (
                  <>
                    <Text size="xs" c="dimmed" mb="xs" lh={1.5}>
                      If you worked only part of the month, enter your full
                      monthly rate to calculate the proportional amount for this
                      period.
                    </Text>
                    <NumberInput
                      label="Monthly rate"
                      size="xs"
                      value={monthlySalary}
                      onChange={setMonthlySalary}
                      hideControls
                      rightSection={<IconCurrencyEuro size="0.8rem" />}
                      mb="xs"
                    />
                    {proRatedAmount !== null ? (
                      <>
                        <Text size="xs" c="dimmed" mb="xs">
                          (€{Number(monthlySalary).toLocaleString()} ÷{" "}
                          {daysInMonth} days) × {intervalDays} days ={" "}
                          <Text span fw={600}>
                            €{proRatedAmount.toFixed(2)}
                          </Text>
                        </Text>
                        <Button
                          size="xs"
                          variant="light"
                          color={proRateAdded ? "teal" : "blue"}
                          leftSection={
                            proRateAdded ? <IconCheck size={13} /> : undefined
                          }
                          fullWidth
                          onClick={applyProRatedAmount}
                        >
                          {proRateAdded ?? "Apply to invoice"}
                        </Button>
                      </>
                    ) : (
                      <Text size="xs" c="dimmed">
                        Enter your monthly rate above to calculate the pro-rated
                        amount
                      </Text>
                    )}
                  </>
                )}
              </Paper>
            );
          })()}

        <Select
          mt="md"
          label="Payment Terms"
          placeholder="Select payment terms"
          description="When payment is expected"
          withAsterisk
          data={[
            { value: "due_on_receipt", label: "Due on Receipt" },
            { value: "net_15", label: "Net 15" },
            { value: "net_30", label: "Net 30" },
            { value: "net_60", label: "Net 60" },
            { value: "custom", label: "Custom" },
          ]}
          renderOption={({ option }) => (
            <Stack gap={1} py={2}>
              <Text size="sm" fw={500}>
                {option.label}
              </Text>
              <Text size="xs" c="dimmed">
                {TERM_DESCRIPTIONS[option.value]}
              </Text>
            </Stack>
          )}
          allowDeselect={false}
          key={form.key("dueTerms")}
          {...form.getInputProps("dueTerms")}
        />

        {form.getValues().dueTerms === "custom" && (
          <NumberInput
            mt="md"
            label="Custom Days"
            placeholder="Enter number of days"
            description="Number of days after invoice date"
            withAsterisk
            min={1}
            max={365}
            key={form.key("customDueDays")}
            {...form.getInputProps("customDueDays")}
          />
        )}

        {currentValues.dueTerms && (
          <Group gap={6} mt={-4}>
            <Text size="xs" c="dimmed">
              Due date:
            </Text>
            <Text size="xs" fw={600}>
              {computeDueDate(
                currentValues.date ?? new Date(),
                currentValues.dueTerms,
                currentValues.customDueDays,
              ).toLocaleDateString("default", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </Group>
        )}

        {fields.length > 0 ? (
          <Group>
            <Text fw={500} size="sm">
              Invoice Items
            </Text>
          </Group>
        ) : (
          <Text c="dimmed" ta="center">
            No items added...
          </Text>
        )}

        {fields}

        <Group align="center" mb="xl" grow>
          <Button
            onClick={() =>
              form.insertListItem("items", {
                description: "",
                quantity: 1,
                price: 0,
                key: randomId(),
              })
            }
            variant="light"
          >
            Add item
          </Button>
          <Button
            variant="light"
            color="violet"
            leftSection={<IconGift size="1rem" />}
            onClick={() => {
              if (!monthlySalary) {
                const firstItem = form.getValues().items[0];
                if (firstItem?.price) setMonthlySalary(firstItem.price);
              }
              setBonusModalOpen(true);
            }}
          >
            Add Bonus Payout
          </Button>
        </Group>

        <Modal
          opened={bonusModalOpen}
          onClose={() => setBonusModalOpen(false)}
          title="Bonus Payout"
          centered
        >
          <Stack gap="sm">
            <NumberInput
              label="Monthly Salary"
              placeholder="Your monthly salary"
              min={0}
              hideControls
              value={monthlySalary}
              onChange={setMonthlySalary}
              rightSection={<IconCurrencyEuro size="1rem" />}
            />
            <Group grow>
              <NumberInput
                label="Bonus %"
                description="Percentage of salary"
                min={1}
                max={100}
                value={bonusPercent}
                onChange={setBonusPercent}
                rightSection={
                  <Text size="xs" c="dimmed">
                    %
                  </Text>
                }
              />
              <NumberInput
                label="Spread over"
                description="Number of months to spread it over"
                min={1}
                max={12}
                value={spreadMonths}
                onChange={setSpreadMonths}
              />
            </Group>

            {(() => {
              const salary = Number(monthlySalary);
              const pct = Number(bonusPercent);
              const months = Number(spreadMonths);
              const invoiceDate = form.getValues().date ?? new Date();
              const monthName = new Date(invoiceDate).toLocaleString(
                "default",
                { month: "long" },
              );
              const amount =
                salary > 0 && pct > 0 && months > 0
                  ? (salary * pct) / 100 / months
                  : null;
              return (
                <Paper
                  withBorder
                  p="sm"
                  radius="sm"
                  style={{ borderColor: "var(--mantine-color-violet-filled)" }}
                >
                  <Text size="xs" c="dimmed" mb={4}>
                    Preview
                  </Text>
                  <Text size="sm" fw={500}>
                    Bonus Payout - {monthName}
                  </Text>
                  {amount ? (
                    <>
                      <Text size="xs" c="dimmed" mt={4}>
                        (€{salary} × {pct}%) ÷ {months}{" "}
                        {months === 1 ? "month" : "months"} = €
                        {amount.toFixed(2)}
                      </Text>
                      <Text size="sm" c="violet.5" fw={600} mt={2}>
                        €{amount.toFixed(2)}
                      </Text>
                    </>
                  ) : (
                    <Text size="sm" c="dimmed">
                      Enter salary to see amount
                    </Text>
                  )}
                </Paper>
              );
            })()}

            <Group mt="sm" justify="flex-end">
              <Button
                variant="default"
                onClick={() => setBonusModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                color="violet"
                disabled={!monthlySalary}
                onClick={() => {
                  const salary = Number(monthlySalary);
                  const pct = Number(bonusPercent);
                  const months = Number(spreadMonths);
                  const bonusAmount = (salary * pct) / (100 * months);
                  const invoiceDate = form.getValues().date ?? new Date();
                  const monthName = new Date(invoiceDate).toLocaleString(
                    "default",
                    { month: "long" },
                  );
                  form.insertListItem("items", {
                    description: `Bonus Payout - ${monthName}`,
                    quantity: 1,
                    price: parseFloat(bonusAmount.toFixed(2)),
                    key: randomId(),
                    isBonusPayout: true,
                  });
                  setBonusModalOpen(false);
                }}
              >
                Add to Invoice
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Group align="center" mb="xl" grow>
          <Button type="submit" disabled={!hasChanges}>
            Save
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
