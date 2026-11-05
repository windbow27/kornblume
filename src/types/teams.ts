export interface ITeamCharacter {
  name: string;
  slug: string;
}

export interface ITeam {
  name: string;
  tier: string;
  damageType: string;
  // Each slot lists interchangeable characters (first is the primary pick).
  slots: ITeamCharacter[][];
}

export interface ITeamsData {
  source: string;
  scrapedAt: string;
  teams: ITeam[];
}
