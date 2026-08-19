export interface QueueEvent {
  queueId: number | string;
}

export interface NowServingChangedEvent extends QueueEvent {
  number: number;
  deskId: number;
}

export interface NowServingEndedEvent extends QueueEvent {
  number: number;
  deskId: number;
}
