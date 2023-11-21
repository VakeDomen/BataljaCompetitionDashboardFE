export interface GameAdditionalData {
    team2bot1: BotAdditionalData;
    team2bot2: BotAdditionalData;
    team1bot1: BotAdditionalData;
    team1bot2: BotAdditionalData;
}

export interface BotAdditionalData {
    turns_played: number;
    winner: boolean;
    fleet_generated: number;
    fleet_lost: number;
    fleet_reinforced: number;
    largest_attack: number;
    largest_loss: number;
    largest_reinforcement: number;
    planets_lost: number;
    planets_conquered: number;
    planets_defended: number;
    planets_attacked: number;
    num_fleet_lost: number;
    num_fleet_reinforced: number;
    num_fleet_generated: number;
    total_troops_generated: number;
}

