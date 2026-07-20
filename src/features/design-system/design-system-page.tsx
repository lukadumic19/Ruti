"use client";

/**
 * Intern komponentoversigt for udviklere – visuel reference for hele projektet.
 * BEMÆRK: Denne side er udviklerværktøj og er bevidst undtaget fra i18n-reglen
 * om beskedfiler; produktkomponenterne på siden bruger fortsat da.json.
 */
import * as React from "react";
import {
  Bed,
  CookingPot,
  DoorClosed,
  Fan,
  Lamp,
  Lightbulb,
  Moon,
  MoreHorizontal,
  Pencil,
  Play,
  Settings,
  Sofa,
  Sparkles,
  Sun,
  Timer,
  Trash2,
  Tv,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

import { BatteryStatus } from "@/components/devices/battery-status";
import { DeviceCard } from "@/components/devices/device-card";
import { HumidityDisplay } from "@/components/devices/humidity-display";
import { QuickActionButton } from "@/components/devices/quick-action-button";
import { SensorValue } from "@/components/devices/sensor-value";
import { TemperatureDisplay } from "@/components/devices/temperature-display";
import { AlertCard } from "@/components/feedback/alert-card";
import { ConfirmationFeedback } from "@/components/feedback/confirmation-feedback";
import {
  ConnectionStatus,
  type ConnectionUiState,
} from "@/components/feedback/connection-status";
import { OfflineBanner } from "@/components/feedback/offline-banner";
import { PageHeader } from "@/components/layout/page-header";
import { RoomCard } from "@/components/rooms/room-card";
import { SceneCard } from "@/components/scenes/scene-card";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { PageSkeleton } from "@/components/states/page-skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetTitle,
  BottomSheetTrigger,
} from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { ColorTemperaturePicker } from "@/components/ui/color-temperature-picker";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sections = [
  { id: "layout", label: "Layout" },
  { id: "status", label: "Status" },
  { id: "kort", label: "Kort" },
  { id: "sensorer", label: "Sensorer" },
  { id: "kontroller", label: "Kontroller" },
  { id: "dialoger", label: "Dialoger" },
  { id: "feedback", label: "Feedback" },
  { id: "tilstande", label: "Tilstande" },
] as const;

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-20">
      <h2 id={`${id}-heading`} className="text-lg font-semibold">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-4 flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Example({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

export function DesignSystemPage() {
  const [lampOn, setLampOn] = React.useState(true);
  const [brightness, setBrightness] = React.useState(70);
  const [switchOn, setSwitchOn] = React.useState(true);
  const [view, setView] = React.useState<"day" | "week" | "month">("day");
  const [color, setColor] = React.useState<string | null>("amber");
  const [colorTemp, setColorTemp] = React.useState(2700);
  const [sceneBusy, setSceneBusy] = React.useState(false);
  const [sceneDone, setSceneDone] = React.useState(false);
  const [connection, setConnection] =
    React.useState<ConnectionUiState>("connected");

  const activateDemoScene = () => {
    setSceneDone(false);
    setSceneBusy(true);
    window.setTimeout(() => {
      setSceneBusy(false);
      setSceneDone(true);
    }, 1200);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-10">
        <div>
          <PageHeader
            title="Designsystem"
            description="Intern komponentoversigt – visuel reference for alle moduler. Skift tema i headeren for at se lys/mørk variant."
          />
          <nav aria-label="Sektioner" className="mt-4 flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex min-h-11 items-center rounded-md border border-border bg-card px-3 text-sm hover:bg-muted"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>

        <Section
          id="layout"
          title="Layout"
          description="App-header, bundnavigation og sidebar er globale og ses i selve app-skallen omkring denne side. Side-headeren bruges øverst på hver side."
        >
          <Example label="Side-header (PageHeader)">
            <div className="rounded-lg border border-border p-4">
              <PageHeader title="Stue" description="4 enheder · 21,5 °C">
                <Button variant="secondary">
                  <Pencil aria-hidden="true" />
                  Redigér
                </Button>
              </PageHeader>
            </div>
          </Example>
        </Section>

        <Section
          id="status"
          title="Status"
          description="Status formidles altid med ikon OG tekst – aldrig kun farve."
        >
          <Example label="Statusbadge – enhedstilstande">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="on" />
              <StatusBadge status="off" />
              <StatusBadge status="busy" />
              <StatusBadge status="unavailable" />
              <StatusBadge status="error" />
              <StatusBadge status="on" label="Låst" />
            </div>
          </Example>
          <Example label="Basis-badges">
            <div className="flex flex-wrap gap-2">
              <Badge>Standard</Badge>
              <Badge variant="success">Alt lukket</Badge>
              <Badge variant="warning">Demo</Badge>
              <Badge variant="destructive">3 åbne vinduer</Badge>
              <Badge variant="info">Opdatering</Badge>
              <Badge variant="outline">Neutral</Badge>
            </div>
          </Example>
          <Example label="Forbindelsesstatus (klik for at skifte)">
            <div className="flex flex-wrap items-center gap-3">
              {(["connected", "reconnecting", "offline", "demo"] as const).map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setConnection(s)}
                    className="rounded-full"
                  >
                    <ConnectionStatus state={s} />
                  </button>
                ),
              )}
              <span className="text-sm text-muted-foreground">
                Valgt: <ConnectionStatus state={connection} />
              </span>
            </div>
          </Example>
          <Example label="Offline-banner">
            <div className="flex flex-col gap-3 overflow-hidden rounded-lg border border-border">
              <OfflineBanner
                state="offline"
                onRetry={() => toast("Prøver at forbinde igen …")}
              />
              <OfflineBanner state="reconnecting" />
            </div>
          </Example>
          <Example label="Batteristatus">
            <div className="flex flex-wrap gap-4">
              <BatteryStatus pct={92} />
              <BatteryStatus pct={45} />
              <BatteryStatus pct={15} />
              <BatteryStatus pct={55} charging />
            </div>
          </Example>
        </Section>

        <Section
          id="kort"
          title="Kort"
          description="Enheds-, rum- og scenekort er appens primære byggesten. Utilgængelige enheder nedtones men skjules aldrig."
        >
          <Example label="Enhedskort – interaktivt (tændt/slukket med lysstyrke)">
            <div className="max-w-md">
              <DeviceCard
                name="Gulvlampe"
                icon={Lamp}
                status={lampOn ? "on" : "off"}
                detail={`Stue · ${brightness} %`}
                onToggle={setLampOn}
              >
                {lampOn ? (
                  <Slider
                    min={1}
                    max={100}
                    value={[brightness]}
                    onValueChange={([v]) => {
                      if (v !== undefined) setBrightness(v);
                    }}
                    thumbLabel="Lysstyrke for Gulvlampe"
                    valueText={`${brightness} %`}
                  />
                ) : null}
              </DeviceCard>
            </div>
          </Example>
          <Example label="Enhedskort – alle tilstande">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DeviceCard
                name="Loftlampe"
                icon={Lightbulb}
                status="on"
                onToggle={() => undefined}
              />
              <DeviceCard
                name="Læselampe"
                icon={Lamp}
                status="off"
                onToggle={() => undefined}
              />
              <DeviceCard
                name="Ventilator"
                icon={Fan}
                status="busy"
                onToggle={() => undefined}
              />
              <DeviceCard
                name="Vindueslampe"
                icon={Lamp}
                status="unavailable"
                onToggle={() => undefined}
              />
              <DeviceCard
                name="Hoveddør"
                icon={DoorClosed}
                status="error"
                statusLabel="Låsen svarer ikke – tjek døren"
              />
            </div>
          </Example>
          <Example label="Rumkort">
            <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
              <RoomCard
                name="Stue"
                icon={Sofa}
                temperatureC={21.5}
                humidityPct={45}
                lightsLabel="2 lys tændt"
                onPress={() => toast("Ville åbne rummet Stue")}
              />
              <RoomCard
                name="Soveværelse"
                icon={Bed}
                temperatureC={18.2}
                lightsLabel="Alt lys slukket"
                onPress={() => toast("Ville åbne Soveværelse")}
              />
              <RoomCard
                name="Køkken"
                icon={CookingPot}
                onPress={() => toast("Ville åbne Køkken")}
              />
            </div>
          </Example>
          <Example label="Scenekort (den første simulerer aktivering)">
            <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
              <SceneCard
                name="Godnat"
                icon={Moon}
                description="Slukker alt lys og låser døren"
                busy={sceneBusy}
                onActivate={activateDemoScene}
              />
              <SceneCard
                name="Babytilstand"
                icon={Sparkles}
                active
                onActivate={() => toast("Babytilstand slået fra")}
              />
              <SceneCard
                name="Filmaften"
                icon={Tv}
                disabled
                onActivate={() => undefined}
              />
            </div>
            {sceneDone ? (
              <ConfirmationFeedback
                className="mt-3"
                message="Godnat er aktiveret"
              />
            ) : null}
          </Example>
          <Example label="Hurtighandlingsknapper (babytilstandens natterække)">
            <div className="grid max-w-md grid-cols-4 gap-2">
              <QuickActionButton icon={Moon} label="Natlys" active />
              <QuickActionButton icon={Volume2} label="White noise" />
              <QuickActionButton icon={Timer} label="Bleskift" busy />
              <QuickActionButton icon={Play} label="Måltid" disabled />
            </div>
          </Example>
          <Example label="Advarselskort">
            <div className="flex max-w-xl flex-col gap-3">
              <AlertCard
                severity="info"
                title="Vaskemaskinen er færdig"
                description="Strømforbruget faldt for 5 minutter siden."
                onDismiss={() => toast("Lukket")}
              />
              <AlertCard
                severity="warning"
                title="CO₂ er højt i soveværelset"
                description="1.450 ppm målt de sidste 10 minutter. Luft ud nu."
                action={{
                  label: "Se soveværelset",
                  onClick: () => toast("Ville åbne rummet"),
                }}
              />
              <AlertCard
                severity="critical"
                title="Hoveddøren kunne ikke låses"
                description="Låsen svarer ikke. Tjek om døren er lukket helt."
                action={{
                  label: "Prøv igen",
                  onClick: () => toast("Prøver igen …"),
                }}
              />
            </div>
          </Example>
        </Section>

        <Section
          id="sensorer"
          title="Sensorer"
          description="Sensorværdier med enhed, tom-tilstand, loading og forældet-markering."
        >
          <Example label="Temperatur, luftfugtighed og generisk sensor">
            <div className="grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              <TemperatureDisplay label="Stue" valueC={21.5} />
              <HumidityDisplay label="Stue" valuePct={45} />
              <TemperatureDisplay label="Badeværelse" valueC={23.8} stale />
              <SensorValue label="CO₂ · Soveværelse" value={820} unit="ppm" />
            </div>
          </Example>
          <Example label="Loading og ingen data">
            <div className="grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              <TemperatureDisplay label="Kontor" valueC={null} loading />
              <HumidityDisplay label="Kælder" valuePct={null} />
            </div>
          </Example>
        </Section>

        <Section
          id="kontroller"
          title="Kontroller"
          description="Alle kontroller kan betjenes med tastatur og har trykflader på mindst 44 px."
        >
          <Example label="Toggle (tændt / slukket / deaktiveret)">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={switchOn}
                  onCheckedChange={setSwitchOn}
                  aria-label="Demo-kontakt"
                />
                {switchOn ? "Tændt" : "Slukket"}
              </label>
              <Switch
                checked
                disabled
                aria-label="Deaktiveret kontakt (tændt)"
              />
              <Switch
                checked={false}
                disabled
                aria-label="Deaktiveret kontakt (slukket)"
              />
            </div>
          </Example>
          <Example label="Slider (lysstyrke)">
            <div className="max-w-sm">
              <Slider
                min={1}
                max={100}
                value={[brightness]}
                onValueChange={([v]) => {
                  if (v !== undefined) setBrightness(v);
                }}
                thumbLabel="Lysstyrke"
                valueText={`${brightness} %`}
              />
              <p className="text-sm text-muted-foreground">{brightness} %</p>
            </div>
          </Example>
          <Example label="Segmented control">
            <div className="max-w-sm">
              <SegmentedControl
                label="Periode"
                value={view}
                onValueChange={setView}
                options={[
                  { value: "day", label: "Dag", icon: Sun },
                  { value: "week", label: "Uge" },
                  { value: "month", label: "Måned" },
                ]}
              />
            </div>
          </Example>
          <Example label="Farvevælger (kurateret palette)">
            <div className="max-w-md">
              <ColorPicker value={color} onValueChange={setColor} />
            </div>
          </Example>
          <Example label="Farvetemperaturvælger">
            <div className="max-w-sm">
              <ColorTemperaturePicker
                valueK={colorTemp}
                onValueChange={setColorTemp}
              />
            </div>
          </Example>
        </Section>

        <Section
          id="dialoger"
          title="Dialoger og menuer"
          description="Dialog til indhold, bottom sheet til mobilkontekst, bekræftelsesdialog til handlinger med konsekvens."
        >
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Åbn dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Omdøb rum</DialogTitle>
                  <DialogDescription>
                    Navnet vises overalt i appen – vælg noget hele familien
                    kender.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="secondary">Annuller</Button>
                  <Button>Gem</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <BottomSheet>
              <BottomSheetTrigger asChild>
                <Button variant="secondary">Åbn bottom sheet</Button>
              </BottomSheetTrigger>
              <BottomSheetContent>
                <BottomSheetTitle className="text-lg font-semibold">
                  Gulvlampe
                </BottomSheetTitle>
                <BottomSheetDescription className="mt-1 text-sm text-muted-foreground">
                  Hurtige kontroller for lampen i stuen.
                </BottomSheetDescription>
                <div className="mt-4">
                  <Slider
                    min={1}
                    max={100}
                    defaultValue={[70]}
                    thumbLabel="Lysstyrke"
                  />
                </div>
              </BottomSheetContent>
            </BottomSheet>

            <ConfirmDialog
              trigger={<Button variant="destructive">Slet scene</Button>}
              title="Slet scenen Filmaften?"
              description="Scenen fjernes for hele familien. Dette kan ikke fortrydes."
              confirmLabel="Slet scenen"
              destructive
              onConfirm={() => toast("Scenen er slettet")}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">
                  <MoreHorizontal aria-hidden="true" />
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Gulvlampe</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => toast("Ville omdøbe")}>
                  <Pencil aria-hidden="true" />
                  Omdøb
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast("Ville flytte")}>
                  <Settings aria-hidden="true" />
                  Flyt til andet rum
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => toast("Ville skjule")}>
                  <Trash2 aria-hidden="true" />
                  Skjul enhed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost">Hold musen her (tooltip)</Button>
              </TooltipTrigger>
              <TooltipContent>
                Supplerende forklaring – aldrig kritisk information.
              </TooltipContent>
            </Tooltip>
          </div>

          <Example label="Tabs">
            <div className="max-w-md">
              <Tabs defaultValue="devices">
                <TabsList>
                  <TabsTrigger value="devices">Enheder</TabsTrigger>
                  <TabsTrigger value="scenes">Scener</TabsTrigger>
                  <TabsTrigger value="settings">Indstillinger</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="devices"
                  className="text-sm text-muted-foreground"
                >
                  Indhold for enheder.
                </TabsContent>
                <TabsContent
                  value="scenes"
                  className="text-sm text-muted-foreground"
                >
                  Indhold for scener.
                </TabsContent>
                <TabsContent
                  value="settings"
                  className="text-sm text-muted-foreground"
                >
                  Indhold for indstillinger.
                </TabsContent>
              </Tabs>
            </div>
          </Example>
        </Section>

        <Section
          id="feedback"
          title="Feedback"
          description="Toasts til hændelser uden synligt resultat; inline-bekræftelse efter handlinger."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                toast("Godnat er aktiveret", {
                  description: "Alt lys er slukket, og døren er låst.",
                })
              }
            >
              Vis toast
            </Button>
            <ConfirmationFeedback message="Scenen er aktiveret" />
          </div>
        </Section>

        <Section
          id="tilstande"
          title="Tilstande"
          description="Standardtilstandene alle sider skal bruge: loading, tom og fejl."
        >
          <Example label="Skeletons">
            <div className="flex max-w-md flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          </Example>
          <Example label="Side-skeleton (loading.tsx)">
            <div className="max-w-2xl rounded-lg border border-border p-4">
              <PageSkeleton label="Indlæser eksempel" />
            </div>
          </Example>
          <Example label="Empty state">
            <div className="max-w-md rounded-lg border border-border">
              <EmptyState
                icon={Lightbulb}
                title="Ingen lamper i dette rum"
                description="Tilføj lamper via enhedsadministrationen."
                action={{
                  label: "Tilføj lampe",
                  onClick: () => toast("Ville tilføje"),
                }}
              />
            </div>
          </Example>
          <Example label="Error state">
            <div className="max-w-md rounded-lg border border-border">
              <ErrorState onRetry={() => toast("Prøver igen …")} />
            </div>
          </Example>
        </Section>
      </div>
    </TooltipProvider>
  );
}
