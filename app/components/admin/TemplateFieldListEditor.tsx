"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Code,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconGripVertical,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import { useState } from "react";
import type { TemplateFieldDefinition } from "@/lib/invoice-template";
import type { TemplateFormShape } from "./template-form-helpers";

export type TemplateFieldListKey = "contractorFields" | "bankFields";

export type TemplateFieldPreset = {
  label: string;
  fields: TemplateFieldDefinition[];
};

function generateFieldId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `field_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `field_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function SortableFieldRow({
  field,
  idx,
  listKey,
  form,
}: {
  field: TemplateFieldDefinition;
  idx: number;
  listKey: TemplateFieldListKey;
  form: UseFormReturnType<TemplateFormShape>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    boxShadow: isDragging
      ? "0 8px 24px rgba(0, 0, 0, 0.08)"
      : undefined,
  };

  return (
    <Paper ref={setNodeRef} withBorder p="md" radius="md" style={style}>
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Group gap="xs" wrap="nowrap" align="flex-start" flex={1}>
            <ActionIcon
              ref={setActivatorNodeRef}
              variant="subtle"
              color="gray"
              size="lg"
              radius="md"
              style={{
                cursor: isDragging ? "grabbing" : "grab",
                flexShrink: 0,
                marginTop: 2,
                touchAction: "none",
              }}
              {...listeners}
              {...attributes}
              aria-label={`Reorder field ${idx + 1}`}
            >
              <IconGripVertical size={18} stroke={1.5} />
            </ActionIcon>
            <Stack gap={4} flex={1} miw={0}>
              <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                Field {idx + 1}
                <Text span size="xs" ml={8} fw={400} tt="none" c="dimmed">
                  id: <Code fz="xs">{field.id}</Code>
                </Text>
              </Text>
            </Stack>
          </Group>
          <ActionIcon
            color="red"
            variant="subtle"
            size="sm"
            onClick={() => form.removeListItem(listKey, idx)}
            aria-label="Remove field"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>

        <TextInput
          label="Label shown to contractor"
          placeholder='e.g. "IBAN" or "Full name"'
          {...form.getInputProps(`${listKey}.${idx}.label`)}
        />
        <TextInput
          label="Placeholder (optional)"
          placeholder="Hint text inside the empty input"
          {...form.getInputProps(`${listKey}.${idx}.placeholder`)}
        />
        <Checkbox
          label="Required — contractor must fill this before exporting"
          {...form.getInputProps(`${listKey}.${idx}.required`, {
            type: "checkbox",
          })}
        />
      </Stack>
    </Paper>
  );
}

function DragOverlayCard({ field, idx }: { field: TemplateFieldDefinition; idx: number }) {
  return (
    <Paper withBorder p="md" radius="md" shadow="md">
      <Group gap="xs" wrap="nowrap">
        <ActionIcon variant="subtle" color="gray" size="lg" radius="md" style={{ cursor: "grabbing" }}>
          <IconGripVertical size={18} stroke={1.5} />
        </ActionIcon>
        <Stack gap={2}>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed">
            Field {idx + 1}
          </Text>
          <Text size="sm" fw={500} lineClamp={2}>
            {field.label.trim() || "Untitled field"}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}

export function TemplateFieldListEditor({
  form,
  listKey,
  title,
  description,
  presets,
  emptyHint,
}: {
  form: UseFormReturnType<TemplateFormShape>;
  listKey: TemplateFieldListKey;
  title: string;
  description: string;
  presets: TemplateFieldPreset[];
  emptyHint: string;
}) {
  const fields = form.values[listKey];
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const applyPreset = (next: TemplateFieldDefinition[]) => {
    form.setFieldValue(
      listKey,
      next.map((f) => ({
        id: f.id,
        label: f.label,
        required: f.required,
        ...(f.placeholder?.trim()
          ? { placeholder: f.placeholder.trim() }
          : {}),
      })),
    );
  };

  const addField = () => {
    form.insertListItem(listKey, {
      id: generateFieldId(),
      label: "",
      placeholder: "",
      required: false,
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    form.reorderListItem(listKey, { from: oldIndex, to: newIndex });
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeField =
    activeId === null ? null : fields.find((f) => f.id === activeId);
  const activeIdx =
    activeField === undefined || activeField === null
      ? -1
      : fields.findIndex((f) => f.id === activeId);

  const itemIds = fields.map((f) => f.id);

  return (
    <Stack gap="md">
      <div>
        <Title order={5}>{title}</Title>
        <Text size="xs" c="dimmed" mt={6}>
          {description}
        </Text>
      </div>

      <Group gap="xs" wrap="wrap">
        {presets.map((p) => (
          <Button
            key={p.label}
            variant="light"
            color="gray"
            size="xs"
            onClick={() =>
              applyPreset(
                p.fields.map((f) => ({
                  ...f,
                  ...(f.placeholder
                    ? { placeholder: f.placeholder }
                    : {}),
                })),
              )
            }
          >
            {p.label}
          </Button>
        ))}
      </Group>

      {fields.length === 0 ? (
        <Text size="sm" c="dimmed" fs="italic">
          {emptyHint}
        </Text>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <Stack gap="sm">
              {fields.map((field, idx) => (
                <SortableFieldRow
                  key={field.id}
                  field={field}
                  idx={idx}
                  listKey={listKey}
                  form={form}
                />
              ))}
            </Stack>
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeField !== undefined && activeField !== null && activeIdx >= 0 ? (
              <Box style={{ width: "min(100vw - 32px, 420px)" }}>
                <DragOverlayCard field={activeField} idx={activeIdx} />
              </Box>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <Button
        variant="light"
        leftSection={<IconPlus size={16} />}
        size="sm"
        onClick={addField}
        w="fit-content"
      >
        Add field
      </Button>
    </Stack>
  );
}
