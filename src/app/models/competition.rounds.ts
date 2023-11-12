export type Rounds = {
    [round: string]: [
        number, // points gained/lost in round
        string, // bot 1 id
        string, // bot 2 id
        string[]// vec of ids of games played in round
    ]
}