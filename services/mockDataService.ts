
export const PLAYER_MATCH_STATS_2023_24_CSV = `season,gameweek,match_date,home_team,away_team,team,opponent,venue,player_id,player,position,minutes,started,goals,assists,shots,shots_ot,xg,xa,pen_won,pen_conceded,pen_scored,pen_missed,pen_saves,saves,cs,goals_conceded,yellow,red,own_goal,touches,passes_acc
2023,1,2023-10-01,CHE,TOT,CHE,TOT,H,101,S. Kerr,FWD,90,1,1,1,5,3,1.2,0.6,0,0,0,0,0,0,0,1,0,0,0,45,20
2023,1,2023-10-01,CHE,TOT,TOT,CHE,A,201,B. England,FWD,90,1,0,0,2,1,0.3,0.1,0,0,0,0,0,0,0,2,0,0,0,30,15
2023,1,2023-10-01,ARS,LIV,ARS,LIV,H,301,K. McCabe,DEF,90,1,0,1,3,1,0.2,0.5,0,0,0,0,0,0,1,0,1,0,0,80,60
2023,1,2023-10-01,ARS,LIV,ARS,LIV,H,302,V. Miedema,FWD,75,1,1,0,4,2,0.9,0.2,0,0,0,0,0,0,1,0,0,0,0,50,30
2023,2,2023-10-08,MUN,ARS,MUN,ARS,H,401,M. Earps,GK,90,1,0,0,0,0,0.0,0.0,0,0,0,0,1,5,1,0,0,0,0,40,30
2023,2,2023-10-08,MUN,ARS,ARS,MUN,A,301,K. McCabe,DEF,90,1,0,0,1,0,0.1,0.2,0,0,0,0,0,0,0,1,0,0,0,70,55
2023,2,2023-10-08,CHE,WHU,CHE,WHU,H,101,S. Kerr,FWD,90,1,2,0,6,4,1.8,0.1,1,0,1,0,0,0,1,0,0,0,0,55,25
2023,3,2023-10-15,LIV,EVE,LIV,EVE,H,501,M. Haug,FWD,80,1,1,0,3,2,0.8,0.1,0,0,0,0,0,0,0,1,0,0,0,40,20
2023,3,2023-10-15,MUN,LEI,MUN,LEI,H,401,M. Earps,GK,90,1,0,0,0,0,0.0,0.0,0,0,0,0,0,2,0,1,0,0,0,35,25
2023,4,2023-10-22,ARS,MCI,ARS,MCI,H,302,V. Miedema,FWD,90,1,1,1,3,2,0.7,0.4,0,0,0,0,0,0,1,0,0,0,0,60,40
2023,4,2023-10-22,ARS,MCI,MCI,ARS,A,601,K. Shaw,FWD,90,1,0,0,4,1,0.6,0.2,0,0,0,0,0,0,0,1,0,0,0,40,25
2023,5,2023-11-05,CHE,AVL,CHE,AVL,H,101,S. Kerr,FWD,85,1,1,0,4,2,1.1,0.3,0,0,0,0,0,0,1,0,0,0,0,50,30
`;

export const PLAYER_MATCH_STATS_2022_23_CSV = `season,gameweek,match_date,home_team,away_team,team,opponent,venue,player_id,player,position,minutes,started,goals,assists,shots,shots_ot,xg,xa,pen_won,pen_conceded,pen_scored,pen_missed,pen_saves,saves,cs,goals_conceded,yellow,red,own_goal,touches,passes_acc
2022,22,2023-05-27,MUN,LIV,MUN,LIV,H,401,M. Earps,GK,90,1,0,0,0,0,0.0,0.0,0,0,0,0,0,3,1,0,0,0,0,33,21
2022,22,2023-05-27,CHE,REA,CHE,REA,A,101,S. Kerr,FWD,90,1,2,0,7,5,2.1,0.2,0,0,0,0,0,0,1,0,0,0,0,58,22
`;


export const FIXTURES_2023_24_CSV = `gameweek,match_date,home_team,away_team
6,2023-11-12,ARS,LEI
6,2023-11-12,CHE,EVE
6,2023-11-12,MCI,LIV
6,2023-11-12,MUN,WHU
6,2023-11-12,TOT,AVL
7,2023-11-19,LEI,TOT
22,2024-05-18,AVL,TOT
`;

export const getMockSquadAvailability = (): string => `player_id,prob_starts,injury_flag
101,0.95,0
201,0.80,0
301,1.00,0
302,0.25,1
401,1.00,0
601,0.98,0
501,0.90,0
`;

export const getMockTeamRatings = (): string => `team,att_strength,def_strength,pace
ARS,1.25,1.20,16
CHE,1.35,1.25,18
MCI,1.30,1.15,17
MUN,1.15,1.10,15
TOT,0.95,0.90,12
LIV,0.90,0.95,13
AVL,0.85,0.88,11
EVE,0.80,0.85,10
LEI,0.75,0.80,9
WHU,0.82,0.87,11
`;

export const getMockPopularity = (): string => `player_id,selected_percent
101,45.5
301,25.2
401,30.1
601,35.8
302,5.1
501,1.8
`;

export const getMockPrices = (): string => `player_id,price_m
101,12.5
201,8.0
301,7.0
302,10.5
401,5.5
601,11.5
501,7.5
`;
