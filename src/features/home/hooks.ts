"use client";

import * as React from "react";

import type {
  ConnectionStatus,
  Device,
  DeviceId,
  Entity,
  EntityId,
  HomeSnapshot,
  Notification,
  Scene,
  SceneId,
} from "@/types";

import { useHomeProviderOrNull } from "./home-provider-context";

/** Forbindelsesstatus som reaktiv værdi (useSyncExternalStore over provideren). */
export function useConnectionStatus(): ConnectionStatus | null {
  const provider = useHomeProviderOrNull();
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (!provider) return () => undefined;
      return provider.subscribe((event) => {
        if (event.type === "connection") onChange();
      });
    },
    [provider],
  );
  return React.useSyncExternalStore(
    subscribe,
    () => (provider ? provider.getConnectionStatus() : null),
    () => null,
  );
}

export interface LiveHomeState {
  loading: boolean;
  error: boolean;
  snapshot: HomeSnapshot | null;
  entities: ReadonlyMap<EntityId, Entity>;
  devices: ReadonlyMap<DeviceId, Device>;
  scenes: ReadonlyMap<SceneId, Scene>;
  notifications: readonly Notification[];
  retry: () => void;
}

/**
 * Indlæser snapshot og holder entiteter/enheder opdateret via provider-events.
 * Genindlæser automatisk ved "resync" (efter genforbindelse).
 */
export function useLiveHome(): LiveHomeState {
  const provider = useHomeProviderOrNull();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [snapshot, setSnapshot] = React.useState<HomeSnapshot | null>(null);
  const [entities, setEntities] = React.useState<ReadonlyMap<EntityId, Entity>>(
    new Map(),
  );
  const [devices, setDevices] = React.useState<ReadonlyMap<DeviceId, Device>>(
    new Map(),
  );
  const [scenes, setScenes] = React.useState<ReadonlyMap<SceneId, Scene>>(
    new Map(),
  );
  const [notifications, setNotifications] = React.useState<
    readonly Notification[]
  >([]);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!provider) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const snap = await provider.getSnapshot();
        if (cancelled) return;
        setSnapshot(snap);
        setEntities(new Map(snap.entities.map((e) => [e.id, e])));
        setDevices(new Map(snap.devices.map((d) => [d.id, d])));
        setScenes(new Map(snap.scenes.map((s) => [s.id, s])));
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    void load();

    const unsubscribe = provider.subscribe((event) => {
      if (cancelled) return;
      switch (event.type) {
        case "entity":
          setEntities((prev) => {
            const next = new Map(prev);
            next.set(event.entity.id, event.entity);
            return next;
          });
          break;
        case "device":
          setDevices((prev) => {
            const next = new Map(prev);
            next.set(event.device.id, event.device);
            return next;
          });
          break;
        case "scene":
          setScenes((prev) => {
            const next = new Map(prev);
            next.set(event.scene.id, event.scene);
            return next;
          });
          break;
        case "notification":
          setNotifications((prev) =>
            [event.notification, ...prev].slice(0, 20),
          );
          break;
        case "resync":
          void load();
          break;
        default:
          break;
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [provider, reloadKey]);

  const retry = React.useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    loading,
    error,
    snapshot,
    entities,
    devices,
    scenes,
    notifications,
    retry,
  };
}

/** Én entitet, typet efter kind, live-opdateret. */
export function useLiveEntity<T extends Entity>(
  entities: ReadonlyMap<EntityId, Entity>,
  id: EntityId,
  kind: T["kind"],
): T | null {
  const entity = entities.get(id);
  if (!entity || entity.kind !== kind) return null;
  return entity as T;
}
