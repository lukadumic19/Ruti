import type {
  ConnectionStatus,
  Entity,
  EntityId,
  HomeEvent,
  HomeSnapshot,
  SceneExecutionResult,
  SceneId,
  ServiceCall,
  ServiceResult,
} from "@/types";

export type Unsubscribe = () => void;

/**
 * Adapter-interfacet mellem UI og datakilden (ADR-0012).
 * Brugerfladen kender KUN dette interface og kan ikke se forskel på
 * mock-data (MockHomeProvider) og rigtig Home Assistant (Fase 3:
 * en tynd klient mod BFF'en, der implementerer samme interface).
 *
 * Ingen React-afhængigheder her (TECHNICAL_ARCHITECTURE §3-regler).
 */
export interface HomeProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  /** Komplet øjebliksbillede – kaldes ved opstart og efter "resync"-event. */
  getSnapshot(): Promise<HomeSnapshot>;
  getEntities(): Promise<readonly Entity[]>;
  getEntity(id: EntityId): Promise<Entity | undefined>;

  /** Udfør en typet kommando. Afvises med typet fejlkode – kaster aldrig. */
  callService(call: ServiceCall): Promise<ServiceResult>;
  /** Udfør en scene med resultat pr. handling (FEATURE_REQUIREMENTS §4). */
  executeScene(id: SceneId): Promise<SceneExecutionResult>;

  getConnectionStatus(): ConnectionStatus;
  /** Realtidsopdateringer. Returnerer afmeldingsfunktion. */
  subscribe(listener: (event: HomeEvent) => void): Unsubscribe;
}
