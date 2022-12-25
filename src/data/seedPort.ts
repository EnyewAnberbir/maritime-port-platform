import { PortDesk, type Command } from "../engine/runtime";

export const SEED_NAME = "maritime-port-platform";

const SEED_COMMANDS: Command[] = [
  { type: "announce", name: "Harbor Star", imo: "9321483", eta: "2015-03-11T06:00:00.000Z", draftDm: 112, flagged: true, risk: "medium" },
  { type: "announce", name: "Cedar Wave", imo: "9166778", eta: "2015-03-11T09:30:00.000Z", draftDm: 98 },
  { type: "announce", name: "Metro Tide", imo: "9311488", eta: "2015-03-12T04:15:00.000Z", draftDm: 121 },
  { type: "announce", name: "Oak Current", imo: "9108128", eta: "2015-03-12T14:00:00.000Z", draftDm: 105, risk: "high" },
  { type: "announce", name: "Pine Drift", imo: "9234563", eta: "2015-03-13T02:40:00.000Z", draftDm: 88 },
  { type: "announce", name: "Iron Quay", imo: "9412347", eta: "2015-03-13T18:20:00.000Z", draftDm: 134 },
  { type: "announce", name: "Silver Reach", imo: "8501232", eta: "2015-03-14T07:10:00.000Z", draftDm: 91, flagged: true },
  { type: "announce", name: "Baltic Hopper", imo: "8709872", eta: "2015-03-14T21:00:00.000Z", draftDm: 76 },
  { type: "announce", name: "Coral Ledger", imo: "9601118", eta: "2015-03-15T05:45:00.000Z", draftDm: 118, risk: "medium" },
  { type: "announce", name: "North Beacon", imo: "8802466", eta: "2015-03-15T16:30:00.000Z", draftDm: 102 },
  { type: "announce", name: "South Channel", imo: "9000003", eta: "2015-03-16T03:00:00.000Z", draftDm: 109, flagged: true, risk: "high" },
  { type: "announce", name: "West Pilot", imo: "9112234", eta: "2015-03-16T11:20:00.000Z", draftDm: 84 },
  { type: "announce", name: "East Fender", imo: "9223344", eta: "2015-03-17T01:50:00.000Z", draftDm: 97 },
