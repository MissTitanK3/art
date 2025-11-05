// Factions and reputation join types
export type Faction = {
  id: string
  name: string
  color?: string
  description?: string
}

export type ProfileFaction = {
  profile_id: string
  faction_id: string
  reputation: number
}

