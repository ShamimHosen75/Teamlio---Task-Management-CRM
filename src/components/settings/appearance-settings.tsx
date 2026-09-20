import { useEffect, useState } from "react";
import { Check, Laptop, Moon, Palette, RotateCcw, Save, Sun, Type } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  applyAppearance,
  DEFAULT_APPEARANCE,
  FONT_OPTIONS,
  readAppearance,
  saveAppearance,
  type AppearanceSettings,
  type ThemeMode,
} from "@/lib/appearance";
import { cn } from "@/lib/utils";

const PRESETS: Array<{ name: string; description: string; primary: string; text: string }> = [
  { name: "Ocean Blue", description: "Clear and professional", primary: "#2563eb", text: "#202738" },
  { name: "Forest Green", description: "Calm and grounded", primary: "#16835f", text: "#1f2937" },
  { name: "Sunset Coral", description: "Warm and energetic", primary: "#e4563f", text: "#2d2530" },
  { name: "Royal Violet", description: "Confident and refined", primary: "#7c3aed", text: "#27213b" },
  { name: "Graphite", description: "Restrained and neutral", primary: "#475569", text: "#20242d" },
  { name: "Rose", description: "Modern and expressive", primary: "#db2777", text: "#30212a" },
];

const MODES: Array<{ value: ThemeMode; label: string; description: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", description: "Always light", icon: Sun },
  { value: "dark", label: "Dark", description: "Always dark", icon: Moon },
  { value: "system", label: "System", description: "Match this device", icon: Laptop },
];

function ColorField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex min-w-0 items-center gap-2">
        <label className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-md border shadow-sm">
          <span className="block size-full" style={{ backgroundColor: value }} />
          <input
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={`Choose ${label.toLowerCase()}`}
          />
        </label>
        <Input
          value={value}
          onChange={(event) => {
            if (/^#[0-9a-f]{0,6}$/i.test(event.target.value)) onChange(event.target.value);
          }}
          onBlur={() => {
            if (!/^#[0-9a-f]{6}$/i.test(value)) onChange(DEFAULT_APPEARANCE.primary);
          }}
          className="min-w-0 font-mono uppercase"
          maxLength={7}
        />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function AppearanceSettingsPanel() {
  const [settings, setSettings] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);
  const [saved, setSaved] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);

  useEffect(() => {
    const current = readAppearance();
    setSettings(current);
    setSaved(current);
  }, []);

  useEffect(() => {
    applyAppearance(settings);
  }, [settings]);

  function update<K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function onSave() {
    saveAppearance(settings);
    setSaved(settings);
    toast.success("Appearance saved across this workspace");
  }

  function onReset() {
    setSettings(DEFAULT_APPEARANCE);
    saveAppearance(DEFAULT_APPEARANCE);
    setSaved(DEFAULT_APPEARANCE);
    toast.success("Default appearance restored");
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(saved);

  return (
    <div className="space-y-4">
      <section className="surface-card p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-md bg-primary-soft p-2 text-primary"><Moon className="size-4" /></div>
          <div>
            <h2 className="text-sm font-semibold">Appearance mode</h2>
            <p className="text-xs text-muted-foreground">Choose how the workspace looks on this device.</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const active = settings.mode === mode.value;
            return (
              <Button
                key={mode.value}
                type="button"
                variant="outline"
                onClick={() => update("mode", mode.value)}
                className={cn(
                  "relative h-auto min-h-20 flex-col gap-1 py-3",
                  active && "border-primary bg-primary-soft text-primary ring-1 ring-primary",
                )}
              >
                <Icon className="size-5" />
                <span>{mode.label}</span>
                <span className="text-[11px] font-normal text-muted-foreground">{mode.description}</span>
                {active ? <Check className="absolute right-2 top-2 size-4" /> : null}
              </Button>
            );
          })}
        </div>
      </section>

      <section className="surface-card p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-md bg-primary-soft p-2 text-primary"><Palette className="size-4" /></div>
          <div>
            <h2 className="text-sm font-semibold">Theme presets</h2>
            <p className="text-xs text-muted-foreground">Apply a polished color direction in one click.</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {PRESETS.map((preset) => {
            const active = settings.primary.toLowerCase() === preset.primary.toLowerCase();
            return (
              <Button
                key={preset.name}
                type="button"
                variant="outline"
                onClick={() => setSettings((current) => ({ ...current, primary: preset.primary, text: preset.text }))}
                className={cn("h-auto justify-start gap-3 px-3 py-3 text-left", active && "border-primary ring-1 ring-primary")}
              >
                <span className="flex shrink-0 -space-x-1">
                  <span className="size-6 rounded-full border-2 border-background" style={{ backgroundColor: preset.primary }} />
                  <span className="size-6 rounded-full border-2 border-background" style={{ backgroundColor: preset.text }} />
                  <span className="size-6 rounded-full border-2 border-background bg-surface" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold">{preset.name}</span>
                  <span className="block truncate text-[11px] font-normal text-muted-foreground">{preset.description}</span>
                </span>
              </Button>
            );
          })}
        </div>
      </section>

      <section className="surface-card p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-md bg-primary-soft p-2 text-primary"><Type className="size-4" /></div>
          <div>
            <h2 className="text-sm font-semibold">Colors and typography</h2>
            <p className="text-xs text-muted-foreground">Fine-tune buttons, text, typeface, and corners.</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <ColorField label="Button color" description="Primary buttons, links and selected items" value={settings.primary} onChange={(value) => update("primary", value)} />
          <ColorField label="Button text color" description="Text and icons on primary buttons" value={settings.primaryForeground} onChange={(value) => update("primaryForeground", value)} />
          <ColorField label="Workspace text color" description="Headings and main body text" value={settings.text} onChange={(value) => update("text", value)} />
          <div className="space-y-1.5 md:col-span-1">
            <Label>Font style</Label>
            <Select value={settings.font} onValueChange={(value) => update("font", value as AppearanceSettings["font"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Used throughout menus, forms, tables and reports</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="corner-radius">Corner style</Label>
              <span className="text-xs tabular-nums text-muted-foreground">{settings.radius}px</span>
            </div>
            <input
              id="corner-radius"
              type="range"
              min="4"
              max="20"
              step="2"
              value={settings.radius}
              onChange={(event) => update("radius", Number(event.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground"><span>Sharp</span><span>Rounded</span></div>
          </div>
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="border-b px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold">Live preview</h2>
          <p className="text-xs text-muted-foreground">Your choices are shown here before saving.</p>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
          <div className="min-w-0">
            <p className="font-display text-base font-semibold">Project overview</p>
            <p className="mt-1 text-sm text-muted-foreground">Review active work and keep your team aligned.</p>
          </div>
          <div className="flex flex-wrap gap-2"><Button variant="outline">View report</Button><Button>Create project</Button></div>
        </div>
      </section>

      <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-2 rounded-lg border bg-surface/95 p-3 shadow-raised backdrop-blur sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onReset}><RotateCcw className="size-4" />Reset defaults</Button>
        <Button onClick={onSave} disabled={!hasChanges}><Save className="size-4" />Apply and save</Button>
      </div>
    </div>
  );
}